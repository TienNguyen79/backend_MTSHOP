import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { parsePricetoVn } from "../commom/funtion";
import { HIGH_LIMIT } from "../constant/constant.commom";
import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import {
  productValidate,
  reviewProductValidate,
  updateQuantityVariantValidate,
  updateproductValidate,
} from "../validate/product.Validate";
import { configs } from "../config/config.jwtkey";
// get all product
const GetAllProductService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name;
    const category = parseInt(req.query.category);
    const topSold = req.query.topSold;
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
      limit: HIGH_LIMIT,
    });

    const orderCondition = [];
    if (topSold === "desc") {
      orderCondition.push(["sold", "DESC"]); // Sắp xếp theo số lượng bán giảm dần
    }
    orderCondition.push(["createdAt", "DESC"]);
    orderCondition.push([
      { model: db.ProductImage, as: "image" },
      "default",
      "DESC",
    ]); // Sắp xếp theo trường 'default', giảm dần

    const results = await db.Product.findAll({
      include: [
        { model: db.ProductDetails },
        { model: db.ProductImage, as: "image" },
        { model: db.Rating },
      ],
      where: whereCondition,
      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
      order: orderCondition,
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
        model: db.Category,
      },
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

      attributes: {
        exclude: ["categoryId"], //bỏ field này đi
      },

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

// suggestProductsService : kiểu gợi ý các sản phẩm có trong cùng đơn hàng mà hiện ra phải khác id với sản phẩm ban đầu
const suggestProductsService = async (req, res) => {
  try {
    const id_product = req.params.id;

    // Bước 1: Tìm các productDetailsId từ productId
    const productDetails = await db.ProductDetails.findAll({
      where: { productId: id_product },
      attributes: ["id"],
      raw: true,
    });
    const productDetailsIds = productDetails.map((pd) => pd.id); //[ 31, 32, 33, 34, 35, 36 ]
    console.log(
      "🚀 ~ suggestProductsService ~ productDetailsIds:",
      productDetailsIds
    );

    // Bước 2: Tìm các đơn hàng chứa các productDetailsId này
    const orderDetails = await db.OrderDetails.findAll({
      where: { productDetailsId: productDetailsIds },
      attributes: ["orderId"],
      raw: true,
    });
    console.log("🚀 ~ suggestProductsService ~ orderDetails:", orderDetails);
    const orderIds = orderDetails.map((orderDetail) => orderDetail.orderId); //[ 4, 5, 2, 8 ]

    // Bước 3: Tìm các productDetailsId khác trong các đơn hàng đó
    const products = await db.OrderDetails.findAll({
      where: {
        orderId: orderIds,
        productDetailsId: { [Op.notIn]: productDetailsIds },
      },
      attributes: ["productDetailsId"],
      raw: true,
    });
    const productIds = products.map((product) => product.productDetailsId);
    console.log("🚀 ~ suggestProductsService ~ productIds:", productIds);

    // Bước 4: Đếm tần suất xuất hiện của từng sản phẩm và chuyển từ productDetailsId sang productId
    const prob_array = {};
    for (const productDetailsId of productIds) {
      const productDetail = await db.ProductDetails.findOne({
        where: { id: productDetailsId },
        attributes: ["productId"],
        raw: true,
      });
      console.log(
        "🚀 ~ suggestProductsService ~ productDetail:",
        productDetail
      );

      if (productDetail) {
        const productId = productDetail.productId;

        if (prob_array[productId]) {
          prob_array[productId] += 1;
        } else {
          prob_array[productId] = 1;
        }
      }
    }

    console.log("🚀 ~ suggestProductsService ~ prob_array:", prob_array);

    // Bước 5: Sắp xếp sản phẩm theo tần suất xuất hiện và lấy danh sách gợi ý
    const sortedProducts = Object.entries(prob_array).sort(
      (a, b) => b[1] - a[1]
    ); ////entries để chuyển thành kiểu như   [ [ '2', 4 ], [ '4', 2 ], [ '5', 2 ], [ '1', 1 ], [ '3', 1 ] ]

    let suggestedProductIds = sortedProducts.map((product) => product[0]);
    suggestedProductIds = suggestedProductIds.slice(0, 4);
    console.log(
      "🚀 ~ suggestProductsService ~ suggestedProductIds:",
      suggestedProductIds
    );

    // Bước 6: Trường hợp không có gợi ý, lấy sản phẩm cùng danh mục
    if (suggestedProductIds.length === 0) {
      const product = await db.Product.findOne({
        where: { id: id_product },
        attributes: ["categoryId"],
        raw: true,
      });

      const categoryProducts = await db.Product.findAll({
        where: {
          categoryId: product.categoryId,
          id: { [Op.ne]: id_product }, //Op.ne là khác (!=)
        },
        attributes: ["id"],
        limit: 4,
        raw: true,
      });

      suggestedProductIds = categoryProducts.map((product) => product.id); // lấy được mảng id của các sản phẩm chung đơn hàng
    }

    // từ mảng các id map ra thông tin

    const results = await db.Product.findAll({
      include: [
        { model: db.ProductDetails },
        { model: db.ProductImage, as: "image" },
        { model: db.Rating },
      ],
      where: { id: suggestedProductIds },
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

    // Sắp xếp lại kết quả theo thứ tự của suggestedProductIds
    const results2 = suggestedProductIds.map((id) =>
      overview.find((product) => product.id.toString() === id)
    );

    return res.status(OK).json(success(results2));

    // const infoProduct = await db.Product.findAll({
    //   where: { id: suggestedProductIds },
    //   raw: true,
    // });
    // console.log("🚀 ~ suggestProductsService ~ infoProduct:", infoProduct);

    // // Bước 1: Tìm các đơn hàng chứa sản phẩm đang xét
    // const orderDetails = await db.OrderDetails.findAll({
    //   where: { productDetailsId: id_product },
    //   attributes: ["orderId"],
    //   raw: true,
    // }); // lấy được kiểu [ { orderId: 1 },{ orderId: 6 },{ orderId: 4 },{ orderId: 7 },{ orderId: 7 } ]

    // const orderIds = orderDetails.map((orderDetail) => orderDetail.orderId); // lấy ra mảng id [ 1, 6, 4, 7, 7 ]
    // console.log("🚀 ~ suggestProductsService ~ orderIds:", orderIds);

    // // Bước 2: Tìm các sản phẩm khác (id_product) trong cùng đơn hàng trong các đơn hàng kiểu [ 1, 6, 4, 7, 7 ]
    // const products = await db.OrderDetails.findAll({
    //   where: {
    //     orderId: orderIds,
    //     productDetailsId: { [Op.ne]: id_product }, //Op.ne là khác (!=)
    //   },
    //   attributes: ["productDetailsId"],
    //   raw: true,
    // });

    // const productIds = products.map((product) => product.productDetailsId); // [15, 25, 7, 22, 24, 30, 27, 30,  1, 25, 10]
    // console.log("🚀 ~ suggestProductsService ~ productIds:", productIds);

    // // Bước 3: Đếm tần suất xuất hiện của từng sản phẩm
    // const prob_array = {};
    // productIds.forEach((productId) => {
    //   if (prob_array[productId]) {
    //     prob_array[productId] += 1;
    //   } else {
    //     prob_array[productId] = 1;
    //   }
    // });
    // console.log("🚀 ~ suggestProductsService ~ prob_array:", prob_array);

    // // Bước 4: Sắp xếp sản phẩm theo tần suất xuất hiện (giảm dần)
    // const sortedProducts = Object.entries(prob_array).sort(
    //   (a, b) => b[1] - a[1]
    // ); //entries để chuyển thành kiểu như  [ '25', 2 ], [ '30', 2 ],
    // console.log(
    //   "🚀 ~ suggestProductsService ~ sortedProducts:",
    //   sortedProducts
    // );
    // let suggestedProductIds = sortedProducts.map((product) => product[0]);
    // console.log(
    //   "🚀 ~ suggestProductsService ~ suggestedProductIds:",
    //   suggestedProductIds
    // );

    // // Bước 5: Lấy danh sách sản phẩm gợi ý (lấy 3 sản phẩm)
    // suggestedProductIds = suggestedProductIds.slice(0, 4);

    // // Bước 6: Trường hợp không có gợi ý, lấy sản phẩm cùng danh mục
    // if (suggestedProductIds.length === 0) {
    //   const product = await db.Product.findOne({
    //     where: { id: id_product },
    //     attributes: ["categoryId"],
    //     raw: true,
    //   });
    //   console.log("🚀 ~ suggestProductsService ~ product:", product);

    //   const categoryProducts = await db.Product.findAll({
    //     where: {
    //       categoryId: product.categoryId,
    //       id: { [Op.ne]: id_product },
    //     },
    //     attributes: ["id"],
    //     limit: 4,
    //     raw: true,
    //   });

    //   suggestedProductIds = categoryProducts.map((product) => product.id);
    // }

    // return res.status(200).json(success(suggestedProductIds));
  } catch (error) {
    console.log("🚀 ~ suggestProducts ~ error:", error);
  }
};

const productReviewsService = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const idOrder = req.params.idOrder;
    const idProduct = req.body.idProduct;
    const description = req.body.description;
    const rate = req.body.rate;

    const validationResult = reviewProductValidate.validate({
      idProduct: idProduct,
      description: description,
      rate: rate,
    });

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        const findOrder = await db.Order.findOne({
          where: { userId: user.id, id: idOrder, orderState: "5" },
        });

        if (!findOrder) {
          return res
            .status(FORBIDDEN)
            .json(error("Đơn hàng không thể đánhh giá"));
        } else {
          const isValidRating = await db.Rating.findOne({
            where: {
              userId: user.id,
              productId: idProduct,
              orderId: idOrder,
            },
          });

          if (isValidRating) {
            return res
              .status(FORBIDDEN)
              .json(error("Bạn đã đánh giá sản phẩm của đơn hàng này rồi!"));
          }

          const addReview = await db.Rating.create({
            userId: user.id,
            productId: idProduct,
            orderId: idOrder,
            description: description,
            rate: rate,
          });

          if (addReview) {
            return res.status(OK).json(success(addReview));
          } else {
            return res.status(OK).json(error("Thất bại!"));
          }
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ productReviews ~ error:", error);
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
  suggestProductsService,
  productReviewsService,
};
