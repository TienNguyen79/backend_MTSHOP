import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import {
  BAD_REQUEST,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { orderValidate } from "../validate/order.Validate";
import { HIGH_LIMIT, statusRole } from "../constant/constant.commom";
const getAllOrderService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const conditionWhere = {};

    const statusOrder = req.query.statusOrder;

    if (statusOrder) {
      conditionWhere.orderState = statusOrder;
    }
    console.log("🚀 ~ getAllOrderService ~ conditionWhere:", conditionWhere);

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
  } catch (error) {
    console.log("🚀 ~ getAllOrderService ~ error:", error);
  }
};

const orderProductService = async (req, res) => {
  try {
    const validationResult = orderValidate.validate(req.body);

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

      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        const Create_order = await db.Order.create({
          userId: user.id,
          addressId: addressId,
          shippingfee: 0,
          orderState: "1",
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
        return res.status(OK).json(success(order));
      }
    } else {
      // Nếu trạng thái là 5, không thay đổi gì
      return res.status(OK).json(success("Trạng thái đã hoàn tất"));
    }
  } catch (error) {
    console.log("🚀 ~ updateStatusOrderService ~ error:", error);
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
          });
          if (!order) {
            return res.status(UNAUTHORIZED).json(error("Bạn Không có quyền!"));
          }

          const CancelOrder = await db.Order.update(
            {
              orderState: "0",
            },
            { where: { id: orderId, userId: user.id } }
          );
          if (CancelOrder) {
            return res.status(OK).json(success("Đơn hàng đã được hủy!"));
          } else {
            return res.status(BAD_REQUEST).json(success("Hủy Thất Bại!"));
          }
        } else if (user.roleID === statusRole.ADMIN) {
          const orderId = req.params.id;

          const order = await db.Order.findOne({
            where: { id: orderId },
          });
          if (!order) {
            return res.status(BAD_REQUEST).json(error("Order không tồn tại"));
          }

          const CancelOrder = await db.Order.update(
            {
              orderState: "0",
            },
            { where: { id: orderId } }
          );
          if (CancelOrder) {
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
  orderProductService,
  updateStatusOrderService,
  CancelOrderService,
  DeleteOrderService,
};
