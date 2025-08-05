import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb"; // Adjust path as needed
import courseContentModel from "../../../models/CourseContent"; // Adjust path as needed
import { auth } from "@/auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Correct path for App Router

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseSlug = searchParams.get("courseSlug");

    if (!courseSlug) {
      return NextResponse.json(
        { error: "Course slug is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const course = await courseContentModel.findOne({
      userId: session.user.id,
      courseSlug,
    });

    return NextResponse.json(
      course || { completedLectures: [], completionPercentage: 0 }
    );
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseSlug, lectureTitle, totalLectures } = await req.json();

    if (!courseSlug || !lectureTitle || !totalLectures) {
      return NextResponse.json(
        {
          error: "Course slug, lecture title, and total lectures are required",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    let course = await courseContentModel.findOne({
      userId: session.user.id,
      courseSlug,
    });

    if (!course) {
      course = await courseContentModel.create({
        userId: session.user.id,
        courseSlug,
        completedLectures: [lectureTitle],
        completionPercentage: (1 / totalLectures) * 100,
        updatedAt: new Date(),
      });
    } else {
      if (!course.completedLectures.includes(lectureTitle)) {
        course.completedLectures.push(lectureTitle);
        course.completionPercentage =
          (course.completedLectures.length / totalLectures) * 100;
        course.updatedAt = new Date();
        await course.save();
      }
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
