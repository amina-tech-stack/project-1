/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    console.log("Données reçues pour inscription :", data); // Log pour débogage
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }
    const user = new User(data);
    await user.save();
    const { password, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(
      { message: "Utilisateur ajouté", user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l’ajout de l’utilisateur :", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      return NextResponse.json(
        { error: "Cet email existe déjà" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      {
        error: "Erreur lors de l’ajout",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
