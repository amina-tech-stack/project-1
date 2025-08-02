import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

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
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? ""; // Add user ID to session, fallback to empty string if undefined
      }
      return session;
    },
  },
});
interface RefreshTokenResponse {
  accessToken?: string;
  error?: string;
}

export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/refresh-token/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: localStorage.getItem("refresh_token"),
      }),
    });
    const data: RefreshTokenResponse = await response.json();
    if (data.accessToken) {
      localStorage.setItem("auth_token", data.accessToken);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}
