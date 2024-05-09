import { Op } from "sequelize";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { updateCateValidate } from "../validate/category.Validate";
const GetAllcategoryService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const name = req.query.name;

    const offset = (page - 1) * limit;

    const whereCondition = {
      parentId: null,
    };
    if (name) {
      whereCondition.name = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    //mục đích lấy số lượng tất cả kết quả tìm được
    const getFullCate = await db.Category.findAll({
      where: whereCondition,
      raw: true,
      nest: true,
      limit: 9999,
    });

    const results1 = await db.Category.findAll({
      where: whereCondition, // Chỉ lấy các category gốc
      raw: true,
      nest: true,
      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
    });

    const results2 = await db.Category.findAll({
      where: { parentId: { [db.Sequelize.Op.ne]: null } }, // Chỉ lấy các children (có parentId khác null)
      raw: true,
      nest: true,
    });

    const mergedResults = results1.map((result) => {
      // Tìm các children tương ứng từ results2
      const children = results2.filter((item) => item.parentId === result.id);
      // Thêm children vào mỗi mục gốc
      return { ...result, children };
    });

    return res.status(OK).json(
      success(mergedResults, {
        page: page,
        limit: limit,
        totalPages: parseInt(Math.ceil(getFullCate.length / limit)),
        totalResults: getFullCate.length,
      })
    );
  } catch (error) {
    console.log("🚀 ~ GetAllcategoryService ~ error:", error);
  }
};

const addCategoryService = async (req, res) => {
  const { parentId, url, name } = req.body;
  let result = [];
  if (!parentId) {
    result = await db.Category.create({
      url: url,
      name: name,
    });
  } else {
    const rootCategory = await db.Category.findAll({
      where: { parentId: null },
      raw: true,
      nest: true,
    });

    const isSubCate = rootCategory.some(
      (item) => item.id === parseInt(parentId)
    );

    if (isSubCate) {
      result = await db.Category.create({
        parentId: parentId,
        url: url,
        name: name,
      });
    } else {
      return res
        .status(BAD_REQUEST)
        .json(error("parentId phải là của Category gốc! "));
    }
  }

  return res.status(OK).json(success(result));
};

const updateCategoryService = async (req, res) => {
  //chưa check: nếu điều kiện  id vs parentId ở mỗi hàng khác nhau thì sẽ cập nhật thất bại
  try {
    const id = parseInt(req.params.id);
    const parentId = req.query.childrenId
      ? parseInt(req.query.childrenId)
      : null;
    const { url, name } = req.body;

    const validationResult = updateCateValidate.validate({
      url: url,
      name: name,
    });

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const result = await db.Category.update(
      {
        url: url,
        name: name,
      },
      {
        where: {
          id: id,
          parentId: parentId,
        },
      }
    );
    if (result) {
      return res.status(OK).json(success("Cập nhật thành công!"));
    } else {
      return res.status(OK).json(error("Cập nhật thất bại!"));
    }
  } catch (error) {
    console.log("🚀 ~ updateCategoryService ~ error:", error);
  }
};

const deleteCategoryService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const category = await db.Category.findByPk(id, { raw: true });

    if (!category) {
      return res.status(NOT_FOUND).json(error("Không tìm thấy category"));
    }

    await db.Category.destroy({ where: { id: id } }); // Soft delete bằng cách gọi phương thức destroy , thêm force: true  để xóa mất luôn

    return res.status(OK).json(success("Xóa thành công!"));
  } catch (error) {
    console.log("🚀 ~ updateCategoryService ~ error:", error);
  }
};

const ReStoreCategoryService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Tìm kiếm category đã bị xóa mềm trong cơ sở dữ liệu
    const category = await db.Category.findByPk(id, { paranoid: false });

    if (!category) {
      return res.status(NOT_FOUND).json(error("Không tìm thấy category"));
    }

    await db.Category.restore({ where: { id: id } });

    return res.status(OK).json(success("Xóa thành công!"));
  } catch (error) {
    console.log("🚀 ~ updateCategoryService ~ error:", error);
  }
};

export {
  GetAllcategoryService,
  addCategoryService,
  updateCategoryService,
  deleteCategoryService,
};
