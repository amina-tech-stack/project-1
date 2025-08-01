import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();
    const user = await User.findOne({ email });
    const isMatched = await bcrypt.compare(password, user?.password);
    return NextResponse.json(
      {
        message: "login successful",
        user: { id: user._id, email: user.email },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "An error occurred while logging in" },
      { status: 500 }
    );
  }
}
