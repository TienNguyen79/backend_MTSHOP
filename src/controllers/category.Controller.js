import { INTERNAL_SERVER_ERROR, OK } from "../constant/http.status";
import { error } from "../results/handle.results";
import { updateQuantityProductInCart } from "../services/cart.Service";
import {
  GetAllcategoryService,
  ReStoreCategoryService,
  addCategoryService,
  deleteCategoryService,
  updateCategoryService,
} from "../services/category.Service";

const handleGetAllCategory = async (req, res) => {
  try {
    let data = await GetAllcategoryService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleAddCategory = async (req, res) => {
  try {
    let data = await addCategoryService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleupdateCategory = async (req, res) => {
  try {
    let data = await updateCategoryService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handledeleteCategory = async (req, res) => {
  try {
    let data = await deleteCategoryService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleRestoreCategory = async (req, res) => {
  try {
    let data = await ReStoreCategoryService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export {
  handleGetAllCategory,
  handleAddCategory,
  handleupdateCategory,
  handledeleteCategory,
  handleRestoreCategory,
};
