import mongoose, { connect } from "mongoose";
import logger from "./utils/logger.js";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined.');

  await mongoose.connect(uri, {});
  logger.info('Connected to mongoDB');
};

export default connectDB;


