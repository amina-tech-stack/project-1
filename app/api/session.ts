/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /pages/api/session.js
import jwt from "jsonwebtoken";
import connectToDatabase from "../../lib/mongodb";
import User from "../../models/User";

// Define the expected JWT payload structure
interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: string;
}

export default async function handler(
  req: { headers: { authorization: string } },
  res: {
    status: (code: number) => {
      json: (data: { message?: string; user?: any }) => void;
    };
  }
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token and assert the type of decoded
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JwtPayloadWithUserId;

    // Ensure userId exists in the decoded payload
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
}
