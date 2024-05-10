import { error } from "../results/handle.results";
import {
  addNewsComment,
  addNewsService,
  deleteNewsService,
  getAllNewsService,
  getDetailsNewsService,
  getNewsComment,
  updateNewsService,
} from "../services/news.Service";

const handleGetAllNews = async (req, res) => {
  try {
    let data = await getAllNewsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleGetDetailsNews = async (req, res) => {
  try {
    let data = await getDetailsNewsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleAddNews = async (req, res) => {
  try {
    let data = await addNewsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleUpdateNews = async (req, res) => {
  try {
    let data = await updateNewsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleDeleteNews = async (req, res) => {
  try {
    let data = await deleteNewsService(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleGetNewsComment = async (req, res) => {
  try {
    let data = await getNewsComment(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

const handleAddNewsComment = async (req, res) => {
  try {
    let data = await addNewsComment(req, res);

    return data;
  } catch (error1) {
    return res.status(INTERNAL_SERVER_ERROR).json(error(error1));
  }
};

export {
  handleGetAllNews,
  handleGetDetailsNews,
  handleAddNews,
  handleUpdateNews,
  handleDeleteNews,
  handleGetNewsComment,
  handleAddNewsComment,
};
