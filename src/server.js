import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import { initWebRouter, initWebRouterAdmin } from "./routes/api";
import connectDB from "./config/connectDB";
const cors = require("cors");
import cookieParser from "cookie-parser";
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8888; //port
//config app

//cho phép phía FE gọi api
app.use(
  cors({
    origin: true, // cho phép kết nối từ cùng origin với server
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // cho phép nhận cookie bên phía client
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(cookieParser());

//config req.body --để lấy data từ form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

viewEngine(app);
initWebRouter(app);
initWebRouterAdmin(app);
connectDB();

app.listen(port, () => {
  console.log(`Backend zero listening on port ${port}`);
});
