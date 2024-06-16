import Joi from "joi";

export const paymentValidate = Joi.object({
  amount: Joi.number().integer().required().messages({
    "any.required": "amount là trường bắt buộc.",
    "number.base": "amount phải là số.",
    "number.integer": "amount phải là số nguyên.",
  }),

  description: Joi.string().required().messages({
    "any.required": "description là trường bắt buộc.",
    "string.empty": "description không được để trống.",
  }),

  cancelUrl: Joi.string().required().messages({
    "any.required": "cancelUrl là trường bắt buộc.",
    "string.empty": "cancelUrl không được để trống.",
  }),

  returnUrl: Joi.string().required().messages({
    "any.required": "returnUrl là trường bắt buộc.",
    "string.empty": "returnUrl không được để trống.",
  }),
});
