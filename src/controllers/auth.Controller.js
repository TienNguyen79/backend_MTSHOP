import { OK, INTERNAL_SERVER_ERROR } from "../constant/http.status";
import { success } from "../results/handle.results";
import {
  loginService,
  refreshTokenService,
  registerService,
} from "../services/auth.Service";

const handleRegister = async (req, res) => {
  try {
    let data = await registerService(req.body, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleLogin = async (req, res) => {
  try {
    let data = await loginService(req.body, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleRefreshToken = async (req, res) => {
  try {
    let data = await refreshTokenService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

export { handleRegister, handleLogin, handleRefreshToken };
