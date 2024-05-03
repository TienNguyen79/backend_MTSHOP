import { Sequelize } from "sequelize";

// // Option 3: Passing parameters separately (other dialects)
const sequelize = new Sequelize("test", "root", null, {
  host: "localhost",
  dialect: "mysql",
  logging: false, //để bỏ Executing (default): SELECT 1+1 AS result
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default connectDB;
