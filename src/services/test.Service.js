import { HIGH_LIMIT } from "../constant/constant.commom";
import db from "../models";
const testService = async () => {
  try {
    // const results = db.User.findAll({
    //   attributes: {
    //     exclude: ["roleID"], //bỏ field này đi
    //   },
    //   include: [{ model: db.Role }], //lấy hết
    //   raw: true,
    //   nest: true, // khi trả ra api nó sẽ nhìn clean .. nằm trong {}
    // });

    // const results = await db.ProductDetails.findOne({
    //   where: { "properties.size": 3 },
    // });
    // console.log("🚀 ~ testService ~ results:", results);

    const getFullProduct = await db.Product.findAll({
      limit: HIGH_LIMIT,
      include: [
        { model: db.ProductDetails },
        { model: db.ProductImage, as: "image" },
      ],
    });

    // Lặp qua mảng để lấy dữ liệu từ mỗi đối tượng
    const nodedata = getFullProduct.map((product) =>
      product.get({ plain: true })
    );

    nodedata.map((item) => {
      console.log("🚀 ~ testService ~ item:", item.ProductDetails);
    });

    console.log("🚀 ~ testService ~ getFullProduct:", nodedata);
    return getFullProduct;
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

export { testService };
