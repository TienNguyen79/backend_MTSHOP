import { error } from "../results/handle.results";

const { INTERNAL_SERVER_ERROR } = require("../constant/http.status");
const {
  getAllCartService,
  addtoCartService,
  updateQuantityProductInCartService,
  deleteCartService,
} = require("../services/cart.Service");

const handleGetAllCart = async (req, res) => {
  try {
    let data = await getAllCartService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleAddtoCart = async (req, res) => {
  try {
    let data = await addtoCartService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleUpdateQuantityProductInCart = async (req, res) => {
  try {
    let data = await updateQuantityProductInCartService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleDeleteCart = async (req, res) => {
  try {
    let data = await deleteCartService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export {
  handleGetAllCart,
  handleAddtoCart,
  handleUpdateQuantityProductInCart,
  handleDeleteCart,
};
