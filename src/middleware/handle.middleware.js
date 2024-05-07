import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import { FORBIDDEN, UNAUTHORIZED } from "../constant/http.status";
import { error } from "../results/handle.results";
import { statusRole } from "../constant/constant.commom";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, configs.key.private, (err, user) => {
      if (err) {
        return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
      }
      req.user = user;
      next();
    });
  } else {
    res.status(UNAUTHORIZED).json(error("Bạn cần đăng nhập"));
  }
};

const verifyTokenAdminAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.roleID === statusRole.ADMIN) {
      next();
    } else {
      return res.status(FORBIDDEN).json(error("Bạn không có quyền !"));
    }
  });
};

export { verifyToken, verifyTokenAdminAuth };
