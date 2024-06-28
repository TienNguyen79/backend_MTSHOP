import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import { FORBIDDEN, UNAUTHORIZED } from "../constant/http.status";
import { error } from "../results/handle.results";
import { statusRole, statusUser } from "../constant/constant.commom";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, configs.key.private, (err, user) => {
      console.log("🚀 ~ jwt.verify ~ err:", err);
      if (err) {
        return res.status(UNAUTHORIZED).json(error("Token không hợp lệ"));
      }
      if (user.status === statusUser.BAN) {
        return res
          .status(FORBIDDEN)
          .json(error("Tài khoản của bạn đã bị cấm!"));
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
    if (
      req.user.roleID === statusRole.ADMIN ||
      req.user.roleID === statusRole.STAFF
    ) {
      next();
    } else {
      return res.status(FORBIDDEN).json(error("Bạn không có quyền !"));
    }
  });
};

export { verifyToken, verifyTokenAdminAuth };
