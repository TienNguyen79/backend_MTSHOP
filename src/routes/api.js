import express from "express";
import { success } from "../results/handle.results";
import { OK } from "../constant/http.status";
import { handleTest } from "../controllers/test.Controller";
import {
  handleLogin,
  handleRefreshToken,
  handleRegister,
} from "../controllers/auth.Controller";
import { verifyToken } from "../middleware/handle.middleware";

let router = express.Router();
let routerAdmin = express.Router();

const initWebRouter = (app) => {
  //user
  router.get("/hihi", verifyToken, handleTest);

  //auth
  router.post("/register", handleRegister);
  router.post("/login", handleLogin);
  router.post("/refreshToken", handleRefreshToken);

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
