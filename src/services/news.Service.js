import { HIGH_LIMIT } from "../constant/constant.commom";
import { BAD_REQUEST, NOT_FOUND, OK } from "../constant/http.status";
import db from "../models";
import { error, success } from "../results/handle.results";
import { NewsCommentValidate, NewsValidate } from "../validate/news.Validate";
const getAllNewsService = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const title = req.query.title;
    const category = req.query.category;

    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (title) {
      whereCondition.title = { [db.Sequelize.Op.like]: `%${title}%` };
    }

    if (category) {
      whereCondition.categoryId = parseInt(category);
    }

    const getFullNews = await db.News.findAll({
      where: whereCondition,
      raw: true,
      nest: true,
      limit: HIGH_LIMIT,
    });

    const results = await db.News.findAll({
      where: whereCondition,
      attributes: {
        exclude: ["categoryId"], //bỏ field này đi
      },
      include: [{ model: db.Category, as: "category" }],
      raw: true,
      nest: true,
      limit: limit, // Áp dụng giới hạn
      offset: offset, // Lấy data từ offset trở đi
      order: [["createdAt", "DESC"]],
    });

    return res.status(OK).json(
      success(results, {
        page: page,
        limit: limit,
        totalPages: parseInt(Math.ceil(getFullNews.length / limit)),
        totalResults: getFullNews.length,
      })
    );
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

const getDetailsNewsService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await db.News.findOne({
      where: { id: id },
      attributes: {
        exclude: ["categoryId"], //bỏ field này đi
      },
      include: [{ model: db.Category, as: "category" }],
      raw: true,
      nest: true,
    });

    return res.status(OK).json(success(result));
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

const addNewsService = async (req, res) => {
  try {
    const validationResult = NewsValidate.validate(req.body);

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const { title, url, content, categoryId } = req.body;

    const isCategory = await db.Category.findByPk(categoryId, { raw: true });

    if (isCategory) {
      const result = await db.News.create({
        title: title,
        url: url,
        content: content,
        categoryId: categoryId,
      });
      return res.status(OK).json(success(result));
    } else {
      return res.status(NOT_FOUND).json(error("CategoryId không tồn tại!"));
    }
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

const updateNewsService = async (req, res) => {
  try {
    const { title, url, content, categoryId } = req.body;

    const validationResult = NewsValidate.validate({
      categoryId: categoryId,
      title: title,
      url: url,
      content: content,
    });

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const id = parseInt(req.params.id);

    const isCategory = await db.Category.findByPk(categoryId, { raw: true });

    if (isCategory) {
      const result = await db.News.update(
        {
          title: title,
          url: url,
          content: content,
          categoryId: categoryId,
        },
        {
          where: { id: id },
        }
      );
      console.log("🚀 ~ updateNewsService ~ result:", result);
      if (result) {
        return res.status(OK).json(success("Cập nhật Tin tức thành công"));
      } else {
        return res.status(BAD_REQUEST).json(error("Cập nhật Tin tức thất bại"));
      }
    } else {
      return res.status(NOT_FOUND).json(error("CategoryId không tồn tại!"));
    }
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

const deleteNewsService = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const results = await db.News.destroy({ where: { id: id } });
    console.log("🚀 ~ deleteNewsService ~ results:", results);
    if (results) {
      return res.status(OK).json(success("Xóa tin tức thành công!"));
    } else {
      return res.status(BAD_REQUEST).json(error("Xóa tin tức thất bại!"));
    }
  } catch (error) {
    console.log("🚀 ~ deleteNewsService ~ error:", error);
  }
};

const getNewsComment = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const idNews = parseInt(req.params.idNews);

    const getAllCmtInNews = await db.NewsComment.findAll({
      where: { newsId: idNews },
    });

    const isIdNews = await db.News.findByPk(idNews, { raw: true });

    if (isIdNews) {
      const results = await db.NewsComment.findAll({
        where: { newsId: idNews },
        attributes: {
          exclude: ["userId"], //bỏ field này đi
        },
        include: [{ model: db.User, as: "user" }],

        raw: true,
        nest: true,
        limit: limit, // Áp dụng giới hạn
        offset: offset, // Lấy data từ offset trở đi
        order: [["createdAt", "DESC"]],
      });

      return res.status(OK).json(
        success(results, {
          page: page,
          limit: limit,
          totalPages: parseInt(Math.ceil(getAllCmtInNews.length / limit)),
          totalResults: getAllCmtInNews.length,
        })
      );
    } else {
      return res.status(NOT_FOUND).json(error("Không tồn tại News"));
    }
  } catch (error) {
    console.log("🚀 ~ getNewsComment ~ error:", error);
  }
};

const addNewsComment = async (req, res) => {
  try {
    const validationResult = NewsCommentValidate.validate(req.body);

    if (validationResult.error) {
      return res
        .status(BAD_REQUEST)
        .json(error(validationResult.error.details[0].message));
    }

    const { content, newsId, userId } = req.body;

    const isNewsId = await db.News.findByPk(newsId, { raw: true });
    const isUserId = await db.User.findByPk(userId, { raw: true });

    if (isNewsId && isUserId) {
      const results = await db.NewsComment.create({
        content: content,
        newsId: newsId,
        userId: userId,
      });

      return res.status(OK).json(success(results));
    } else {
      return res
        .status(BAD_REQUEST)
        .json(error("Không tồn tại User hoặc Blog"));
    }
  } catch (error) {
    console.log("🚀 ~ getNewsComment ~ error:", error);
  }
};

export {
  getAllNewsService,
  getDetailsNewsService,
  addNewsService,
  updateNewsService,
  deleteNewsService,
  getNewsComment,
  addNewsComment,
};
