import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseSlug: { type: String, required: true },
  completedLectures: [{ type: String }], // Stores lecture titles
  completionPercentage: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Progress ||
  mongoose.model("Progress", progressSchema);
