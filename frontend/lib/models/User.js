import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userid: { type: String, required: true, unique: true }, // new unique userid
  name: { type: String, required: true },
  email: { type: String, required: false, unique: false }, // optional
  password: { type: String, required: true }, // hashed
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
