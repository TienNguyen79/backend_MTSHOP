import Joi from "joi";

export const updateCateValidate = Joi.object({
  // parentId: Joi.required().messages({
  //   "any.required": "parentId là trường bắt buộc.",
  // }),
  name: Joi.string().required().messages({
    "any.required": "name là trường bắt buộc.",
    "string.empty": "name không được để trống.",
  }),
  url: Joi.string().required().messages({
    "any.required": "url là trường bắt buộc.",
    "string.empty": "url không được để trống.",
  }),
});
