import { SessionProvider } from "next-auth/react";
import Navbar from "../components/navbar";
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans ">
      <SessionProvider>{children}</SessionProvider>
    </main>
  );
}
