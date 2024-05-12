const { INTERNAL_SERVER_ERROR } = require("../constant/http.status");
const { error } = require("../results/handle.results");
const {
  GetAllProductService,
  getDetailsProduct,
} = require("../services/product.Service");

const handleGetAllProduct = async (req, res) => {
  try {
    let data = await GetAllProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleGeDetailProduct = async (req, res) => {
  try {
    let data = await getDetailsProduct(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export { handleGetAllProduct, handleGeDetailProduct };
