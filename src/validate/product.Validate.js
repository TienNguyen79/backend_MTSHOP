import Joi from "joi";

export const productValidate = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "name là trường bắt buộc.",
    "string.empty": "name không được để trống.",
  }),

  categoryId: Joi.number().integer().required().messages({
    "any.required": "categoryId là trường bắt buộc.",
    "number.base": "categoryId phải là số.",
    "number.integer": "categoryId phải là số nguyên.",
  }),

  description: Joi.string().required().messages({
    "any.required": "description là trường bắt buộc.",
    "string.empty": "description không được để trống.",
  }),

  price: Joi.number().integer().required().messages({
    "any.required": "price là trường bắt buộc.",
    "number.base": "price phải là số.",
    "number.integer": "price phải là số nguyên.",
  }),

  // discount: Joi.number().integer().min(0).max(100).required().messages({
  //   "any.required": "discount là trường bắt buộc.",
  //   "number.base": "discount phải là số.",
  //   "number.integer": "discount phải là số nguyên.",
  //   "number.min": "discount phải lớn hơn hoặc bằng 0.",
  //   "number.max": "discount phải nhỏ hơn hoặc bằng 100.",
  // }),
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "quantity là trường bắt buộc.",
    "number.base": "quantity phải là số.",
    "number.integer": "quantity phải là số nguyên.",
    "number.min": "quantity phải lớn hơn 0.",
  }),

  properties: Joi.required().messages({
    "any.required": "properties là trường bắt buộc.",
    "string.empty": "properties không được để trống.",
  }),
  image: Joi.array().min(1).required().messages({
    "any.required": "image là trường bắt buộc.",
    "array.min": "image không được để trống.",
    "array.base": "image phải là một mảng.",
  }),
});

export const updateproductValidate = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "name là trường bắt buộc.",
    "string.empty": "name không được để trống.",
  }),

  categoryId: Joi.number().integer().required().messages({
    "any.required": "categoryId là trường bắt buộc.",
    "number.base": "categoryId phải là số.",
    "number.integer": "categoryId phải là số nguyên.",
  }),

  description: Joi.string().required().messages({
    "any.required": "description là trường bắt buộc.",
    "string.empty": "description không được để trống.",
  }),

  price: Joi.number().integer().required().messages({
    "any.required": "price là trường bắt buộc.",
    "number.base": "price phải là số.",
    "number.integer": "price phải là số nguyên.",
  }),

  // discount: Joi.number().integer().min(0).max(100).required().messages({
  //   "any.required": "discount là trường bắt buộc.",
  //   "number.base": "discount phải là số.",
  //   "number.integer": "discount phải là số nguyên.",
  //   "number.min": "discount phải lớn hơn hoặc bằng 0.",
  //   "number.max": "discount phải nhỏ hơn hoặc bằng 100.",
  // }),
  // quantity: Joi.number().integer().min(1).required().messages({
  //   "any.required": "quantity là trường bắt buộc.",
  //   "number.base": "quantity phải là số.",
  //   "number.integer": "quantity phải là số nguyên.",
  //   "number.min": "quantity phải lớn hơn 0.",
  // }),
  image: Joi.array().min(1).required().messages({
    "any.required": "image là trường bắt buộc.",
    "array.min": "image không được để trống.",
    "array.base": "image phải là một mảng.",
  }),
});

export const updateQuantityVariantValidate = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "quantity là trường bắt buộc.",
    "number.base": "quantity phải là số.",
    "number.integer": "quantity phải là số nguyên.",
    "number.min": "quantity phải lớn hơn 0.",
  }),
});

export const reviewProductValidate = Joi.object({
  idProduct: Joi.number().integer().required().messages({
    "any.required": "idProduct là trường bắt buộc.",
    "number.base": "idProduct phải là số.",
    "number.integer": "idProduct phải là số nguyên.",
  }),
  description: Joi.string().required().messages({
    "any.required": "description là trường bắt buộc.",
    "string.empty": "description không được để trống.",
  }),
  rate: Joi.string().required().messages({
    "any.required": "rate là trường bắt buộc.",
    "string.empty": "rate không được để trống.",
  }),
});

export const typeVariantValidate = Joi.object({
  type: Joi.string().required().messages({
    "any.required": "type là trường bắt buộc.",
    "string.empty": "type không được để trống.",
  }),
});

export const AddproductDetailsValidate = Joi.object({
  idProduct: Joi.number().integer().required().messages({
    "any.required": "idProduct là trường bắt buộc.",
    "number.base": "idProduct phải là số.",
    "number.integer": "idProduct phải là số nguyên.",
  }),
  quantity: Joi.number().integer().required().messages({
    "any.required": "quantity là trường bắt buộc.",
    "number.base": "quantity phải là số.",
    "number.integer": "quantity phải là số nguyên.",
  }),
});
