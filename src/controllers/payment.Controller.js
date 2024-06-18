import { INTERNAL_SERVER_ERROR } from "../constant/http.status";
import { error } from "../results/handle.results";
import {
  cancelOrderPaymentService,
  completedOrderPaymentService,
  createLinkPaymentService,
  getOrderPaymentService,
} from "../services/payment.Service";

const handleCreateLinkPayment = async (req, res) => {
  try {
    let data = await createLinkPaymentService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handlegetOrderPayment = async (req, res) => {
  try {
    let data = await getOrderPaymentService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleCancelOrderPayment = async (req, res) => {
  try {
    let data = await cancelOrderPaymentService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleCompletedOrderPaymentService = async (req, res) => {
  try {
    let data = await completedOrderPaymentService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export {
  handleCreateLinkPayment,
  handlegetOrderPayment,
  handleCancelOrderPayment,
  handleCompletedOrderPaymentService,
};
