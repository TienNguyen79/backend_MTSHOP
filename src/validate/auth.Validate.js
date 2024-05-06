import Joi from "joi";

// validate register

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .message("Email không hợp lệ hoặc bị thiếu.")
    .required(),
  password: Joi.string().min(6).max(10).required().messages({
    "string.base": "Mật khẩu phải là một chuỗi.",
    "string.empty": "Mật khẩu không được để trống.",
    "string.min": "Mật khẩu phải có ít nhất {#limit} ký tự.",
    "string.max": "Mật khẩu không được vượt quá {#limit} ký tự.",
    "any.required": "Mật khẩu không được để trống.",
  }),
  // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,10}$"))
  // .message("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt, 1 chữ viết hoa"),

  phoneNumber: Joi.string()
    .required()
    .pattern(new RegExp(/^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/))
    .messages({
      "any.required": "Số điện thoại không được để trống.",
      "string.pattern.base": "Số điện thoại không hợp lệ.",
    }),
  userName: Joi.string().required().messages({
    "any.required": "Tên không được để trống.",
  }),
});
