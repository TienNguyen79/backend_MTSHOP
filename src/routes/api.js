import express from "express";
import { success } from "../results/handle.results";
import { OK } from "../constant/http.status";
import { handleTest } from "../controllers/test.Controller";

let router = express.Router();
let routerAdmin = express.Router();

const initWebRouter = (app) => {
  //user
  router.get("/hihi", handleTest);

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
