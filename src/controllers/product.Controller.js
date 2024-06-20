const { INTERNAL_SERVER_ERROR } = require("../constant/http.status");
const { error } = require("../results/handle.results");
const {
  GetAllProductService,
  getDetailsProduct,
  getQuantityvariantService,
  addProductService,
  updateProductService,
  updateQuantityVariantService,
  deleteProductService,
  deleteVariantProductService,
  filterProductService,
  suggestProductsService,
  productReviewsService,
  getAllVariantService,
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

const handleQuantityvariant = async (req, res) => {
  try {
    let data = await getQuantityvariantService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleAddProduct = async (req, res) => {
  try {
    let data = await addProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleUpdateProduct = async (req, res) => {
  try {
    let data = await updateProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleUpdateQuantityVariantProduct = async (req, res) => {
  try {
    let data = await updateQuantityVariantService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleDeleteProduct = async (req, res) => {
  try {
    let data = await deleteProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleDeleteVariantProduct = async (req, res) => {
  try {
    let data = await deleteVariantProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleFilterProduct = async (req, res) => {
  try {
    let data = await filterProductService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleSuggestProducts = async (req, res) => {
  try {
    let data = await suggestProductsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleProductReviews = async (req, res) => {
  try {
    let data = await productReviewsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleGetAllVariant = async (req, res) => {
  try {
    let data = await getAllVariantService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export {
  handleGetAllProduct,
  handleGeDetailProduct,
  handleQuantityvariant,
  handleAddProduct,
  handleUpdateProduct,
  handleUpdateQuantityVariantProduct,
  handleDeleteProduct,
  handleDeleteVariantProduct,
  handleFilterProduct,
  handleSuggestProducts,
  handleProductReviews,
  handleGetAllVariant,
};
