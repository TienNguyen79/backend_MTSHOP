import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import { BAD_REQUEST, OK, UNAUTHORIZED } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { cartValidate } from "../validate/cart.Validate";
const getAllCartService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const token = req.headers.authorization;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }
        console.log("🚀 ~ jwt.verify ~ user:", user);

        const getFullCart = await db.Cart.findAll({
          where: { userId: user.id },
        });

        const results = await db.Cart.findAll({
          where: { userId: user.id },
          attributes: {
            exclude: ["productDetailsId"], //bỏ field này đi
          },
          include: [
            {
              model: db.ProductDetails,
              as: "productDetails",
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: limit,
          offset: offset,
        });

        // Lặp qua mảng để lấy dữ liệu từ mỗi đối tượng
        const parseResults = results.map((item) => item.get({ plain: true }));

        const parsedProductDetails = await Promise.all(
          parseResults.map(async (detail) => {
            let parsedProperties = {};

            try {
              parsedProperties = JSON.parse(
                detail.productDetails.properties || "{}"
              ); // từ JSON chuyển đồi sang js

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
              console.log("🚀 ~ parseResults.map ~ dataProduct:", dataProduct);
            } catch (error) {
              console.error("Error parsing JSON:", error);
            }

            const dataProduct = await db.Product.findOne({
              where: { id: detail.productDetails.productId },
              include: [{ model: db.ProductImage, as: "image" }],
              raw: true,
              nest: true,
            });

            return {
              ...detail,
              productDetails: {
                id: detail.productDetails.id,
                properties: parsedProperties,
              },
              product: dataProduct,
            };
          })
        );

        return res.status(OK).json(
          success(parsedProductDetails, {
            page: page,
            limit: limit,
            totalPages: parseInt(Math.ceil(getFullCart.length / limit)),
            totalResults: getFullCart.length,
          })
        );
      });
    }
  } catch (error) {
    console.log("🚀 ~ getAllCart ~ error:", error);
  }
};

const addtoCartService = async (req, res) => {
  try {
    const productDetailsId = parseInt(req.body.productDetailsId);
    const quantity = parseInt(req.body.quantity);
    const token = req.headers.authorization;

    const validationResult = cartValidate.validate(req.body);
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

        const getProductDetail = await db.ProductDetails.findOne({
          where: { id: productDetailsId },
          raw: true,
        });

        if (quantity > getProductDetail.quantity) {
          return res
            .status(BAD_REQUEST)
            .json(error("Số lượng trong kho không đủ"));
        }

        const checkValidProduct = await db.Cart.findOne({
          where: { productDetailsId: productDetailsId, userId: user.id },
          raw: true,
        });

        let results;
        if (checkValidProduct) {
          results = await db.Cart.update(
            {
              quantity: checkValidProduct.quantity + quantity,
            },
            {
              where: {
                productDetailsId: productDetailsId,
                userId: user.id,
              },
            }
          );
        } else {
          results = await db.Cart.create({
            productDetailsId: productDetailsId,
            userId: user.id,
            quantity: quantity,
          });
        }

        return res.status(OK).json(success(results));
      });
    }
  } catch (error) {
    console.log("🚀 ~ addtoCart ~ error:", error);
  }
};

const updateQuantityProductInCartService = async (req, res) => {
  try {
    const productDetailsId = parseInt(req.body.productDetailsId);
    const quantity = parseInt(req.body.quantity);
    const token = req.headers.authorization;

    const validationResult = cartValidate.validate(req.body);

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

        let results;

        const checkValidProduct = await db.Cart.findOne({
          where: { productDetailsId: productDetailsId, userId: user.id },
          raw: true,
        });

        if (checkValidProduct) {
          results = await db.Cart.update(
            {
              quantity: quantity,
            },
            {
              where: {
                productDetailsId: productDetailsId,
                userId: user.id,
              },
            }
          );
        } else {
          return res
            .status(UNAUTHORIZED)
            .json(success("Bạn không có sản phẩm này trong giỏ hàng !"));
        }

        if (results) {
          return res.status(OK).json(success("Cập nhật số lượng thành công !"));
        } else {
          return res
            .status(BAD_REQUEST)
            .json(success("Cập nhật số lượng thất bại !"));
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ updateQuantityProductInCart ~ error:", error);
  }
};

const deleteCartService = async (req, res) => {
  try {
    const idProductDetails = parseInt(req.params.id);
    const token = req.headers.authorization;

    let results;
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        const checkValidProduct = await db.Cart.findOne({
          where: { productDetailsId: idProductDetails, userId: user.id },
          raw: true,
        });

        if (checkValidProduct) {
          results = await db.Cart.destroy({
            where: { productDetailsId: idProductDetails, userId: user.id },
          });
          return res.status(OK).json(success("Xóa Thành Công !"));
        } else {
          return res
            .status(UNAUTHORIZED)
            .json(success("Sản phẩm không phải của bạn !"));
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ deleteCart ~ error:", error);
  }
};
export {
  getAllCartService,
  addtoCartService,
  updateQuantityProductInCartService,
  deleteCartService,
};
