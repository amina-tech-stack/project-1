/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../lib/mongodb";
import User from "../../models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();
  if (req.method === "POST") {
    try {
      const data = req.body;
      console.log("Données reçues pour inscription :", data); // Log pour débogage
      if (!data.name || !data.email || !data.password) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
      }
      const user = new User(data);
      await user.save();
      const { password, ...userWithoutPassword } = user.toObject();
      res
        .status(200)
        .json({ message: "Utilisateur ajouté", user: userWithoutPassword });
    } catch (error) {
      console.error("Erreur lors de l’ajout de l’utilisateur :", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as any).code === 11000
      ) {
        return res.status(409).json({ error: "Cet email existe déjà" });
      }
      res.status(500).json({
        error: "Erreur lors de l’ajout",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}
