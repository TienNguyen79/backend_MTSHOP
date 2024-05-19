import jwt from "jsonwebtoken";
import {
  HIGH_LIMIT,
  statusRole,
  statusUser,
} from "../constant/constant.commom";
import { BAD_REQUEST, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import bcrypt from "bcrypt";
import {
  addUserValidateSchema,
  userValidateSchema,
} from "../validate/user.Validate";
import { configs } from "../config/config.jwtkey";

const getAllUserService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const name = req.query.name;

    const whereCondition = {};
    if (name) {
      whereCondition.userName = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    const getFullUser = await db.User.findAll({
      where: whereCondition,
      limit: HIGH_LIMIT,
    });

    const results = await db.User.findAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
    });

    return res.status(OK).json(
      success(results, {
        page: page,
        limit: limit,
        totalPages: parseInt(Math.ceil(getFullUser.length / limit)),
        totalResults: getFullUser.length,
      })
    );
  } catch (error) {
    console.log("🚀 ~ getAllUserService ~ error:", error);
  }
};

const addUserService = async (req, res) => {
  try {
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const roleID = req.body.roleID;

    const phoneNumber = req.body.phoneNumber;

    const validationResult = addUserValidateSchema.validate({
      userName: userName,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
    });
    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const user = await db.User.findOne({
      where: { email: email },
      raw: true,
    });

    if (user) {
      return res.status(BAD_REQUEST).json(error("Email đã tồn tại !"));
    }

    const phoneNumberCheck = await db.User.findOne({
      where: { phoneNumber: phoneNumber },
      raw: true,
    });

    if (phoneNumberCheck) {
      return res.status(BAD_REQUEST).json(error("Số điện thoại đã tồn tại !"));
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const results = await db.User.create({
      userName: userName,
      email: email,
      password: hashed,
      phoneNumber: phoneNumber,
      roleID: roleID || statusRole.USER,
      avatar: "",
      status: 0,
    });
    if (results) {
      return res.status(OK).json(success(results));
    } else {
      return res.status(BAD_REQUEST).json(error("Thêm User thất bại !"));
    }
  } catch (error) {
    console.log("🚀 ~ addUserService ~ error:", error);
  }
};

// cho người dùng
const updateInfoUserService = async (req, res) => {
  try {
    const userName = req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const phoneNumber = req.body.phoneNumber;
    const avatar = req.body.avatar;
    const token = req.headers.authorization;

    const salt = await bcrypt.genSalt(10);

    const validationResult = userValidateSchema.validate({
      userName: userName,
      email: email,
      phoneNumber: phoneNumber,
    });
    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, configs.key.private, async (err, user) => {
        if (err) {
          return res.status(FORBIDDEN).json(error("Token không hợp lệ"));
        }
        console.log("🚀 ~ jwt.verify ~ user:", user);

        const whereUpdate = {
          userName: userName,
          email: email,
          phoneNumber: phoneNumber,
          avatar: avatar || "",
        };

        if (password) {
          whereUpdate.password = await bcrypt.hash(password, salt);
        }

        const updateInforUser = await db.User.update(whereUpdate, {
          where: { id: user.id },
        });

        if (updateInforUser[0] > 0) {
          return res.status(OK).json(success("Cập nhật thành công !"));
        } else {
          return res.status(BAD_REQUEST).json(error("Cập nhật thất bại !"));
        }
      });
    }
  } catch (error) {
    console.log("🚀 ~ updateInfoUser ~ error:", error);
  }
};

const switchStatusBanorUnBanService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const user = await db.User.findOne({
      where: { id: id },
      raw: true,
    });

    if (user.status === statusUser.NORMAL) {
      const updateStatus = await db.User.update(
        {
          status: statusUser.BAN,
        },
        { where: { id: id } }
      );
      if (updateStatus[0] > 0) {
        return res.status(OK).json(success("User đã bị BAN !"));
      }
    } else {
      const updateStatus = await db.User.update(
        {
          status: statusUser.NORMAL,
        },
        { where: { id: id } }
      );
      if (updateStatus[0] > 0) {
        return res.status(OK).json(success("User đã được UNBAN !"));
      }
    }
  } catch (error) {
    console.log("🚀 ~ switchStatusBanorUnBanService ~ error:", error);
  }
};

const deleteUserService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deleteUser = await db.User.destroy({
      where: { id: id },
    });

    if (deleteUser) {
      return res.status(OK).json(success("Xóa thành Công!"));
    } else {
      return res.status(BAD_REQUEST).json(success("Xóa thất bại!"));
    }
  } catch (error) {
    console.log("🚀 ~ deleteUserService ~ error:", error);
  }
};

export {
  getAllUserService,
  updateInfoUserService,
  addUserService,
  switchStatusBanorUnBanService,
  deleteUserService,
};
