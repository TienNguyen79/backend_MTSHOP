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
import {
  handleAddProduct,
  handleDeleteProduct,
  handleDeleteVariantProduct,
  handleFilterProduct,
  handleGeDetailProduct,
  handleGetAllProduct,
  handleProductReviews,
  handleQuantityvariant,
  handleSuggestProducts,
  handleUpdateProduct,
  handleUpdateQuantityVariantProduct,
} from "../controllers/product.Controller";
import {
  handleAddtoCart,
  handleDeleteCart,
  handleGetAllCart,
  handleUpdateQuantityProductInCart,
} from "../controllers/cart.Controller";
import {
  handleCancelOrder,
  handleDeleteOrder,
  handleGetAllOrder,
  handleOrderProduct,
  handleUpdateStatusOrder,
} from "../controllers/order.Controller";
import {
  handleAddUser,
  handleBanorUnBan,
  handleGetAllUser,
  handleUpdateInfoUser,
  handledeleteUser,
} from "../controllers/user.Controller";

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

  //product

  router.get("/product", handleGetAllProduct); // có thể lấy các sản phẩm của category tương ứng
  router.get("/product/:id", handleGeDetailProduct);
  router.get("/product/getQuantity/:id", handleQuantityvariant);
  router.post("/product", handleAddProduct);
  router.put("/product/:id", handleUpdateProduct);
  router.put("/product/variantProduct/:id", handleUpdateQuantityVariantProduct);
  router.delete("/product/:id", handleDeleteProduct);
  router.delete("/product/variantProduct/:id", handleDeleteVariantProduct);
  router.get("/productFilter", handleFilterProduct);
  router.get("/suggestProduct/:id", handleSuggestProducts);
  router.post("/productReviews/:id", verifyToken, handleProductReviews);
  //cart

  router.get("/cart", verifyToken, handleGetAllCart);
  router.post("/cart", verifyToken, handleAddtoCart);
  router.put("/cart", verifyToken, handleUpdateQuantityProductInCart);
  router.delete("/cart/:id", verifyToken, handleDeleteCart);

  //order
  router.get("/order", verifyToken, handleGetAllOrder);
  router.post("/order", verifyToken, handleOrderProduct); // đặt hàng
  router.put("/order/:id", handleUpdateStatusOrder);
  router.put("/cancelOrder/:id", verifyToken, handleCancelOrder); //hủy bên admin
  router.delete("/order/:id", verifyTokenAdminAuth, handleDeleteOrder); //hủy bên admin

  //user
  router.get("/user", handleGetAllUser);
  router.patch("/user", verifyToken, handleUpdateInfoUser);
  router.post("/user", handleAddUser);
  router.delete("/user/:id", handledeleteUser);
  router.put("/ban-or-unBan-User/:id", handleBanorUnBan);

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
