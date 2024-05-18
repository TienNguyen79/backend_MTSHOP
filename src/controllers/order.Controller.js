import { INTERNAL_SERVER_ERROR } from "../constant/http.status";
import { error } from "../results/handle.results";
import {
  CancelOrderService,
  DeleteOrderService,
  getAllOrderService,
  orderProductService,
  updateStatusOrderService,
} from "../services/order.Service";

const handleGetAllOrder = async (req, res) => {
  try {
    let data = await getAllOrderService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleOrderProduct = async (req, res) => {
  try {
    let data = await orderProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleUpdateStatusOrder = async (req, res) => {
  try {
    let data = await updateStatusOrderService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleCancelOrder = async (req, res) => {
  try {
    let data = await CancelOrderService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleDeleteOrder = async (req, res) => {
  try {
    let data = await DeleteOrderService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export {
  handleGetAllOrder,
  handleOrderProduct,
  handleUpdateStatusOrder,
  handleCancelOrder,
  handleDeleteOrder,
};
