import bcrypt from "bcrypt";
import {
  BAD_REQUEST,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
} from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import {
  emailSchema,
  loginSchema,
  registerSchema,
} from "../validate/auth.Validate";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../commom/generateToken";
import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";
import sendMail from "../commom/mailer";

let refreshTokensTemp = [];

//register
const registerService = async (data, res) => {
  try {
    const validationResult = registerSchema.validate(data);
    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(data.password, salt);

      const user = await db.User.findOne({
        where: { email: data.email },
        raw: true,
      });

      if (user) {
        return res.status(BAD_REQUEST).json(error("Email đã tồn tại !"));
      }

      const phoneNumberCheck = await db.User.findOne({
        where: { phoneNumber: data.phoneNumber },
        raw: true,
      });

      if (phoneNumberCheck) {
        return res
          .status(BAD_REQUEST)
          .json(error("Số điện thoại đã tồn tại !"));
      }

      let results = await db.User.create({
        email: data.email,
        password: hashed,
        phoneNumber: data.phoneNumber,
        userName: data.userName,
        roleID: 1,
        status: 0,
      });

      return res.status(OK).json({ ms: "Đăng kí thành công!" });
    }
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

//login
const loginService = async (data, res) => {
  try {
    const validationResult = loginSchema.validate(data);
    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    } else {
      const user = await db.User.findOne({
        where: { email: data.email },
        raw: true,
      });

      if (!user) {
        return res.status(FORBIDDEN).json(error("Email không tồn tại!"));
      }

      const validPassword = await bcrypt.compare(data.password, user.password);

      if (!validPassword) {
        return res.status(FORBIDDEN).json(error("password sai !"));
      }

      if (user && validPassword) {
        const { email, roleID, id, status } = user;
        const payload = { email, roleID, id, status };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(id);

        refreshTokensTemp.push(refreshToken); //về sau check token có hợp lệ không
        // lưu vào cookie
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "",
          expires: expiryDate,
        });
        const { password, ...rest } = user; // không muốn password hiện ra

        return res.status(OK).json(
          success(rest, {
            token: {
              accessToken: accessToken,
              refreshToken: refreshToken,
            },
          })
        );
      }
    }
  } catch (error) {
    console.log("🚀 ~ loginService ~ error:", error);
  }
};

//refreshtoken

const refreshTokenService = async (req, res) => {
  const refreshToken = req.cookies.refreshToken; // lấy refreshToken trong cookie xử lý ở login

  if (!refreshToken)
    return res.status(UNAUTHORIZED).json(error("Chưa xác thực!"));

  if (!refreshTokensTemp.includes(refreshToken)) {
    //nếu có refresh token nhưng không phải của mình
    return res.status(UNAUTHORIZED).json(error("Refresh token không tồn tại!"));
  }

  jwt.verify(refreshToken, configs.key.public, async (err, data) => {
    if (err) {
      return res.status(UNAUTHORIZED).json(error(err));
    }

    refreshTokensTemp = refreshTokensTemp.filter(
      (token) => token != refreshToken
    );

    const idUser = data.id;

    const user = await db.User.findOne({
      where: { id: idUser },
      raw: true,
    });

    const { email, roleId, id, status } = user;
    const payload = { email, roleId, id, status };

    const newaccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(id);

    refreshTokensTemp.push(newRefreshToken);

    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //thời gian cookie sống 7d

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "",
      expires: expiryDate,
    });

    return res.status(OK).json({ accessToken: newaccessToken });
  });
};

const LogoutService = async (res) => {
  res.clearCookie("refreshToken");
  return res.status(OK).json({ ms: "Đăng xuất thành công!" });
};

//get currentUser
const getCurrentUser = async (req, res) => {
  const token = req.headers.authorization;

  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, configs.key.private, async (err, user) => {
      if (err) {
        return res.status(UNAUTHORIZED).json(error("Token không hợp lệ"));
      }

      const getUser = await db.User.findOne({ where: { id: user.id } });
      return res.status(OK).json(success(getUser));
    });
  }
};

const sendMailService = async (req, res) => {
  try {
    const validationResult = emailSchema.validate(req.body);
    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const { email } = req.body;

    const isEmail = await db.User.findOne({ where: { email: email } });

    if (!isEmail) {
      return res.status(NOT_FOUND).json(error("Email không tồn tại!"));
    }

    bcrypt
      .hash(email, parseInt(process.env.BCRYPT_SALT_ROUND))
      .then((hashedEmail) => {
        // res.cookie("tokenForgotPass", hashedEmail, {
        //   httpOnly: true,
        //   secure: false,
        //   sameSite: "",
        //   maxAge: 30000, //30s
        // });

        sendMail(
          email,
          "Xác nhận Email",

          `    <p>Xin Chào,</p>
               <p>Bạn đã yêu cầu thay đổi mật khẩu cho tài khoản của mình.</p>
               <p>Vui lòng nhấn vào liên kết dưới đây để xác nhận thay đổi:</p>
               <p><a  href="${process.env.APP_URL}/resetpass?email=${email}&token=${hashedEmail}"> Xác Nhận </a></p>
               <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
               <p>Trân trọng,</p>
               <p>Đội ngũ quản trị viên MTSHOP</p>`
        );
        return res.status(OK).json({ ms: "Send Mail successfully !" });
      })

      .catch((error) => {
        return res
          .status(INTERNAL_SERVER_ERROR)
          .json(error("Internal server error"));
      });
  } catch (error) {
    console.log("🚀 ~ sendMailService ~ error:", error);
  }
};

const forgotPassService = async (req, res) => {
  const tokenForgotPass = req.cookies.tokenForgotPass; //đã lưu khi gửi mail giờ lấy ra

  if (!tokenForgotPass)
    return res.status(UNAUTHORIZED).json(error("Token đã hết hạn!"));
  const { email, password } = req.body;
  try {
    const response = await db.User.findOne({
      where: { email: email },
      raw: true,
    });

    if (response) {
      bcrypt.compare(email, tokenForgotPass, async (err, result) => {
        const salt = await bcrypt.genSalt(10);
        const PassHashed = await bcrypt.hash(password, salt);

        if (result) {
          await db.User.update(
            { password: PassHashed },
            {
              where: {
                email: email,
              },
            }
          );
          return res.status(OK).json({ ms: "Thay đổi mật khẩu thành công" });
        } else {
          return res
            .status(BAD_REQUEST)
            .json(error("Thay đổi mật khẩu thất bại"));
        }
      });
    } else {
      return res.status(UNAUTHORIZED).json(error("Email không tồn tại!"));
    }
  } catch (error) {
    console.log("🚀 ~ forgotPassService ~ error:", error);
  }
};

export {
  registerService,
  loginService,
  refreshTokenService,
  LogoutService,
  sendMailService,
  forgotPassService,
  getCurrentUser,
};
