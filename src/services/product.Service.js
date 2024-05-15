import { parsePricetoVn } from "../commom/funtion";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import {
  productValidate,
  updateQuantityVariantValidate,
  updateproductValidate,
} from "../validate/product.Validate";

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
        { model: db.Rating },
      ],
      where: whereCondition,
      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
      order: [
        ["createdAt", "DESC"],
        [{ model: db.ProductImage, as: "image" }, "default", "DESC"], // Sắp xếp theo trường 'default', giảm dần (true sẽ được đưa lên đầu)
      ],
    });
    const resultsJson = JSON.stringify(results, null, 2); // Biến JSON thành chuỗi để cho đúng định dạng
    const resultsParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

    // mục đích chuyển đổi trong productDetails từ hiển thị id ra name
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

    // lấy  điểm đánh giá
    const overview = parsedResults.map((item) => {
      const sumRate = item?.Ratings?.reduce(
        (accumulator, currentValue) =>
          accumulator + parseInt(currentValue.rate),
        0
      );
      const averageRate = Math.round(sumRate / item.Ratings.length);

      return { ...item, pointRate: averageRate ? averageRate : 0 };
    });

    return res.status(OK).json(
      success(overview, {
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
          { model: db.Rating },
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
// get quantityvariant
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
//add Product
const addProductService = async (req, res) => {
  try {
    const validationResult = productValidate.validate(req.body);

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const categoryId = parseInt(req.body.categoryId);
    const discount = parseInt(req.body.discount);
    const price = parseInt(req.body.price);
    const quantity = parseInt(req.body.quantity);

    const { name, description, properties, image } = req.body;

    const result1 = await db.Product.create({
      name: name,
      categoryId: categoryId,
      description: description,
      price: price,
      discount: discount,
      total: Math.floor(price * ((100 - discount) / 100)),
      sold: 0,
      averageRating: 0,
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

      // thêm ảnh, link ảnh đầu tiên trong mảng là ảnh chính
      for (let i = 0; i <= image.length - 1; i++) {
        const AddArrImg = await db.ProductImage.create({
          default: i === 0 ? true : false,
          url: image[i],
          productId: result1.id,
        });
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
//update Product
const updateProductService = async (req, res) => {
  try {
    const validationResult = updateproductValidate.validate(req.body);

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const idProduct = parseInt(req.params.id);

    const isProduct = await db.Product.findByPk(idProduct);

    if (!isProduct) {
      return res.status(NOT_FOUND).json(error("Product không tồn tại!"));
    }

    const categoryId = parseInt(req.body.categoryId);
    const discount = parseInt(req.body.discount);
    const price = parseInt(req.body.price);

    const { name, description, image } = req.body;

    const result1 = await db.Product.update(
      {
        name: name,
        categoryId: categoryId,
        description: description,
        price: price,
        discount: discount,
        total: Math.floor(price * ((100 - discount) / 100)),
      },
      { where: { id: idProduct } }
    );

    // nếu sản phẩm có ảnh rồi update ảnh, chưa có thì thêm ảnh, link ảnh đầu tiên trong mảng là ảnh chính
    const ArrImg = await db.ProductImage.findAll({
      where: { productId: idProduct },
      raw: true,
    });

    if (ArrImg.length > 0) {
      const updatePromises = ArrImg.map((img, i) => {
        return db.ProductImage.update(
          {
            default: i === 0 ? true : false,
            url: image[i],
            productId: idProduct,
          },
          { where: { id: img.id } }
        );
      });

      await Promise.all(updatePromises);
    } else {
      const addPromises = image.map((imgUrl, i) => {
        return db.ProductImage.create({
          default: i === 0 ? true : false,
          url: imgUrl,
          productId: idProduct,
        });
      });

      await Promise.all(addPromises);
    }

    if (result1) {
      return res.status(OK).json(success("Cập nhật thành công !"));
    } else {
      return res.status(BAD_REQUEST).json(success("Cập nhật thất bại !"));
    }
  } catch (error) {
    console.log("🚀 ~ addProductService ~ error:", error);
  }
};

//update quantity Variant
const updateQuantityVariantService = async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity);

    const validationResult = updateQuantityVariantValidate.validate({
      quantity: quantity,
    });

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const idSize = parseInt(req.body.idSize);
    const idColor = parseInt(req.body.idColor);
    const idProductVariant = parseInt(req.params.id);

    const updateQuantity = await db.ProductDetails.update(
      {
        quantity: quantity,
      },
      {
        where: {
          id: idProductVariant,
          properties: { size: idSize, color: idColor },
        },
      }
    );

    if (updateQuantity) {
      return res.status(OK).json(success("Cập nhật thành công !"));
    } else {
      return res.status(BAD_REQUEST).json(success("Cập nhật thất bại!"));
    }
  } catch (error) {
    console.log("🚀 ~ updateQuantityVariantService ~ error:", error);
  }
};

//delete Product;
const deleteProductService = async (req, res) => {
  try {
    const idProduct = parseInt(req.params.id);

    const deleteProduct = await db.Product.destroy({
      where: { id: idProduct },
    });

    if (deleteProduct) {
      return res.status(OK).json(success("Xóa thành công !"));
    } else {
      return res.status(BAD_REQUEST).json(success("Xóa thất bại !"));
    }
  } catch (error) {
    console.log("🚀 ~ deleteProduct ~ error:", error);
  }
};

//delete Variant Product;
const deleteVariantProductService = async (req, res) => {
  try {
    const idProductVariant = parseInt(req.params.id);

    const deleteVariantProduct = await db.ProductDetails.destroy({
      where: { id: idProductVariant },
    });

    if (deleteVariantProduct) {
      return res.status(OK).json(success("Xóa thành công !"));
    } else {
      return res.status(BAD_REQUEST).json(success("Xóa thất bại !"));
    }
  } catch (error) {
    console.log("🚀 ~ deleteVariantProduct ~ error:", error);
  }
};

//filter Product

const filterProductService = async (req, res) => {
  // còn filter theo rate
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name;
    const category = parseInt(req.query.category);
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy === "asc" ? "ASC" : "DESC";
    const minPrice = parseInt(req.query.minPrice); // Giá thấp nhất
    const maxPrice = parseInt(req.query.maxPrice); // Giá cao nhất
    const rate = parseInt(req.query.rate);
    const sizes = req.query.sizes ? req.query.sizes.split(",").map(Number) : []; // Kích cỡ, chuyển thành mảng số

    // filter name
    const whereCondition = {};
    if (name) {
      whereCondition.name = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    //filter category
    if (category) {
      whereCondition.categoryId = parseInt(category);
    }

    //filter averageRating
    if (rate) {
      whereCondition.averageRating = parseInt(rate);
    }

    //filter theo khoảng giá gte: >= ; lte: <=
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      whereCondition.total = {
        [db.Sequelize.Op.gte]: minPrice,
        [db.Sequelize.Op.lte]: maxPrice,
      };
    } else if (!isNaN(minPrice)) {
      whereCondition.total = {
        [db.Sequelize.Op.gte]: minPrice,
      };
    } else if (!isNaN(maxPrice)) {
      whereCondition.total = {
        [db.Sequelize.Op.lte]: maxPrice,
      };
    }

    const includeCondition = [
      {
        model: db.ProductDetails,
        where:
          sizes.length > 0
            ? {
                properties: {
                  [db.Sequelize.Op.or]: sizes.map((size) => ({
                    size,
                  })),
                },
              }
            : null,
        // required: true, // Đảm bảo chỉ trả về các sản phẩm có ProductDetails
      },
      {
        model: db.ProductImage,
        as: "image",
      },
      {
        model: db.Rating,
      },
    ];

    // phục vụ lấy tổng kết quả tìm được

    const getFullProduct = await db.Product.findAll({
      include: includeCondition,
      where: whereCondition,
    });

    const resultsJson = JSON.stringify(getFullProduct, null, 2); // Biến JSON thành chuỗi
    const getFullProductParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript
    //-----------------------------------------------

    const results = await db.Product.findAll({
      include: includeCondition,
      where: whereCondition,

      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
      order: [
        ["createdAt", sortBy], // Sắp xếp theo 'createdAt'
        [{ model: db.ProductImage, as: "image" }, "default", "DESC"], // Sắp xếp theo trường 'default', giảm dần (true sẽ được đưa lên đầu)
      ],
    });

    return res.status(OK).json(
      success(results, {
        page: page,
        limit: limit,
        totalPages: parseInt(Math.ceil(getFullProduct.length / limit)),
        totalResults: getFullProductParse.length,
      })
    );
  } catch (error) {
    console.log("🚀 ~ GetAllProductService ~ error:", error);
  }
};
export {
  GetAllProductService,
  getDetailsProduct,
  getQuantityvariantService,
  addProductService,
  updateProductService,
  updateQuantityVariantService,
  deleteProductService,
  deleteVariantProductService,
  filterProductService,
};
