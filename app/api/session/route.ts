import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Aucun token fourni" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      name: string;
    };
    await connectToDatabase();
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la vérification de la session :", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification de la session",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
