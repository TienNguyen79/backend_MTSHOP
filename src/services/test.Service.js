import db from "../models";

const testService = async () => {
  try {
    const results = db.User.findAll();
    return results;
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

export { testService };
