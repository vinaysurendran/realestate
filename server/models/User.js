import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Owner", "Builder", "Agent"], default: "Owner" },
    phoneNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);