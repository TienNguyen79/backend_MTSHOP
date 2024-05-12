import { BAD_REQUEST, NOT_FOUND, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";

const GetAllProductService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name;
    const category = parseInt(req.query.category);

    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (name) {
      whereCondition.name = { [db.Sequelize.Op.like]: `%${name}%` };
    }
    if (category) {
      whereCondition.categoryId = parseInt(category);
    }

    const getFullProduct = await db.Product.findAll({
      where: whereCondition,
      raw: true,
      nest: true,
      limit: 9999,
    });

    const results = await db.Product.findAll({
      include: [{ model: db.ProductImage, as: "image" }],
      where: whereCondition,
      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
    });
    const resultsJson = JSON.stringify(results, null, 2); // Biến JSON thành chuỗi
    const resultsParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

    const mergeP = resultsParse.map((item) => {
      const imagePrimary = item?.image?.find((item) => item.default); //default : true

      return { ...item, imagePrimary: imagePrimary?.url };
    });
    return res.status(OK).json(
      success(mergeP, {
        page: page,
        limit: limit,
        totalPages: parseInt(Math.ceil(getFullProduct.length / limit)),
        totalResults: getFullProduct.length,
      })
    );
  } catch (error) {
    console.log("🚀 ~ GetAllProductService ~ error:", error);
  }
};

const getDetailsProduct = async (req, res) => {
  try {
    const overview = await db.Product.findAll({
      include: [
        {
          model: db.ProductVariant,
          include: [
            {
              model: db.VariantAttributeValue,
              attributes: {
                exclude: [
                  "attributeValueId",
                  "productVariantId",
                  "attributeId",
                  "createdAt",
                  "updatedAt",
                ],
              },
              // where: { attributeId: 2, attributeValueId: 6 },
              include: [
                {
                  model: db.AttributeValue,
                  // where: {
                  //   attributeId: { [db.Sequelize.Op.in]: [1, 2] }, // Lọc các giá trị size và color
                  // },
                  // attributes: ["id", "name"], // Chỉ lấy các trường id và name của AttributeValue
                },
              ],
            },
          ],
        },
      ],
    });
    console.log("🚀 ~ GetAllProductService ~ overview:", overview.length);

    const overviewJson = JSON.stringify(overview, null, 4); // Biến JSON thành chuỗi
    const overviewObject = JSON.parse(overviewJson); // Chuyển chuỗi JSON thành đối tượng JavaScript
    console.log(
      "🚀 ~ getDetailsProduct ~ overviewObject:",
      overviewObject.ProductVariants
    );

    return res.status(OK).json(success(overview));
  } catch (error) {
    console.log("🚀 ~ GetAllProductService ~ error:", error);
  }
};

export { GetAllProductService, getDetailsProduct };
