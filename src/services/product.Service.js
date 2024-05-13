import { parsePricetoVn } from "../commom/funtion";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";

// get all product
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

// get 1 product
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

            //custom  lại thay vì trả ra mỗi id thì ra cả tên tương ứng với mỗi id
            // Kiểm tra xem có thuộc tính size trong properties không
            if (size) {
              parsedProperties.size = {
                id: parsedProperties.size,
                description: size.description,
              };
            }

            // Kiểm tra xem có thuộc tính color trong properties không
            if (parsedProperties.color) {
              // Tìm tiêu đề tương ứng từ bảng AttributeValue
              const color = await db.AttributeValue.findOne({
                where: { id: parsedProperties.color },
                raw: true,
              });
              if (color) {
                parsedProperties.color = {
                  id: parsedProperties.color,
                  description: color.description,
                };
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

      //lấy ra mảng size và color duy nhất phục vụ cho FE làm nhanh là chính :))

      const uniqueSizes = [];
      const uniqueColors = [];

      parsedProductDetails.forEach((item) => {
        const { size, color } = item.properties;

        // Thêm size vào mảng uniqueSizes nếu chưa tồn tại
        const existingSize = uniqueSizes.find((s) => s.id === size.id);
        if (!existingSize) {
          uniqueSizes.push(size);
        }

        // Thêm color vào mảng uniqueColors nếu chưa tồn tại
        const existingColor = uniqueColors.find((c) => c.id === color.id);
        if (!existingColor) {
          uniqueColors.push(color);
        }
      });

      const result2 = {
        ArrUniqueSize: uniqueSizes,
        ArrUniqueColor: uniqueColors,
      };

      const data = {
        ...resultsParse,
        ProductDetails: parsedProductDetails,
        productVariantUnique: result2,
      };

      return res.status(OK).json(success(data));
    } else {
      return res.status(NOT_FOUND).json(success("Sản phẩm không tồn tại"));
    }
  } catch (error) {
    console.log("🚀 ~ GetAllProductService ~ error:", error);
  }
};

const getQuantityvariantService = async (req, res) => {
  try {
    const productid = parseInt(req.params.id);
    const sizeId = parseInt(req.body.sizeId);
    const colorId = parseInt(req.body.colorId);

    const whereCondition = {};
    if (sizeId) {
      whereCondition.size = sizeId;
    }
    if (colorId) {
      whereCondition.color = colorId;
    }
    const results = await db.ProductDetails.findOne({
      where: { properties: whereCondition, productId: productid },
    });
    return res.status(OK).json(success(results));
  } catch (error) {
    console.log("🚀 ~ getQuantityvariant ~ error:", error);
  }
};

const addProductService = async (req, res) => {
  try {
    const categoryId = parseInt(req.body.categoryId);
    const discount = parseInt(req.body.discount);
    const price = parseInt(req.body.price);
    const quantity = parseInt(req.body.quantity);

    const { name, description, properties } = req.body;

    const result1 = await db.Product.create({
      name: name,
      categoryId: categoryId,
      description: description,
      price: price,
      discount: discount,
      total: Math.floor(price * ((100 - discount) / 100)),
      sold: 0,
    });

    //nếu tạo sản phẩm thành công
    if (result1) {
      for (const idSize of properties.arrSize) {
        for (const idColor of properties.arrColor) {
          const results2 = await db.ProductDetails.create({
            productId: result1.id,
            quantity: quantity || 10,
            properties: { size: idSize, color: idColor },
          });
        }
      }

      // phần dưới cop giống GetproductDetails
      const productId = parseInt(result1.id);

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
                parsedProperties.size = {
                  id: parsedProperties.size,
                  description: size.description,
                };
              }

              // Kiểm tra xem có thuộc tính color trong properties không
              if (parsedProperties.color) {
                // Tìm tiêu đề tương ứng từ bảng AttributeValue
                const color = await db.AttributeValue.findOne({
                  where: { id: parsedProperties.color },
                  raw: true,
                });
                if (color) {
                  parsedProperties.color = {
                    id: parsedProperties.color,
                    description: color.description,
                  };
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

        //lấy ra mảng size và color duy nhất phục vụ cho FE làm nhanh là chính :))

        const uniqueSizes = [];
        const uniqueColors = [];

        parsedProductDetails.forEach((item) => {
          const { size, color } = item.properties;

          // Thêm size vào mảng uniqueSizes nếu chưa tồn tại
          const existingSize = uniqueSizes.find((s) => s.id === size.id);
          if (!existingSize) {
            uniqueSizes.push(size);
          }

          // Thêm color vào mảng uniqueColors nếu chưa tồn tại
          const existingColor = uniqueColors.find((c) => c.id === color.id);
          if (!existingColor) {
            uniqueColors.push(color);
          }
        });

        const result2 = {
          ArrUniqueSize: uniqueSizes,
          ArrUniqueColor: uniqueColors,
        };

        const data = {
          ...resultsParse,
          ProductDetails: parsedProductDetails,
          productVariantUnique: result2,
        };

        return res.status(OK).json(success(data));
      } else {
        return res.status(NOT_FOUND).json(error("Không có sản phẩm này!"));
      }
    }
  } catch (error) {
    console.log("🚀 ~ addProductService ~ error:", error);
  }
};

export {
  GetAllProductService,
  getDetailsProduct,
  getQuantityvariantService,
  addProductService,
};
