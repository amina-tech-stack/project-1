/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export default function CourseContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string | undefined;
  const lectureTitleRaw = params.lectureTitle as string | undefined;
  const lectureTitle = lectureTitleRaw
    ? decodeURIComponent(lectureTitleRaw)
    : null;
  const [lectureContent, setLectureContent] = useState<{
    content: string;
    quiz: QuizQuestion[];
    isLoading: boolean;
    error: string | null;
  }>({ content: "", quiz: [], isLoading: true, error: null });

  // Debug parameters
  useEffect(() => {
    console.log("Params:", { slug, lectureTitleRaw, lectureTitle });
  }, [slug, lectureTitleRaw, lectureTitle]);

  // Fetch lecture content and quiz on mount
  useEffect(() => {
    if (status === "authenticated" && slug && lectureTitle) {
      fetch(
        `/api/course-content?courseSlug=${encodeURIComponent(
          slug
        )}&lectureTitle=${encodeURIComponent(lectureTitle)}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              res.status === 404
                ? "Lecture not found"
                : "Failed to fetch content"
            );
          }
          return res.json();
        })
        .then((data) =>
          setLectureContent({
            content: data.content,
            quiz: data.quiz || [],
            isLoading: false,
            error: null,
          })
        )
        .catch((err) => {
          console.error("Error fetching lecture content:", err);
          setLectureContent({
            content: "",
            quiz: [],
            isLoading: false,
            error: err.message,
          });
        });
    } else if (status === "authenticated") {
      setLectureContent({
        content: "",
        quiz: [],
        isLoading: false,
        error: `Invalid parameters: slug=${slug}, lectureTitle=${lectureTitle}`,
      });
    }
  }, [status, slug, lectureTitle]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/login");
    } catch (err) {
      console.error("Erreur lors de la déconnexion", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-3xl text-green-400 animate-pulse font-mono tracking-wide">
          Chargement...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Redirect will handle unauthenticated state
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800/95 backdrop-blur-lg border-b-2 border-green-500/40 sticky top-0 z-50 shadow-lg shadow-green-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-extrabold text-green-400 font-mono tracking-widest">
              CyberLearn
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-lg text-gray-200 font-mono tracking-wide">
              Bonjour, {session.user.name}
            </span>
            <button
              onClick={handleLogout}
              className="py-2.5 px-6 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-xl hover:from-red-800 hover:to-red-950 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 font-mono text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Lecture Content Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-green-400 mb-8 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            {lectureTitle || "Lecture Not Found"}
          </h2>
          <div className="relative bg-gray-800/90 rounded-2xl p-6 border-2 border-green-500/60 shadow-2xl shadow-green-500/30 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-40"></div>
            <div className="relative z-10">
              {lectureContent.isLoading ? (
                <p className="text-green-400 animate-pulse font-mono text-lg">
                  Loading content...
                </p>
              ) : lectureContent.error ? (
                <p className="text-red-400 font-mono text-lg">
                  {lectureContent.error}
                </p>
              ) : (
                <p className="text-gray-200 font-mono text-base leading-relaxed">
                  {lectureContent.content}
                </p>
              )}
            </div>
          </div>

          {/* Quiz Section */}
          {lectureContent.quiz.length > 0 && !lectureContent.error && (
            <div className="relative bg-gray-800/90 rounded-2xl p-6 border-2 border-green-500/60 shadow-2xl shadow-green-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-40"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-green-400 mb-6 font-mono tracking-widest">
                  Quiz
                </h3>
                {lectureContent.quiz.map((quizItem, index) => (
                  <div key={index} className="mb-6">
                    <p className="text-gray-200 font-mono text-base mb-2">
                      {index + 1}. {quizItem.question}
                    </p>
                    <ul className="space-y-2">
                      {quizItem.options.map((option, optIndex) => (
                        <li
                          key={optIndex}
                          className="text-gray-200 font-mono text-sm"
                        >
                          <input
                            type="radio"
                            name={`quiz-${index}`}
                            id={`quiz-${index}-option-${optIndex}`}
                            className="mr-2"
                            disabled
                          />
                          <label htmlFor={`quiz-${index}-option-${optIndex}`}>
                            {option}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <p className="text-gray-400 font-mono text-sm mt-2">
                      Correct Answer: {quizItem.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/courses/${slug || ""}`}
            className="mt-6 inline-block py-3 px-8 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-500 font-mono text-base"
          >
            Back to Course
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800/95 py-12 border-t-2 border-green-500/40 shadow-lg shadow-green-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-200 font-mono mb-6 leading-relaxed">
            Join a global community of tech pioneers. Our meticulously designed
            courses in Front-End, Back-End, AI, and Cybersecurity offer hands-on
            projects, expert mentorship, and the latest industry insights to
            propel you to the forefront of technology.
          </p>
          <p className="text-sm text-gray-400 font-mono">
            &copy; 2025 CyberLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
