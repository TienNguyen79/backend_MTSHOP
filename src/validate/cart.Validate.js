import Joi from "joi";

export const cartValidate = Joi.object({
  productDetailsId: Joi.number().integer().required().messages({
    "any.required": "productDetailsId là trường bắt buộc.",
    "number.base": "productDetailsId phải là số.",
    "number.integer": "productDetailsId phải là số nguyên.",
  }),
  quantity: Joi.number().integer().required().messages({
    "any.required": "quantity là trường bắt buộc.",
    "number.base": "quantity phải là số.",
    "number.integer": "quantity phải là số nguyên.",
  }),
});
