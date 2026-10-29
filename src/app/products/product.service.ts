import { generateOTP } from "../../utilities/helpers";
import ProductModel from "./product.model";

class ProductService {
  async checkUniqueSlug(slug: string): Promise<string> {
    const exists = await ProductModel.findOne({
      slug: slug,
    });
    if (exists) {
      //found
      slug += "-" + generateOTP(4);
    } else {
      //unique
      return slug;
    }
  }
}

//export default ProductService
export default new ProductService();
