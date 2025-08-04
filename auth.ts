import NextAuth, { User } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./lib/mongodb";
import UserModel from "./models/User"; // Adjust the import based on your file structure
import bcrypt from "bcrypt";

// Function to generate a random password
const generateRandomPassword = (length: number = 12): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

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
    async signIn({ user, account, profile }) {
      await connectToDatabase();

      // Check if the user exists in the database
      let dbUser = await UserModel.findOne({ email: user.email });

      if (!dbUser) {
        // Generate a random password for OAuth users
        const randomPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Create a new user in the database
        dbUser = await UserModel.create({
          name: user.name || profile?.name || "Unknown",
          email: user.email,
          password: hashedPassword,
          provider: account?.provider, // Optionally store the provider
        });
      } else {
        // Optionally update existing user information
        await UserModel.updateOne(
          { email: user.email },
          {
            $set: {
              name: user.name || dbUser.name || "Unknown",
              provider: account?.provider || dbUser.provider,
            },
          }
        );
      }

      // Attach the database user ID to the user object
      user.id = dbUser._id.toString();
      return true; // Allow sign-in to proceed
    },
    async session({ session, user, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
});
