import Joi from "joi";

export const updateCateValidate = Joi.object({
  // parentId: Joi.required().messages({
  //   "any.required": "parentId là trường bắt buộc.",
  // }),
  name: Joi.string().required().messages({
    "any.required": "Tên là trường bắt buộc.",
    "string.empty": "Tên không được để trống.",
  }),
  url: Joi.string().required().messages({
    "any.required": "Ảnh là trường bắt buộc.",
    "string.empty": "Ảnh không được để trống.",
  }),
});
