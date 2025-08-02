import Navbar from "@/app/components/navbar";
import SignUpForm from "../../components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <SignUpForm />
      </div>
    </div>
  );
}
