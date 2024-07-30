import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import {
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { orderValidate } from "../validate/order.Validate";
import { HIGH_LIMIT, statusRole } from "../constant/constant.commom";
import { Op } from "sequelize";
const getAllOrderService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const token = req.headers.authorization;
    const orderId = parseInt(req.query.orderId);

    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }
        if (
          user.roleID === statusRole.ADMIN ||
          user.roleID === statusRole.STAFF
        ) {
          const conditionWhere = {};

          const statusOrder = req.query.statusOrder;

          if (statusOrder) {
            conditionWhere.orderState = statusOrder;
          }
          if (orderId) {
            conditionWhere.id = orderId;
          }
          console.log("🚀 ~ jwt.verify ~ conditionWhere:", conditionWhere);

          const getAllOrder = await db.Order.findAll({
            where: conditionWhere,
            limit: HIGH_LIMIT,
          });
          const results = await db.Order.findAll({
            include: [
              {
                model: db.User,
                // include: [
                //   {
                //     model: db.PaymentMethodUser,
                //     include: [{ model: db.PaymentMethodSystem }],
                //   },
                // ],
              },
              {
                model: db.PaymentMethodUser,
                include: [{ model: db.PaymentMethodSystem }],
                attributes: {
                  exclude: ["systemId"], //bỏ field này đi
                },
              },
              {
                model: db.Address,
                as: "deliveryAddress",
              },
              {
                model: db.OrderDetails,
                include: [
                  {
                    model: db.ProductDetails,
                    include: [{ model: db.Product }],
                    attributes: {
                      exclude: ["productId"], //bỏ field này đi
                    },
                  },
                ],
              },
            ],
            attributes: {
              exclude: ["userId", "addressId"], //bỏ field này đi
            },
            order: [["createdAt", "DESC"]],
            limit: limit,
            offset: offset,
            where: conditionWhere,
          });
          return res.status(OK).json(
            success(results, {
              page: page,
              limit: limit,
              totalPages: parseInt(Math.ceil(getAllOrder.length / limit)),
              totalResults: getAllOrder.length,
            })
          );
        } else if (user.roleID === statusRole.USER) {
          const conditionWhere = {
            userId: user.id,
          };

          const statusOrder = req.query.statusOrder;

          if (statusOrder) {
            conditionWhere.orderState = statusOrder;
          }

          const getAllOrder = await db.Order.findAll({
            where: conditionWhere,
            limit: HIGH_LIMIT,
          });
          const results = await db.Order.findAll({
            include: [
              {
                model: db.User,
                // include: [
                //   {
                //     model: db.PaymentMethodUser,
                //     include: [{ model: db.PaymentMethodSystem }],
                //   },
                // ],
              },
              {
                model: db.PaymentMethodUser,
                include: [{ model: db.PaymentMethodSystem }],
                attributes: {
                  exclude: ["systemId"], //bỏ field này đi
                },
              },
              {
                model: db.Address,
                as: "deliveryAddress",
              },
              {
                model: db.OrderDetails,
                include: [
                  {
                    model: db.ProductDetails,
                    include: [{ model: db.Product }],
                    attributes: {
                      exclude: ["productId"], //bỏ field này đi
                    },
                  },
                ],
              },
            ],
            attributes: {
              exclude: ["userId", "addressId"], //bỏ field này đi
            },
            order: [["createdAt", "DESC"]],
            limit: limit,
            offset: offset,
            where: conditionWhere,
          });
          return res.status(OK).json(
            success(results, {
              page: page,
              limit: limit,
              totalPages: parseInt(Math.ceil(getAllOrder.length / limit)),
              totalResults: getAllOrder.length,
            })
          );
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ getAllOrderService ~ error:", error);
  }
};

const getDetailsOrderService = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const orderId = parseInt(req.params.id);
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }
        if (
          user.roleID === statusRole.ADMIN ||
          user.roleID === statusRole.STAFF
        ) {
          // ADMIN
          const results = await db.Order.findOne({
            include: [
              {
                model: db.User,
              },
              {
                model: db.PaymentMethodUser,
                include: [{ model: db.PaymentMethodSystem }],
                attributes: {
                  exclude: ["systemId"], //bỏ field này đi
                },
              },
              {
                model: db.Address,
                as: "deliveryAddress",
              },
              {
                model: db.OrderDetails,
                include: [
                  {
                    model: db.ProductDetails,
                    include: [
                      {
                        model: db.Product,
                        include: [{ model: db.ProductImage, as: "image" }],
                      },
                    ],
                    // attributes: {
                    //   exclude: ["productId"], //bỏ field này đi
                    // },
                  },
                ],
              },
            ],
            attributes: {
              exclude: ["userId", "addressId"], //bỏ field này đi
            },
            order: [["createdAt", "DESC"]],
            where: { id: orderId },
          });

          const resultsJson = JSON.stringify(results, null, 2); // Biến JSON thành chuỗi
          const resultsParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

          const parsedProductDetails = await Promise.all(
            resultsParse?.OrderDetails?.map(async (detail) => {
              let parsedProperties = {};

              try {
                parsedProperties = JSON.parse(
                  detail.ProductDetail.properties || "{}"
                ); // từ JSON chuyển đồi sang js

                if (parsedProperties.size) {
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

          const overview = {
            ...resultsParse,
            OrderDetails: parsedProductDetails,
          };

          return res.status(OK).json(success(overview));
        } else if (user.roleID === statusRole.USER) {
          // USER
          const conditionWhere = {
            userId: user.id,
            id: orderId,
          };

          const results = await db.Order.findOne({
            include: [
              {
                model: db.User,
              },
              {
                model: db.PaymentMethodUser,
                include: [{ model: db.PaymentMethodSystem }],
                attributes: {
                  exclude: ["systemId"], //bỏ field này đi
                },
              },
              {
                model: db.Address,
                as: "deliveryAddress",
              },
              {
                model: db.OrderDetails,
                include: [
                  {
                    model: db.ProductDetails,
                    include: [
                      {
                        model: db.Product,
                        include: [{ model: db.ProductImage, as: "image" }],
                      },
                    ],
                    // attributes: {
                    //   exclude: ["productId"], //bỏ field này đi
                    // },
                  },
                ],
              },
            ],
            attributes: {
              exclude: ["userId", "addressId"], //bỏ field này đi
            },
            order: [["createdAt", "DESC"]],

            where: conditionWhere,
          });

          const resultsJson = JSON.stringify(results, null, 2); // Biến JSON thành chuỗi
          const resultsParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

          // chuyển size, color từ id về text
          const parsedProductDetails = await Promise.all(
            resultsParse?.OrderDetails?.map(async (detail) => {
              let parsedProperties = {};

              try {
                parsedProperties = JSON.parse(
                  detail.ProductDetail.properties || "{}"
                ); // từ JSON chuyển đồi sang js

                if (parsedProperties.size) {
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

          const overview = {
            ...resultsParse,
            OrderDetails: parsedProductDetails,
          };

          return res.status(OK).json(success(overview));
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ getDetailsOrderService ~ error:", error);
  }
};

const orderProductService = async (req, res) => {
  try {
    const validationResult = orderValidate.validate({
      productDetails: req.body.productDetails,
      addressId: req.body.addressId,
      paymentmethoduserId: req.body.paymentmethoduserId,
    });

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const token = req.headers.authorization;

    if (token) {
      const accessToken = token.split(" ")[1];

      const productDetails = req.body.productDetails;
      const addressId = req.body.addressId;
      const paymentmethoduserId = req.body.paymentmethoduserId;
      const orderState = req.body.orderState || "1";
      const orderId =
        req.body.orderId || Number(String(new Date().getTime()).slice(-6));
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        const isCheckOrder = await db.Order.findOne({
          where: { id: orderId },
          raw: true,
        });

        if (Object.entries(isCheckOrder || {}).length > 0) {
          return res.status(BAD_REQUEST).json(error("Đơn hàng đã tồn tại !"));
        }

        const Create_order = await db.Order.create({
          id: orderId,
          userId: user.id,
          addressId: addressId,
          shippingfee: 0,
          orderState: orderState,
        });

        const orderDetailsList = await Promise.all(
          productDetails.map(async (item) => {
            const create_orderDetails = await db.OrderDetails.create({
              orderId: Create_order.dataValues.id,
              productDetailsId: item.idProductDetails,
              quantity: item.quantity,
              price: item.price,
              total: parseInt(item.price * item.quantity),
            });

            return create_orderDetails; // Trả về kết quả của create
          })
        );

        const resultsJson = JSON.stringify(orderDetailsList, null, 2); // Biến JSON thành chuỗi để cho đúng định dạng
        const orderDetailsListParse = JSON.parse(resultsJson); // Chuyển chuỗi JSON thành đối tượng JavaScript

        if (orderDetailsListParse.length > 0) {
          const totalOrder = orderDetailsListParse.reduce(
            (accumulator, currentValue) => accumulator + currentValue.total,
            0
          );
          const updateTotal_order = await db.Order.update(
            {
              total: totalOrder,
            },
            { where: { id: Create_order.dataValues.id } }
          );
        }

        const addMethodpayment = await db.PaymentMethodUser.create({
          systemId: paymentmethoduserId,
          userId: user.id,
          orderId: Create_order.dataValues.id,
        });

        if (Create_order.dataValues && orderDetailsListParse) {
          // Sử dụng Promise.all để chờ tất cả các thao tác bất đồng bộ
          const promises = productDetails.map(async (item) => {
            const findProductDetail = await db.ProductDetails.findOne({
              where: { id: item.idProductDetails },
              raw: true,
            });

            if (findProductDetail.quantity < item.quantity) {
              throw new Error(
                `Số lượng trong kho không đủ cho sản phẩm với id: ${item.idProductDetails}`
              );
            } else {
              await db.ProductDetails.update(
                {
                  quantity: findProductDetail.quantity - item.quantity,
                },
                { where: { id: item.idProductDetails } }
              );
            }
          });

          try {
            // Chờ tất cả các thao tác hoàn thành
            await Promise.all(promises);
            // Nếu tất cả các thao tác thành công, gửi phản hồi thành công
            return res.status(OK).json(success("Đặt hàng Thành Công!"));
          } catch (error1) {
            // Xử lý lỗi khi số lượng không đủ
            return res.status(BAD_REQUEST).json(error(error1.message));
          }
        } else {
          // Trường hợp Create_order hoặc orderDetailsListParse không tồn tại
          return res.status(BAD_REQUEST).json(error("Đặt hàng Thất Bại!"));
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ orderProductService ~ error:", error);
  }
};

const updateStatusOrderService = async (req, res) => {
  try {
    const orderId = req.params.id;
    const token = req.headers.authorization;

    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        if (
          user.roleID === statusRole.ADMIN ||
          user.roleID === statusRole.STAFF
        ) {
          const order = await db.Order.findOne({ where: { id: orderId } });
          if (!order) {
            return res.status(NOT_FOUND).json(error("Order không tồn tại"));
          }

          const currentState = parseInt(order.orderState, 10);

          if (currentState < 5) {
            const updateStausOrder = await db.Order.update(
              {
                orderState: (currentState + 1).toString(),
              },
              {
                where: { id: orderId },
              }
            );
            // Tăng trạng thái lên một đơn vị

            if (updateStausOrder) {
              const order = await db.Order.findOne({ where: { id: orderId } });

              if (order.orderState === "5") {
                const Findorder = await db.OrderDetails.findAll({
                  where: { orderId: orderId },
                  raw: true,
                });

                const arrProDetails =
                  Findorder.length > 0 &&
                  Findorder.map((item) => ({
                    productDetailsId: item.productDetailsId,
                    quantity: item.quantity,
                  }));

                const productDetailsIds = arrProDetails.map(
                  (item) => item.productDetailsId
                );
                const quantities = arrProDetails.map((item) => item.quantity);

                const productId = await db.ProductDetails.findAll({
                  where: { id: { [Op.in]: productDetailsIds } },
                  attributes: ["productId"],
                  raw: true,
                });

                const productIdArr =
                  productId.length > 0 &&
                  productId.map((item, index) => ({
                    productId: item.productId,
                    quantity: quantities[index],
                  }));

                // Đếm tổng số lượng đã bán cho từng productId
                const countMap = productIdArr.reduce(
                  (acc, { productId, quantity }) => {
                    acc[productId] = (acc[productId] || 0) + quantity;
                    return acc;
                  },
                  {}
                );

                // Chuyển đổi countMap thành mảng các đối tượng
                const result = Object.keys(countMap).map((key) => ({
                  productId: key,
                  sold: countMap[key],
                }));

                // Cập nhật số lượng đã bán của từng sản phẩm trong cơ sở dữ liệu
                const updatePromises = result.map(async (item) => {
                  await db.Product.update(
                    {
                      sold: db.sequelize.literal(`sold + ${item.sold}`),
                    },
                    { where: { id: item.productId } }
                  );
                });

                // Chờ tất cả các cập nhật hoàn thành
                await Promise.all(updatePromises);
              }
              return res.status(OK).json(success(order));
            }
          } else {
            // Nếu trạng thái là 5, không thay đổi gì
            return res.status(OK).json(success("Trạng thái đã hoàn tất"));
          }
        } else if (user.roleID === statusRole.USER) {
          const order = await db.Order.findOne({ where: { id: orderId } });
          if (!order) {
            return res.status(NOT_FOUND).json(error("Order không tồn tại"));
          }

          const currentState = parseInt(order.orderState, 10);

          if (currentState === 4) {
            const updateStausOrder = await db.Order.update(
              {
                orderState: (currentState + 1).toString(),
              },
              {
                where: { id: orderId },
              }
            );
            // Tăng trạng thái lên một đơn vị

            if (updateStausOrder) {
              const order = await db.Order.findOne({ where: { id: orderId } });
              return res.status(OK).json(success(order));
            }
          } else if (currentState === 5) {
            // Nếu trạng thái là 5, không thay đổi gì
            return res.status(OK).json(success("Trạng thái đã hoàn tất"));
          } else {
            return res.status(UNAUTHORIZED).json(error("Bạn Không có quyền !"));
          }
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ updateStatusOrderService ~ error:", error);
  }
};

const backStatusOrderService = async (req, res) => {
  const orderId = req.params.id;
  const token = req.headers.authorization;

  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, configs.key.private, async (err, user) => {
      if (err) {
        return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
      }

      if (
        user.roleID === statusRole.ADMIN ||
        user.roleID === statusRole.STAFF
      ) {
        const order = await db.Order.findOne({ where: { id: orderId } });
        if (!order) {
          return res.status(NOT_FOUND).json(error("Order không tồn tại"));
        }

        const currentState = parseInt(order.orderState, 10);
        console.log("🚀 ~ jwt.verify ~ currentState:", currentState);

        if (currentState >= 2 && currentState < 5) {
          const updateStausOrder = await db.Order.update(
            {
              orderState: (currentState - 1).toString(),
            },
            {
              where: { id: orderId },
            }
          );

          if (updateStausOrder) {
            const order = await db.Order.findOne({ where: { id: orderId } });
            return res.status(OK).json(success(order));
          }
        } else {
          return res.status(OK).json(success("Cập nhật trạng thái thất bại !"));
        }
      } else {
        return res.status(UNAUTHORIZED).json(success("Bạn không có quyền !"));
      }
    });
  }
};

const CancelOrderService = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        if (user.roleID === statusRole.USER) {
          const orderId = req.params.id;

          const order = await db.Order.findOne({
            where: { id: orderId, userId: user.id },
            raw: true,
          });

          if (!order) {
            return res.status(UNAUTHORIZED).json(error("Bạn Không có quyền!"));
          }

          if (order.orderState === "0") {
            return res
              .status(UNAUTHORIZED)
              .json(error("Đơn hàng đã được hủy trước đó !"));
          }
          if (order.orderState === "5") {
            return res
              .status(UNAUTHORIZED)
              .json(error("Không thể hủy đơn hàng đã được giao"));
          }

          const CancelOrder = await db.Order.update(
            {
              orderState: "0",
            },
            { where: { id: orderId, userId: user.id } }
          );
          if (CancelOrder) {
            //tìm tất cả sản phẩm chi tiết trong orderDetails
            const findOrderDetails = await db.OrderDetails.findAll({
              where: { orderId: orderId },
              raw: true,
            });

            // map xong lấy findProductDetails để lấy số lượng trong database + số lượng mới hiện tại
            findOrderDetails.map(async (item) => {
              const findProductDetails = await db.ProductDetails.findOne({
                where: { id: item.productDetailsId },
                raw: true,
              });

              const updateQuantityProductDetails =
                await db.ProductDetails.update(
                  {
                    quantity: findProductDetails.quantity + item.quantity,
                  },
                  { where: { id: item.productDetailsId } }
                );
            });

            return res.status(OK).json(success("Đơn hàng đã được hủy!"));
          } else {
            return res.status(BAD_REQUEST).json(success("Hủy Thất Bại!"));
          }
        } else if (
          user.roleID === statusRole.ADMIN ||
          user.roleID === statusRole.STAFF
        ) {
          const orderId = req.params.id;

          const order = await db.Order.findOne({
            where: { id: orderId },
          });
          if (!order) {
            return res.status(BAD_REQUEST).json(error("Order không tồn tại"));
          }

          if (order.orderState === "0") {
            return res
              .status(UNAUTHORIZED)
              .json(error("Đơn hàng đã được hủy trước đó !"));
          }
          if (order.orderState === "5") {
            return res
              .status(UNAUTHORIZED)
              .json(error("Không thể hủy đơn hàng đã được giao"));
          }

          const CancelOrder = await db.Order.update(
            {
              orderState: "0",
            },
            { where: { id: orderId } }
          );
          if (CancelOrder) {
            const findOrderDetails = await db.OrderDetails.findAll({
              where: { orderId: orderId },
              raw: true,
            });

            findOrderDetails.map(async (item) => {
              const findProductDetails = await db.ProductDetails.findOne({
                where: { id: item.productDetailsId },
                raw: true,
              });

              const updateQuantityProductDetails =
                await db.ProductDetails.update(
                  {
                    quantity: findProductDetails.quantity + item.quantity,
                  },
                  { where: { id: item.productDetailsId } }
                );
            });

            return res.status(OK).json(success("Đơn hàng đã được hủy!"));
          } else {
            return res.status(BAD_REQUEST).json(success("Hủy Thất Bại!"));
          }
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ CancelOrderService ~ error:", error);
  }
};

const DeleteOrderService = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await db.Order.findOne({
      where: { id: orderId },
    });
    if (!order) {
      return res.status(NOT_FOUND).json(error("Không có đơn hàng này!"));
    }

    const deleteOrder = db.Order.destroy({ where: { id: orderId } });

    if (deleteOrder) {
      return res.status(OK).json(success("Xóa Thành Công!"));
    } else {
      return res.status(BAD_REQUEST).json(success("Xóa Thất Bại"));
    }
  } catch (error) {
    console.log("🚀 ~ handleDeleteOrder ~ error:", error);
  }
};

export {
  getAllOrderService,
  getDetailsOrderService,
  orderProductService,
  updateStatusOrderService,
  CancelOrderService,
  DeleteOrderService,
  backStatusOrderService,
};
