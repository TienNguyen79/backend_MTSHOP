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
  handleGetAllSize,
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
  handleGetDetailsOrder,
  handleOrderProduct,
  handleUpdateStatusOrder,
} from "../controllers/order.Controller";
import {
  handleAddAddressUser,
  handleAddUser,
  handleBanorUnBan,
  handleGetAllUser,
  handleUpdateInfoUser,
  handledeleteUser,
} from "../controllers/user.Controller";
import {
  handleCancelOrderPayment,
  handleCompletedOrderPaymentService,
  handleCreateLinkPayment,
  handlegetOrderPayment,
} from "../controllers/payment.Controller";

let router = express.Router();
let routerAdmin = express.Router();

const initWebRouter = (app) => {
  //user
  router.get("/hihi", handleTest);

  //auth
  router.post("/register", handleRegister); //ok
  router.post("/login", handleLogin); //ok
  router.post("/refreshToken", handleRefreshToken); // cần xem xét
  router.post("/logout", verifyToken, handleLogout); // ok
  router.post("/sendMail", handleSendMail); //ok
  router.post("/forgotPass", handleForgotPass); //ok
  router.get("/currentUser", verifyToken, handleGetCurrentUser); //ok

  //category

  router.get("/categories", handleGetAllCategory);
  router.post("/categories", verifyTokenAdminAuth, handleAddCategory);
  router.put("/categories/:id", verifyTokenAdminAuth, handleupdateCategory);
  router.delete("/categories/:id", verifyTokenAdminAuth, handledeleteCategory);
  router.put(
    "/categories/restore/:id",
    verifyTokenAdminAuth,
    handleRestoreCategory
  );

  //news
  router.get("/news", handleGetAllNews);
  router.get("/news/:id", handleGetDetailsNews);
  router.put("/news/:id", verifyTokenAdminAuth, handleUpdateNews);
  router.post("/news", verifyTokenAdminAuth, handleAddNews);
  router.delete("/news/:id", verifyTokenAdminAuth, handleDeleteNews);
  router.get("/newsComment/:idNews", handleGetNewsComment); //get comment trong từng blog
  router.post("/newsComment", verifyToken, handleAddNewsComment);

  //product

  router.get("/product", handleGetAllProduct); // có thể lấy các sản phẩm của category tương ứng
  router.get("/product/sizes", handleGetAllSize); // muốn định nghĩa như này phải để trên /product/:id
  router.get("/product/:id", handleGeDetailProduct);
  router.post("/product/getQuantity/:id", handleQuantityvariant);
  router.post("/product", verifyTokenAdminAuth, handleAddProduct);
  router.put("/product/:id", verifyTokenAdminAuth, handleUpdateProduct);
  router.put(
    "/product/variantProduct/:id",
    verifyTokenAdminAuth,
    handleUpdateQuantityVariantProduct
  );
  router.delete("/product/:id", verifyTokenAdminAuth, handleDeleteProduct);
  router.delete(
    "/product/variantProduct/:id",
    verifyTokenAdminAuth,
    handleDeleteVariantProduct
  );
  router.get("/productFilter", handleFilterProduct);
  router.get("/suggestProduct/:id", handleSuggestProducts);
  router.post("/productReviews/:idOrder", verifyToken, handleProductReviews);

  //cart

  router.get("/cart", verifyToken, handleGetAllCart);
  router.post("/cart", verifyToken, handleAddtoCart);
  router.put("/cart", verifyToken, handleUpdateQuantityProductInCart);
  router.delete("/cart/:id", verifyToken, handleDeleteCart);

  //order
  router.get("/order", verifyToken, handleGetAllOrder);
  router.get("/order/:id", verifyToken, handleGetDetailsOrder);
  router.post("/order", verifyToken, handleOrderProduct); // đặt hàng
  router.put("/order/:id", verifyToken, handleUpdateStatusOrder);
  router.put("/cancelOrder/:id", verifyToken, handleCancelOrder); //hủy bên admin
  router.delete("/order/:id", verifyTokenAdminAuth, handleDeleteOrder); //hủy bên admin

  //user
  router.get("/user", verifyTokenAdminAuth, handleGetAllUser);
  router.put("/user", verifyToken, handleUpdateInfoUser);
  router.post("/user", verifyTokenAdminAuth, handleAddUser);
  router.post("/address", verifyToken, handleAddAddressUser);
  router.delete("/user/:id", verifyTokenAdminAuth, handledeleteUser);
  router.put("/ban-or-unBan-User/:id", verifyTokenAdminAuth, handleBanorUnBan);

  //payment
  router.post("/payment/createLink", handleCreateLinkPayment);
  router.get("/payment/:idOrder", handlegetOrderPayment);
  router.put("/payment/cancel/:idOrder", handleCancelOrderPayment);
  router.put("/payment/success/:idOrder", handleCompletedOrderPaymentService);

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
