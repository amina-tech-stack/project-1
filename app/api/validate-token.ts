// pages/api/validate-token.ts
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

interface TokenValidationRequest {
  token: string;
}

interface TokenValidationResponse {
  valid: boolean;
  user?: { id: string; name: string; email: string };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token }: TokenValidationRequest = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { id: string; name: string; email: string };
    return res.status(200).json({
      valid: true,
      user: { id: decoded.id, name: decoded.name, email: decoded.email },
    });
  } catch (err) {
    return res.status(401).json({ valid: false, error: "Invalid token" });
  }
}
