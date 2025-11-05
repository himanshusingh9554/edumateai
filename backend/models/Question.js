import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
