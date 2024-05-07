import db from "../models";
const testService = async () => {
  try {
    const results = db.User.findAll({
      attributes: {
        exclude: ["roleID"], //bỏ field này đi
      },
      include: [{ model: db.Role }], //lấy hết
      raw: true,
      nest: true, // khi trả ra api nó sẽ nhìn clean .. nằm trong {}
    });

    return results;
  } catch (error) {
    console.log("🚀 ~ testService ~ error:", error);
  }
};

export { testService };
