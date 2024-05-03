import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, configs.key.private, (err, user) => {
      if (err) {
        return res.status(403).json({ ms: "Token is not valid " });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ ms: "You are not authentication " });
  }
};

const verifyTokenAdminAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.roleId === "admin") {
      next();
    } else {
      return res.status(403).json({ ms: "You are not allowed " });
    }
  });
};

export { verifyToken, verifyTokenAdminAuth };
