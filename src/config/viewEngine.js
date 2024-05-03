const path = require("path");
import express from "express"; //commonjs
const configViewEngine = (app) => {
  //   console.log("__dirname", __dirname); D:\Box_Code\CodeNodeJS\Backend0\src\config
  app.set("views", path.join("./src", "views")); //cấu hình cái này để chạy file ejs trong view
  app.set("view engine", "ejs");

  //config static file -- kiểu để sử dụng folder public
  app.use(express.static(path.join("./src", "public")));
};

module.exports = configViewEngine; //nếu là export default(không có ngoặc) xong import chỗ khác đặt tên là gì cũng được
