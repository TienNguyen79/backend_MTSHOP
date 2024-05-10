import express from "express";
import { success } from "../results/handle.results";
import { OK } from "../constant/http.status";
import { handleTest } from "../controllers/test.Controller";
import {
  handleForgotPass,
  handleGetCurrentUser,
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
  handleRestoreCategory,
  handledeleteCategory,
  handleupdateCategory,
} from "../controllers/category.Controller";
import {
  handleAddNews,
  handleAddNewsComment,
  handleDeleteNews,
  handleGetAllNews,
  handleGetDetailsNews,
  handleGetNewsComment,
  handleUpdateNews,
} from "../controllers/news.Controller";

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
  router.get("/currentUser", handleGetCurrentUser);

  //category

  router.get("/categories", handleGetAllCategory);
  router.post("/categories", handleAddCategory);
  router.put("/categories/:id", handleupdateCategory);
  router.delete("/categories/:id", handledeleteCategory);
  router.put("/categories/restore/:id", handleRestoreCategory);

  //news
  router.get("/news", handleGetAllNews);
  router.get("/news/:id", handleGetDetailsNews);
  router.put("/news/:id", handleUpdateNews);
  router.post("/news", handleAddNews);
  router.delete("/news/:id", handleDeleteNews);
  router.get("/newsComment/:idNews", handleGetNewsComment); //get comment trong từng blog
  router.post("/newsComment", handleAddNewsComment);

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
