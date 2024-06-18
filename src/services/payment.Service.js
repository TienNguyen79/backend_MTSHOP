import { payOS } from "../config/config.payment";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
} from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { paymentValidate } from "../validate/payment.Validate";

const createLinkPaymentService = async (req, res) => {
  try {
    const { description, returnUrl, cancelUrl, amount, items } = req.body;

    const validationResult = paymentValidate.validate({
      description,
      returnUrl,
      cancelUrl,
      amount,
    });

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const body = {
      orderCode: Number(String(new Date().getTime()).slice(-6)),
      amount,
      description,
      items, // mảng "items": [{"name": "sp1","quantity": 1, "price": 2000},{"name": "sp2","quantity": 2, "price": 2000}]
      cancelUrl, // link đến trang này khi ấn hủy đơn
      returnUrl, // link đến trang này khi đơn hàng thành công
    };

    const paymentLinkRes = await payOS.createPaymentLink(body);
    console.log(
      "🚀 ~ createLinkPaymentService ~ paymentLinkRes:",
      paymentLinkRes
    );

    const data = {
      bin: paymentLinkRes.bin,
      checkoutUrl: paymentLinkRes.checkoutUrl,
      accountNumber: paymentLinkRes.accountNumber,
      accountName: paymentLinkRes.accountName,
      amount: paymentLinkRes.amount,
      description: paymentLinkRes.description,
      orderCode: paymentLinkRes.orderCode,
      qrCode: paymentLinkRes.qrCode,
    };

    return res.status(OK).json(success(data));
  } catch (error) {
    console.log("🚀 ~ createLinkPaymentService ~ error:", error);
  }
};

const getOrderPaymentService = async (req, res) => {
  try {
    const { idOrder } = req.params;
    const order = await payOS.getPaymentLinkInformation(idOrder);

    if (Object.entries(order).length > 0) {
      return res.status(OK).json(success(order));
    } else {
      return res.status(NOT_FOUND).json(error("Không tìm thấy đơn hàng"));
    }
  } catch (error) {
    console.log("🚀 ~ getOrderPaymentService ~ error:", error);
  }
};

const cancelOrderPaymentService = async (req, res) => {
  try {
    const { idOrder } = req.params;
    const order = await payOS.cancelPaymentLink(idOrder);

    if (order && Object.entries(order).length > 0) {
      return res.status(OK).json(success(order));
    } else {
      return res.status(NOT_FOUND).json(error("Không tìm thấy đơn hàng"));
    }
  } catch (error) {
    console.log("🚀 ~ getOrderPaymentService ~ error:", error);
    return res
      .status(INTERNAL_SERVER_ERROR)
      .json(error("Đã xảy ra lỗi khi hủy đơn hàng"));
  }
};

const completedOrderPaymentService = async (req, res) => {
  try {
    const { idOrder } = req.params;

    const order = await db.Order.findOne({ where: { id: idOrder } });
    if (!order) {
      return res.status(NOT_FOUND).json(error("Đơn Hàng không tồn tại"));
    }

    const updateStausOrder = await db.Order.update(
      {
        orderState: "2",
      },
      {
        where: { id: idOrder },
      }
    );

    if (updateStausOrder) {
      return res.status(OK).json(success("Cập nhật thành công"));
    } else {
      return res.status(BAD_REQUEST).json(error("Cập nhật thất bại!"));
    }
  } catch (error) {
    console.log("🚀 ~ getOrderPaymentService ~ error:", error);
  }
};

export {
  createLinkPaymentService,
  getOrderPaymentService,
  cancelOrderPaymentService,
  completedOrderPaymentService,
};
