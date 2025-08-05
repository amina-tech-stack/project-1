import mongoose from "mongoose";

const courseContentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseSlug: { type: String, required: true },
  lectureTitle: { type: String, required: true },
  content: { type: String, required: true },
});

export default mongoose.models.CourseContent ||
  mongoose.model("CourseContent", courseContentSchema);
