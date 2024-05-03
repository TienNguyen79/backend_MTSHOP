import dotenv from "dotenv";
dotenv.config();

export const configs = {
  key: {
    private: process.env.JWT_PRIVATE_KEY,
    public: process.env.JWT_PUBLIC_KEY,
  },
};
