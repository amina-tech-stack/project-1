import { NextResponse } from "next/server";
import database from "../../../database.json"; // Adjust path based on your project structure

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get("courseSlug");
  const lectureTitle = searchParams.get("lectureTitle");

  if (!courseSlug || !lectureTitle) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const lecture = database.find(
    (item) =>
      item.courseSlug === courseSlug && item.lectureTitle === lectureTitle
  );

  if (!lecture) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  return NextResponse.json({
    content: lecture.content,
    quiz: lecture.quiz || [],
  });
}
