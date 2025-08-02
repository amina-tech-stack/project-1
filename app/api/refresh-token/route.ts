// pages/api/refresh-token.ts
import { NextApiRequest, NextApiResponse } from "next";

interface RefreshTokenRequest {
  refreshToken: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { refreshToken }: RefreshTokenRequest = req.body;
  if (refreshToken) {
    // Validate refresh token (e.g., API call to auth server)
    return res.status(200).json({ accessToken: "new_token" });
  }
  return res.status(401).json({ error: "Invalid refresh token" });
}
