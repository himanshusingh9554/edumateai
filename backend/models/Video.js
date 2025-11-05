import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    title: { type: String },
    transcript: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Video", videoSchema);
