import { Op } from "sequelize";
import { OK } from "../constant/http.status";
import db from "../models";
import { success } from "../results/handle.results";
const GetAllcategoryService = async (req, res) => {
  try {
    // const results = await db.Category.findAll({
    //   include: [
    //     {
    //       model: db.Category,
    //       as: "children",
    //       //   attributes: { exclude: ["parentId"] },
    //       //   where: { id: 5 },
    //     },
    //   ], // Sử dụng tên 'children' cho mối quan hệ 1-n
    //   //   where: {
    //   //     parentId: {
    //   //       [Op.ne]: null, // Chỉ lấy các bản ghi có parentId khác null
    //   //     },
    //   //   },
    //   raw: true,
    //   nest: true,
    // });

    const results1 = await db.Category.findAll({
      where: { parentId: null }, // Chỉ lấy các mục gốc
      raw: true,
      nest: true,
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

    return res.status(OK).json(success(mergedResults));
  } catch (error) {
    console.log("🚀 ~ GetAllcategoryService ~ error:", error);
  }
};

export { GetAllcategoryService };
