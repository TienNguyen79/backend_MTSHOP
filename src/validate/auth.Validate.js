import Joi from "joi";

// validate register

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .message("email không hợp lệ hoặc bị thiếu.")
    .required(),
  password: Joi.string().min(6).max(30).required().messages({
    "string.base": "password phải là một chuỗi.",
    "string.empty": "password không được để trống.",
    "string.min": "password phải có ít nhất {#limit} ký tự.",
    "string.max": "password không được vượt quá {#limit} ký tự.",
    "any.required": "password không được để trống.",
  }),
  // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,10}$"))
  // .message("password phải chứa ít nhất 1 ký tự đặc biệt, 1 chữ viết hoa"),

  phoneNumber: Joi.string()
    .required()
    .pattern(new RegExp(/^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/))
    .messages({
      "any.required": "phoneNumber không được để trống.",
      "string.pattern.base": "phoneNumber không hợp lệ.",
    }),
  userName: Joi.string().required().messages({
    "any.required": "userName không được để trống.",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .message("email không hợp lệ hoặc bị thiếu.")
    .required(),
  password: Joi.string().min(6).max(30).required().messages({
    "string.base": "password phải là một chuỗi.",
    "string.empty": "password không được để trống.",
    "string.min": "password phải có ít nhất {#limit} ký tự.",
    "string.max": "password không được vượt quá {#limit} ký tự.",
    "any.required": "password không được để trống.",
  }),
  // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,10}$"))
  // .message("password phải chứa ít nhất 1 ký tự đặc biệt, 1 chữ viết hoa"),
});

export const emailSchema = Joi.object({
  email: Joi.string()
    .email()
    .message("email không hợp lệ hoặc bị thiếu.")
    .required(),
});
