import NextAuth, { User } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./lib/mongodb";
import UserModel from "./models/User"; // Adjust the import based on your file structure
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>,
        request: Request
      ): Promise<User | null> {
        // Type assertion to ensure credentials has email and password as strings
        const { email, password } = credentials as {
          email?: string;
          password?: string;
        };

        if (!email || !password) {
          throw new Error("Email et mot de passe sont requis");
        }

        await connectToDatabase();
        const user = await UserModel.findOne({ email });
        if (!user) {
          throw new Error("Utilisateur non trouvé");
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
          throw new Error("Mot de passe incorrect");
        }

        // Return a User object compatible with NextAuth.js
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
});
