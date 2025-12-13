import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    const uri = process.env.MONGODB_URI; // ✅ Correct way to access .env variable
    if (!uri) throw new Error("MONGODB_URI is not defined in environment variables");

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

export default connectDB;
