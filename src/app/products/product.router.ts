import { Router } from "express";
import uploader from "../../middlewares/UploaderMiddleware";
import auth from "../../middlewares/AuthMiddleware";
import ProductController from "./product.controller";
import bodyValidator from "../../middlewares/BodyValidatorMiddleware";
import { productCreateDTO } from "./product.dto";

const productCtrl = new ProductController();
const ProductRouter = Router();

ProductRouter.post(
  "/",
  auth(),
  uploader("products/").array("images"),
  bodyValidator(productCreateDTO),
  productCtrl.addProduct,
);
ProductRouter.get("/", auth(), productCtrl.listAllProducts);
export default ProductRouter;
