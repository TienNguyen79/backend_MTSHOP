import { INTERNAL_SERVER_ERROR } from "../constant/http.status";
import {
  addAddressService,
  addUserService,
  deleteUserService,
  getAllUserService,
  switchStatusBanorUnBanService,
  updateInfoUserService,
} from "../services/user.Service";

const handleGetAllUser = async (req, res) => {
  try {
    let data = await getAllUserService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleUpdateInfoUser = async (req, res) => {
  try {
    let data = await updateInfoUserService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleAddUser = async (req, res) => {
  try {
    let data = await addUserService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleBanorUnBan = async (req, res) => {
  try {
    let data = await switchStatusBanorUnBanService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handledeleteUser = async (req, res) => {
  try {
    let data = await deleteUserService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleAddAddressUser = async (req, res) => {
  try {
    let data = await addAddressService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};
export {
  handleGetAllUser,
  handleUpdateInfoUser,
  handleAddUser,
  handleBanorUnBan,
  handledeleteUser,
  handleAddAddressUser,
};
