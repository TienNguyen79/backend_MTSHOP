import bcrypt from "bcrypt";
import {
  BAD_REQUEST,
  FORBIDDEN,
  OK,
  UNAUTHORIZED,
} from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { loginSchema, registerSchema } from "../validate/auth.Validate";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../commom/generateToken";
import jwt from "jsonwebtoken";
import { configs } from "../config/config.jwtkey";

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

      let results = await db.User.create({
        email: data.email,
        password: hashed,
        phoneNumber: data.phoneNumber,
        userName: data.userName,
        roleID: 0,
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
        const { email, roleID, id } = user;
        const payload = { email, roleID, id };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(id);

        refreshTokensTemp.push(refreshToken); //về sau check token có hợp lệ không
        console.log("🚀 ~ refreshTokensTemp:", refreshTokensTemp);
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

    const { email, roleId, id } = user;
    const payload = { email, roleId, id };

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
export { registerService, loginService, refreshTokenService };
