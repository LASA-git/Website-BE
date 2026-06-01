const mongoose = require("mongoose");
const { env } = require("./env");

const connectDatabase = async () => {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  await mongoose.connect(env.MONGODB_URI);
};

module.exports = { connectDatabase };
