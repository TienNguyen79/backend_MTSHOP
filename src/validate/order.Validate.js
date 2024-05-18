import Joi from "joi";

export const orderValidate = Joi.object({
  productDetails: Joi.array().min(1).required().messages({
    "any.required": "productDetails là trường bắt buộc.",
    "array.min": "productDetails không được để trống.",
    "array.base": "productDetails phải là một mảng.",
  }),
  addressId: Joi.number().integer().required().messages({
    "any.required": "addressId là trường bắt buộc.",
    "number.base": "addressId phải là số.",
    "number.integer": "addressId phải là số nguyên.",
  }),

  paymentmethoduserId: Joi.number().integer().required().messages({
    "any.required": "paymentmethoduserId là trường bắt buộc.",
    "number.base": "paymentmethoduserId phải là số.",
    "number.integer": "paymentmethoduserId phải là số nguyên.",
  }),
});
