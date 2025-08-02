import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("Mot de passe stocké :", user.password);
    console.log("Mot de passe fourni :", password);
    console.log("Mot de passe fourni (trimmed) :", password.trim());
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Résultat de bcrypt.compare :", isMatch);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(
      {
        message: "Connexion réussie",
        user: userWithoutPassword,
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la connexion",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
