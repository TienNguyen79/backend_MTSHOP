import { INTERNAL_SERVER_ERROR, OK } from "../constant/http.status";
import { error } from "../results/handle.results";
import { GetAllcategoryService } from "../services/category.Service";

const handleGetAllCategory = async (req, res) => {
  try {
    let data = await GetAllcategoryService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export { handleGetAllCategory };
