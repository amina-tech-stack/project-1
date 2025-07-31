import Link from "next/link";
import Image from "next/image";
import { auth, signOut, signIn } from "@/auth";
import { BadgePlus, LogOut, Github } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = async () => {
  const session = await auth();

  return (
    <header className="px-4 py-2 bg-gray-900 text-white shadow-lg font-work-sans sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center h-12">
        <div className="flex items-center gap-1/4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="NexTech Innovations logo"
              width={80}
              height={26}
              className="hover:opacity-80 transition-opacity duration-200 object-contain"
            />
          </Link>
          <Link href="/" className="text-lg font-semibold">
            <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">
              NexTech Innovations
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {session && session?.user ? (
            <>
              <Link
                href="/startup/create"
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-200"
              >
                <span className="max-sm:hidden">Create</span>
                <BadgePlus className="size-5 sm:hidden" />
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-200 hover:text-red-400 hover:bg-gray-800 rounded-md transition-colors duration-200"
                >
                  <span className="max-sm:hidden">Logout</span>
                  <LogOut className="size-5 sm:hidden text-red-400" />
                </button>
              </form>

              <Link
                href={`/user/${session?.user?.id}`}
                className="flex items-center"
              >
                <Avatar className="size-9 border-2 border-gray-700 hover:border-blue-500 transition-colors duration-200">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {session?.user?.name?.[0]?.toUpperCase() || "AV"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <>
              <form
                action={async () => {
                  "use server";
                  await signIn("github");
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                >
                  <Github className="size-5" />
                  <span>Login with GitHub</span>
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200"
                >
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M12.48 10.92v2.26h3.26c-.13.87-.57 1.61-1.22 2.13v1.77h1.97c1.15-1.06 1.81-2.62 1.81-4.44 0-1.62-.62-3.06-1.63-4.12H12.48z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 5.47c1.45 0 2.75.5 3.78 1.47l2.83-2.83C16.85 2.36 14.62 1 12 1 8.28 1 5.07 3.28 3.6 6.56l3.15 2.45C7.77 7.26 9.74 5.47 12 5.47z"
                      fill="#EA4335"
                    />
                    <path
                      d="M6.75 14.99C6.6 14.62 6.51 14.23 6.51 13.82c0-.41.09-.81.25-1.18l-3.15-2.45C2.84 11.42 2.36 12.79 2.36 14.21c0 2.62 1.36 4.85 3.39 6.6l3.15-2.45c-.71-.73-1.15-1.74-1.15-2.87 0-.24.02-.47.06-.7z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 23c2.62 0 4.85-1.36 6.6-3.39l-2.83-2.45c-1.03.97-2.33 1.47-3.78 1.47-2.26 0-4.23-1.79-4.94-4.04l-3.15 2.45C5.07 20.72 8.28 23 12 23z"
                      fill="#34A853"
                    />
                  </svg>
                  <span>Login with Google</span>
                </button>
              </form>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
