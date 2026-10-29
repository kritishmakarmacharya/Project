import { type Request, type Response, NextFunction } from "express";
import slugify from "slugify";
import prodSvc from "./product.service";
import { imageMap } from "../../utilities/helpers";
import ProductModel from "./product.model";

type filterType =
  | string
  | Array<Record<string, string | RegExp>>
  | Record<string, string>
  | RegExp;
export default class Productontroller {
  async addProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      data.slug = await prodSvc.checkUniqueSlug(
        slugify(data.name, {
          lower: true,
          replacement: "-",
          trim: true,
          remove: /[*+~.()'"!:@]/g,
        }),
      );
      // Frontend if is in Rupee -> store it in paisa
      data.price = data.price * 100;

      data.afterDiscount = data.price = (data.price * data.discount) / 100;
      data.seller = data.seller ?? req.loggedInUser?._id;
      data.status = "active";
      data.createdBy = req.loggedInUser?._id;

      if (req.files) {
        const files = req.files as unknown as Array<Express.Multer.File>;
        data.images = [];

        files.map((image: Express.Multer.File) => {
          data.images.push(imageMap(image, "products/"));
        });
      }

      //mongodb data entry
      const product = new ProductModel(data);
      await product.save();

      res.json({
        data: product,
        message: "product created",
        meta: null,
      });
    } catch (exception) {
      next(exception);
    }
  }

  async listAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      let filter: Record<string, filterType> = {};

      //list by admin - all products

      //list  by seller - only products created by seller
      if (req.loggedInUser?.role === "seller") {
        filter = {
          seller: req.loggedInUser._id.toString(),
        };
      }
      // 1000
      // search
      if (req.query.search) {
        filter = {
          ...filter,
          $or: [
            { category: new RegExp(req.query.search as string, "i") },
            { brand: new RegExp(req.query.search as string, "i") },
            { name: new RegExp(req.query.search as string, "i") },
            { description: new RegExp(req.query.search as string, "i") },
          ],
        };
      }
      if (req.query.status) {
        filter = {
          ...filter,
          status: req.query.status as string,
        };
      }
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      // 1-100 => 1st page => 1-10, 2nd page => 11-20 ,.....
      // page 1 => skip = 0(1-20)
      // page 2 => skip = 20(21-40)
      // page 3 => skip =40(41-60)

      const skip = (page - 1) * limit;

      const data = await ProductModel.find(filter)
        .populate("seller", [
          "_id",
          "name",
          "email",
          "address",
          "image",
          "role",
        ])
        .sort({ createAt: "desc" })
        .skip(skip)
        .limit(limit);
    } catch (exception) {
      next(exception);
    }
  }
}
