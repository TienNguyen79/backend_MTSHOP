import Joi from "joi";

export const NewsValidate = Joi.object({
  categoryId: Joi.number().integer().required().messages({
    "any.required": "categoryId là trường bắt buộc.",
    "number.base": "categoryId phải là số.",
    "number.integer": "categoryId phải là số nguyên.",
  }),
  title: Joi.string().required().messages({
    "any.required": "title là trường bắt buộc.",
    "string.empty": "title không được để trống.",
  }),
  url: Joi.string().required().messages({
    "any.required": "url là trường bắt buộc.",
    "string.empty": "url không được để trống.",
  }),
  content: Joi.string().required().messages({
    "any.required": "content là trường bắt buộc.",
    "string.empty": "content không được để trống.",
  }),
});

export const NewsCommentValidate = Joi.object({
  newsId: Joi.number().integer().required().messages({
    "any.required": "newsId là trường bắt buộc.",
    "number.base": "newsId phải là số.",
    "number.integer": "newsId phải là số nguyên.",
  }),
  userId: Joi.number().integer().required().messages({
    "any.required": "userId là trường bắt buộc.",
    "number.base": "userId phải là số.",
    "number.integer": "userId phải là số nguyên.",
  }),
  content: Joi.string().required().messages({
    "any.required": "content là trường bắt buộc.",
    "string.empty": "content không được để trống.",
  }),
});
