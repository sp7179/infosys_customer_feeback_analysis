import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  userid: { type: String, required: true, unique: true }, // link to User.userid
  fullName: { type: String, default: "" },
  displayName: { type: String, default: "" },
  phone: { type: String, default: "" },
  city: { type: String, default: "" },
  bio: { type: String, default: "" },
  website: { type: String, default: "" },
  email: { type: String, default: "" }, // optional display email
  photo: { type: String, default: "" }, // base64 data URL or external URL
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
