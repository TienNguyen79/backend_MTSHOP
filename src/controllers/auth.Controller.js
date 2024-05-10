import { OK, INTERNAL_SERVER_ERROR } from "../constant/http.status";
import { success } from "../results/handle.results";
import {
  LogoutService,
  forgotPassService,
  getCurrentUser,
  loginService,
  refreshTokenService,
  registerService,
  sendMailService,
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

const handleLogout = async (req, res) => {
  try {
    let data = await LogoutService(res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleGetCurrentUser = async (req, res) => {
  try {
    let data = await getCurrentUser(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleSendMail = async (req, res) => {
  try {
    let data = await sendMailService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

const handleForgotPass = async (req, res) => {
  try {
    let data = await forgotPassService(req, res);

    return data;
  } catch (error) {
    return res.status(INTERNAL_SERVER_ERROR).json(error);
  }
};

export {
  handleRegister,
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleSendMail,
  handleForgotPass,
  handleGetCurrentUser,
};
