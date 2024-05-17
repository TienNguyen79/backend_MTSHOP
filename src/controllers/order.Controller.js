import { INTERNAL_SERVER_ERROR } from "../constant/http.status";
import { error } from "../results/handle.results";
import { getAllOrderService, orderProduct } from "../services/order.Service";

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
    let data = await orderProduct(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export { handleGetAllOrder, handleOrderProduct };
