import { Schema, model, models } from "mongoose";

// Define interfaces for TypeScript
export interface IQuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface IInformation {
  _id?: string;
  courseSlug: string;
  lectureTitle: string;
  content: string;
  quiz?: IQuizQuestion[];
}

// Define schemas
const quizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true },
});

const informationSchema = new Schema<IInformation>(
  {
    courseSlug: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    content: { type: String, required: true },
    quiz: { type: [quizQuestionSchema], default: [] },
  },
  { collection: "informations" } // Explicitly set collection name
);

// Export Mongoose model
export default models.Information ||
  model<IInformation>("Information", informationSchema);
