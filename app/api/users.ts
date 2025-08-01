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
      const user = new User(req.body);
      await user.save();
      res.status(200).json({ message: "Utilisateur ajouté", user });
    } catch (error) {
      console.error("Erreur lors de l’ajout de l’utilisateur :", error); // Ajout du log
      res.status(500).json({
        error: "Erreur lors de l’ajout",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}
