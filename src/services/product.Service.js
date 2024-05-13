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
      include: [
        { model: db.ProductDetails },
        { model: db.ProductImage, as: "image" },
      ],
      where: whereCondition,
      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
      order: [
        [{ model: db.ProductImage, as: "image" }, "default", "DESC"], // Sắp xếp theo trường 'default', giảm dần (true sẽ được đưa lên đầu)
      ],
    });
    const resultsJson = JSON.stringify(results, null, 2); // Biến JSON thành chuỗi
    const resultsParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

    // Parse chuỗi JSON trong thuộc tính "properties" của từng phần tử trong mảng "ProductDetails"
    // const parsedResults = resultsParse.map((item) => {
    //   const parsedProductDetails = item.ProductDetails.map((detail) => {
    //     let parsedProperties = {};

    //     try {
    //       parsedProperties = JSON.parse(detail.properties || "{}");

    //       // Kiểm tra xem có thuộc tính size trong properties không

    //       const box = async () => {
    //         // Tìm tiêu đề tương ứng từ bảng AttributeValue
    //         const size = await db.AttributeValue.findOne({
    //           where: { id: parsedProperties.size },
    //           raw: true,
    //         });
    //         // console.log("🚀 ~ p1 ~ size:", size);
    //         if (size) {
    //           console.log("🚀 ~ box ~ parsedProperties:", size.description);
    //           parsedProperties.size = size.description;
    //         }

    //         // // Kiểm tra xem có thuộc tính color trong properties không
    //         if (parsedProperties.color) {
    //           // Tìm tiêu đề tương ứng từ bảng AttributeValue
    //           const color = await db.AttributeValue.findOne({
    //             where: { id: parsedProperties.color },
    //             raw: true,
    //           });
    //           if (color) {
    //             parsedProperties.color = color.description;
    //           }
    //         }
    //       };

    //       box();

    //       // parsedProperties.size = "okok";
    //     } catch (error) {
    //       console.error("Error parsing JSON:", error);
    //     }

    //     return {
    //       ...detail,
    //       properties: parsedProperties,
    //     };
    //   });

    //   // const bbb = parsedProductDetails.map(async (item) => {
    //   //   const a = await db.AttributeValue.findOne({
    //   //     where: { id: item.properties.size },
    //   //     raw: true,
    //   //   });
    //   //   return a.description;
    //   // });

    //   return {
    //     ...item,
    //     ProductDetails: parsedProductDetails,
    //   };
    // });

    const parsedResults = await Promise.all(
      resultsParse.map(async (item) => {
        const parsedProductDetails = await Promise.all(
          item.ProductDetails.map(async (detail) => {
            let parsedProperties = {};

            try {
              parsedProperties = JSON.parse(detail.properties || "{}"); // từ JSON chuyển đồi sang js

              // Tìm tiêu đề tương ứng từ bảng AttributeValue
              const size = await db.AttributeValue.findOne({
                where: { id: parsedProperties.size },
                raw: true,
              });

              // Kiểm tra xem có thuộc tính size trong properties không
              if (size) {
                console.log("🚀 ~ box ~ parsedProperties:", size.description);
                parsedProperties.size = size.description;
              }

              // Kiểm tra xem có thuộc tính color trong properties không
              if (parsedProperties.color) {
                // Tìm tiêu đề tương ứng từ bảng AttributeValue
                const color = await db.AttributeValue.findOne({
                  where: { id: parsedProperties.color },
                  raw: true,
                });
                if (color) {
                  parsedProperties.color = color.description;
                }
              }
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }

            return {
              ...detail,
              properties: parsedProperties,
            };
          })
        );

        return {
          ...item,
          ProductDetails: parsedProductDetails,
        };
      })
    );

    return res.status(OK).json(
      success(parsedResults, {
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
    const productId = parseInt(req.params.id);

    const isProduct = await db.Product.findByPk(productId);

    if (isProduct) {
      const results = await db.Product.findOne({
        where: { id: productId },
        include: [
          { model: db.ProductDetails },
          { model: db.ProductImage, as: "image" },
        ],

        order: [
          [{ model: db.ProductImage, as: "image" }, "default", "DESC"], // Sắp xếp theo trường 'default', giảm dần (true sẽ được đưa lên đầu)
        ],
      });
      const resultsJson = JSON.stringify(results, null, 2); // Biến JSON thành chuỗi
      const resultsParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

      const parsedProductDetails = await Promise.all(
        resultsParse.ProductDetails.map(async (detail) => {
          let parsedProperties = {};

          try {
            parsedProperties = JSON.parse(detail.properties || "{}"); // từ JSON chuyển đồi sang js

            // Tìm tiêu đề tương ứng từ bảng AttributeValue
            const size = await db.AttributeValue.findOne({
              where: { id: parsedProperties.size },
              raw: true,
            });

            // Kiểm tra xem có thuộc tính size trong properties không
            if (size) {
              parsedProperties.size = size.description;
            }

            // Kiểm tra xem có thuộc tính color trong properties không
            if (parsedProperties.color) {
              // Tìm tiêu đề tương ứng từ bảng AttributeValue
              const color = await db.AttributeValue.findOne({
                where: { id: parsedProperties.color },
                raw: true,
              });
              if (color) {
                parsedProperties.color = color.description;
              }
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }

          return {
            ...detail,
            properties: parsedProperties,
          };
        })
      );

      const data = {
        ...resultsParse,
        ProductDetails: parsedProductDetails,
      };

      return res.status(OK).json(success(data));
    } else {
      return res.status(NOT_FOUND).json(success("Sản phẩm không tồn tại"));
    }
  } catch (error) {
    console.log("🚀 ~ GetAllProductService ~ error:", error);
  }
};

export { GetAllProductService, getDetailsProduct };
