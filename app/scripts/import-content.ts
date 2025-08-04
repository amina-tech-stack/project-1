import mongoose from "mongoose";
import connectToDatabase from "../../lib/mongodb";
import CourseContentModel from "../../models/CourseContent";
import frontEndContent from "../informations/front-end-devlopement-content.json";
import backEndContent from "../informations/back-end-devlopement-content.json";
import aiContent from "../informations/artificial-intelligence-content.json";
import cybersecurityContent from "../informations/cybersecurity-content.json";

async function importContent() {
  try {
    await connectToDatabase();

    const allContent = [
      ...frontEndContent,
      ...backEndContent,
      ...aiContent,
      ...cybersecurityContent,
    ];

    for (const content of allContent) {
      await CourseContentModel.findOneAndUpdate(
        { courseSlug: content.courseSlug, lectureTitle: content.lectureTitle },
        content,
        { upsert: true, new: true }
      );
    }

    console.log("Successfully imported all lecture content");
  } catch (error) {
    console.error("Error importing content:", error);
  } finally {
    await mongoose.connection.close();
  }
}

importContent();
