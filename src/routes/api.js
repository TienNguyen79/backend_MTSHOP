import express from "express";
import { success } from "../results/handle.results";
import { OK } from "../constant/http.status";
import { handleTest } from "../controllers/test.Controller";
import {
  handleForgotPass,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleRegister,
  handleSendMail,
} from "../controllers/auth.Controller";
import {
  verifyToken,
  verifyTokenAdminAuth,
} from "../middleware/handle.middleware";
import {
  handleAddCategory,
  handleGetAllCategory,
  handledeleteCategory,
  handleupdateCategory,
} from "../controllers/category.Controller";

let router = express.Router();
let routerAdmin = express.Router();

const initWebRouter = (app) => {
  //user
  router.get("/hihi", handleTest);

  //auth
  router.post("/register", handleRegister);
  router.post("/login", handleLogin);
  router.post("/refreshToken", handleRefreshToken);
  router.post("/logout", handleLogout);
  router.post("/sendMail", handleSendMail);
  router.post("/forgotPass", handleForgotPass);

  //category

  router.get("/categories", handleGetAllCategory);
  router.post("/categories", handleAddCategory);
  router.put("/categories/:id", handleupdateCategory);
  router.delete("/categories/:id", handledeleteCategory);

  return app.use("/api/v1", router);
};

const initWebRouterAdmin = (app) => {
  //admin
  routerAdmin.get("/hihi", (req, res) => {
    res.json("okok");
  });
  return app.use("/api/v1/admin", router);
};

module.exports = { initWebRouter, initWebRouterAdmin };
