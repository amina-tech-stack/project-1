// app/api/explain-lecture/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ExplainRequestBody {
  lectureTitle: string;
}

interface ExplainResponse {
  explanation?: string;
  error?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { lectureTitle } = (await req.json()) as ExplainRequestBody;

  if (!lectureTitle) {
    return NextResponse.json(
      { error: "Lecture title is required" },
      { status: 400 }
    );
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Explain ${lectureTitle} in simple terms, as if to a beginner.`;
    const result = await model.generateContent(prompt);
    const explanation = result.response.text().trim();

    return NextResponse.json({ explanation }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating explanation:", {
      message: error.message,
      status: error.status,
      response: error.response?.data,
    });
    const errorMessage =
      error.status === 429
        ? "Gemini API quota exceeded. Please try again later or check your plan."
        : error.message || "Failed to generate explanation";
    return NextResponse.json(
      { error: errorMessage },
      { status: error.status || 500 }
    );
  }
}
