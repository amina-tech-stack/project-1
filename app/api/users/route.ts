import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    const user = new User(data);
    await user.save();
    return NextResponse.json(
      { message: "Utilisateur ajouté", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l’ajout de l’utilisateur :", error); // Ajout du log
    return NextResponse.json(
      {
        error: "Erreur lors de l’ajout",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
