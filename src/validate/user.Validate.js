import Joi from "joi";

export const userValidateSchema = Joi.object({
  email: Joi.string()
    .email()
    .message("email không hợp lệ hoặc bị thiếu.")
    .required(),
  //   password: Joi.string().min(6).max(10).required().messages({
  //     "string.base": "password phải là một chuỗi.",
  //     "string.empty": "password không được để trống.",
  //     "string.min": "password phải có ít nhất {#limit} ký tự.",
  //     "string.max": "password không được vượt quá {#limit} ký tự.",
  //     "any.required": "password không được để trống.",
  //   }),
  //   // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,10}$"))
  //   // .message("password phải chứa ít nhất 1 ký tự đặc biệt, 1 chữ viết hoa"),

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

export const addUserValidateSchema = Joi.object({
  email: Joi.string()
    .email()
    .message("email không hợp lệ hoặc bị thiếu.")
    .required(),
  password: Joi.string().min(6).max(10).required().messages({
    "string.base": "password phải là một chuỗi.",
    "string.empty": "password không được để trống.",
    "string.min": "password phải có ít nhất {#limit} ký tự.",
    "string.max": "password không được vượt quá {#limit} ký tự.",
    "any.required": "password không được để trống.",
  }),
  //   // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{6,10}$"))
  //   // .message("password phải chứa ít nhất 1 ký tự đặc biệt, 1 chữ viết hoa"),

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

export const AddressValidateSchema = Joi.object({
  address: Joi.string().required().messages({
    "any.required": "address là trường bắt buộc.",
    "string.empty": "address không được để trống.",
  }),
});

export const passwordValidateSchema = Joi.object({
  password: Joi.string().min(6).max(10).required().messages({
    "string.base": "password phải là một chuỗi.",
    "string.empty": "password không được để trống.",
    "string.min": "password phải có ít nhất {#limit} ký tự.",
    "string.max": "password không được vượt quá {#limit} ký tự.",
    "any.required": "password không được để trống.",
  }),
  currentPassword: Joi.string().min(6).max(10).required().messages({
    "string.base": "currentPassword phải là một chuỗi.",
    "string.empty": "currentPassword không được để trống.",
    "string.min": "currentPassword phải có ít nhất {#limit} ký tự.",
    "string.max": "currentPassword không được vượt quá {#limit} ký tự.",
    "any.required": "currentPassword không được để trống.",
  }),
});
