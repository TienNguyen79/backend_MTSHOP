import bcrypt from "bcrypt";
import { BAD_REQUEST, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { registerSchema } from "../validate/auth.Validate";

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
      });

      return res.status(OK).json({ ms: "Đăng kí thành công!" });
    }
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

export { registerService };
