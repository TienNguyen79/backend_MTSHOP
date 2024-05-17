import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import { OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
const getAllOrderService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const getAllOrder = await db.Order.findAll({});
    const results = await db.Order.findAll({
      include: [
        {
          model: db.User,
          include: [
            {
              model: db.PaymentMethodUser,
              include: [{ model: db.PaymentMethodSystem }],
            },
          ],
        },
        // {
        //   model: db.Address,
        // },
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
        exclude: ["userId"], //bỏ field này đi
      },
      limit: limit,
      offset: offset,
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

const orderProduct = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (token) {
      const accessToken = token.split(" ")[1];

      const productDetails = req.body.productDetails;
      const addressId = req.body.addressId;
      const paymentmethoduserId = req.body.paymentmethoduserId;
      console.log("🚀 ~ orderProduct ~ productDetails:", productDetails);
      console.log("🚀 ~ orderProduct ~ addressId:", addressId);
      console.log(
        "🚀 ~ orderProduct ~ paymentmethoduserId:",
        paymentmethoduserId
      );

      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }

        console.log("🚀 ~ jwt.verify ~ user:", user);
      });
      return res.status(OK).json(success("ok"));
    }
  } catch (error) {
    console.log("🚀 ~ orderProduct ~ error:", error);
  }
};

export { getAllOrderService, orderProduct };
