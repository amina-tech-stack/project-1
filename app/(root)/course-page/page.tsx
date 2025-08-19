/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import * as THREE from "three";
import Link from "next/link";

export default function CoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slug = params.slug as string;
  const [progress, setProgress] = useState<{
    completedLectures: string[];
    completionPercentage: number;
  }>({
    completedLectures: [],
    completionPercentage: 0,
  });
  const [expandedSections, setExpandedSections] = useState<{
    [key: number]: boolean;
  }>({});
  const [lectureDetails, setLectureDetails] = useState<{
    [key: string]: { content: string; isVisible: boolean; isLoading: boolean };
  }>({});

  // Fetch progress on mount
  useEffect(() => {
    if (status === "authenticated" && slug) {
      fetch(`/api/progress?courseSlug=${slug}`)
        .then((res) => res.json())
        .then((data) => setProgress(data))
        .catch((err) => console.error("Error fetching progress:", err));
    }
  }, [status, slug]);

  // Handle lecture completion
  const handleCompleteLecture = async (
    lectureTitle: string,
    totalLectures: number
  ) => {
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: slug, lectureTitle, totalLectures }),
      });
      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
      } else {
        console.error("Error saving progress:", await response.json());
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  // Toggle lecture details
  const toggleLectureDetails = async (key: string, lectureTitle: string) => {
    if (!lectureDetails[key]) {
      setLectureDetails((prev) => ({
        ...prev,
        [key]: { content: "", isVisible: false, isLoading: false },
      }));
    }

    const current = lectureDetails[key];
    if (current.isVisible) {
      setLectureDetails((prev) => ({
        ...prev,
        [key]: { ...current, isVisible: false },
      }));
    } else {
      setLectureDetails((prev) => ({
        ...prev,
        [key]: { ...current, isLoading: true },
      }));
      try {
        const response = await fetch(
          `/api/course-content?courseSlug=${slug}&lectureTitle=${encodeURIComponent(
            lectureTitle
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch content");
        }
        const data = await response.json();
        setLectureDetails((prev) => ({
          ...prev,
          [key]: { content: data.content, isVisible: true, isLoading: false },
        }));
      } catch (error) {
        console.error("Error fetching lecture content:", error);
        setLectureDetails((prev) => ({
          ...prev,
          [key]: {
            content: "Failed to load content. Please try again.",
            isVisible: true,
            isLoading: false,
          },
        }));
      }
    }
  };

  // Course data (unchanged from your original)
  const courses = [
    {
      slug: "front-end-development",
      title: "Front-End Development",
      icon: "🌐",
      description:
        "Craft immersive, responsive web interfaces with HTML, CSS, JavaScript, and React. Build dynamic applications that deliver seamless user experiences across all platforms.",
      overview:
        "This comprehensive Front-End Development course takes you from beginner to pro, teaching you how to create stunning, responsive web applications using modern tools and frameworks. You'll master HTML, CSS, JavaScript, and React, and build real-world projects to solidify your skills.",
      learningObjectives: [
        "Build responsive and accessible websites with HTML and CSS.",
        "Master JavaScript for dynamic, interactive web applications.",
        "Develop single-page applications using React.",
        "Optimize web performance and ensure cross-browser compatibility.",
        "Create portfolio-ready projects to showcase your skills.",
      ],
      curriculum: [
        {
          section: "Introduction to Front-End Development",
          lectures: [
            { title: "What is Front-End Development?", duration: "15 min" },
            {
              title: "Setting Up Your Development Environment",
              duration: "20 min",
            },
            {
              title: "Understanding the Web Development Workflow",
              duration: "15 min",
            },
          ],
          duration: "1 hour",
        },
        {
          section: "HTML & CSS Fundamentals",
          lectures: [
            {
              title: "HTML Basics: Structure and Semantics",
              duration: "30 min",
            },
            { title: "CSS Styling: Layouts and Flexbox", duration: "45 min" },
            {
              title: "Responsive Design with Media Queries",
              duration: "40 min",
            },
            {
              title: "Project: Build a Responsive Landing Page",
              duration: "1 hour",
            },
          ],
          duration: "2 weeks",
        },
        {
          section: "JavaScript Essentials",
          lectures: [
            {
              title: "JavaScript Basics: Variables and Functions",
              duration: "40 min",
            },
            { title: "DOM Manipulation and Events", duration: "50 min" },
            {
              title: "Asynchronous JavaScript: Promises and Async/Await",
              duration: "45 min",
            },
            { title: "Project: Interactive To-Do List", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "React for Dynamic UIs",
          lectures: [
            { title: "Introduction to React and JSX", duration: "40 min" },
            { title: "Components, Props, and State", duration: "50 min" },
            { title: "React Hooks and Routing", duration: "1 hour" },
            { title: "Project: Build a React Dashboard", duration: "2 hours" },
          ],
          duration: "4 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Web Application", duration: "30 min" },
            {
              title: "Building and Deploying Your Project",
              duration: "3 hours",
            },
            { title: "Project Review and Optimization", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic computer literacy",
        "A modern web browser (e.g., Chrome, Firefox)",
        "Code editor (e.g., VS Code)",
        "No prior coding experience required",
      ],
      instructor: {
        name: "Dr. Jane Doe",
        bio: "A seasoned front-end developer with over 10 years of experience building responsive web applications for top tech companies. Jane is passionate about teaching and has helped thousands of students master web development.",
      },
    },
    {
      slug: "back-end-development",
      title: "Back-End Development",
      icon: "🗄️",
      description:
        "Master server-side development with Node.js, Express, and databases like MongoDB. Create scalable APIs and manage data to power next-generation applications.",
      overview:
        "Dive into the world of back-end development with this in-depth course. Learn to build robust server-side applications using Node.js, Express, and MongoDB. From RESTful APIs to authentication systems, you'll gain the skills to power modern web applications.",
      learningObjectives: [
        "Develop scalable server-side applications with Node.js and Express.",
        "Design and implement RESTful APIs.",
        "Manage data with MongoDB and Mongoose.",
        "Implement secure authentication and authorization.",
        "Deploy back-end applications to the cloud.",
      ],
      curriculum: [
        {
          section: "Introduction to Back-End Development",
          lectures: [
            { title: "What is Back-End Development?", duration: "15 min" },
            { title: "Setting Up Node.js and Express", duration: "25 min" },
            { title: "Understanding Servers and APIs", duration: "20 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Node.js & Express Basics",
          lectures: [
            { title: "Node.js Fundamentals", duration: "40 min" },
            { title: "Building APIs with Express", duration: "50 min" },
            { title: "Middleware and Routing", duration: "45 min" },
            { title: "Project: Simple API Server", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "MongoDB & Database Management",
          lectures: [
            { title: "Introduction to MongoDB", duration: "40 min" },
            { title: "CRUD Operations with Mongoose", duration: "50 min" },
            { title: "Database Design and Relationships", duration: "45 min" },
            { title: "Project: Blog API with MongoDB", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Authentication & Authorization",
          lectures: [
            { title: "JWT and User Authentication", duration: "50 min" },
            { title: "Role-Based Authorization", duration: "45 min" },
            { title: "Securing APIs", duration: "40 min" },
            { title: "Project: Secure User System", duration: "1.5 hours" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Back-End Application", duration: "30 min" },
            { title: "Building and Deploying Your API", duration: "3 hours" },
            { title: "Project Review and Scaling", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic understanding of JavaScript",
        "Node.js installed on your computer",
        "MongoDB Atlas account (free tier available)",
        "A code editor (e.g., VS Code)",
      ],
      instructor: {
        name: "John Smith",
        bio: "A back-end developer with 12 years of experience in building scalable APIs for startups and enterprises. John specializes in Node.js and MongoDB and loves mentoring aspiring developers.",
      },
    },
    {
      slug: "artificial-intelligence",
      title: "Artificial Intelligence",
      icon: "🤖",
      description:
        "Unlock the power of AI with machine learning, neural networks, and TensorFlow. Develop intelligent systems that adapt and solve complex real-world problems.",
      overview:
        "This course introduces you to the exciting field of artificial intelligence. Learn machine learning, neural networks, and TensorFlow to build intelligent systems that can analyze data, make predictions, and solve real-world problems.",
      learningObjectives: [
        "Understand core machine learning concepts and algorithms.",
        "Build and train neural networks with TensorFlow.",
        "Apply AI to real-world problems like image recognition.",
        "Explore ethical considerations in AI development.",
        "Create an AI-driven project for your portfolio.",
      ],
      curriculum: [
        {
          section: "Introduction to Artificial Intelligence",
          lectures: [
            { title: "What is AI and Machine Learning?", duration: "20 min" },
            { title: "Setting Up Python and TensorFlow", duration: "25 min" },
            { title: "AI Applications in the Real World", duration: "15 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Machine Learning Fundamentals",
          lectures: [
            {
              title: "Supervised vs. Unsupervised Learning",
              duration: "40 min",
            },
            { title: "Regression and Classification", duration: "50 min" },
            {
              title: "Data Preprocessing and Feature Engineering",
              duration: "45 min",
            },
            { title: "Project: Predict House Prices", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Neural Networks & Deep Learning",
          lectures: [
            { title: "Introduction to Neural Networks", duration: "50 min" },
            { title: "Building Models with TensorFlow", duration: "1 hour" },
            {
              title: "Convolutional Neural Networks (CNNs)",
              duration: "50 min",
            },
            { title: "Project: Image Classification", duration: "2 hours" },
          ],
          duration: "4 weeks",
        },
        {
          section: "AI Ethics & Deployment",
          lectures: [
            { title: "Bias and Fairness in AI", duration: "40 min" },
            { title: "Deploying AI Models", duration: "50 min" },
            {
              title: "Monitoring and Maintaining AI Systems",
              duration: "40 min",
            },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your AI Application", duration: "30 min" },
            { title: "Building and Testing Your Model", duration: "3 hours" },
            { title: "Project Review and Presentation", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic Python programming knowledge",
        "Familiarity with linear algebra and statistics (recommended)",
        "Python and TensorFlow installed",
        "A computer with a GPU (optional for faster training)",
      ],
      instructor: {
        name: "Dr. Emily Chen",
        bio: "An AI researcher with a PhD in Machine Learning and 8 years of experience developing AI solutions for industries like healthcare and finance. Emily is dedicated to making AI accessible to all.",
      },
    },
    {
      slug: "cybersecurity",
      title: "Cybersecurity",
      icon: "🔒",
      description:
        "Defend the digital frontier with skills in ethical hacking, penetration testing, and security protocols. Secure systems and data against evolving threats.",
      overview:
        "Become a cybersecurity expert with this hands-on course. Learn ethical hacking, penetration testing, and security protocols to protect systems from cyber threats. Build practical skills through real-world scenarios and projects.",
      learningObjectives: [
        "Understand cybersecurity threats and vulnerabilities.",
        "Perform ethical hacking and penetration testing.",
        "Implement security protocols and encryption techniques.",
        "Secure web applications and networks.",
        "Develop a cybersecurity portfolio with practical projects.",
      ],
      curriculum: [
        {
          section: "Introduction to Cybersecurity",
          lectures: [
            { title: "What is Cybersecurity?", duration: "15 min" },
            { title: "Common Threats and Vulnerabilities", duration: "20 min" },
            { title: "Setting Up a Secure Environment", duration: "25 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Ethical Hacking Techniques",
          lectures: [
            { title: "Introduction to Ethical Hacking", duration: "40 min" },
            { title: "Reconnaissance and Footprinting", duration: "50 min" },
            { title: "Scanning and Enumeration", duration: "45 min" },
            {
              title: "Project: Conduct a Security Audit",
              duration: "1.5 hours",
            },
          ],
          duration: "3 weeks",
        },
        {
          section: "Penetration Testing",
          lectures: [
            { title: "Penetration Testing Methodologies", duration: "50 min" },
            { title: "Exploiting Vulnerabilities", duration: "1 hour" },
            { title: "Reporting and Mitigation", duration: "45 min" },
            {
              title: "Project: Penetration Test Simulation",
              duration: "2 hours",
            },
          ],
          duration: "3 weeks",
        },
        {
          section: "Security Protocols & Encryption",
          lectures: [
            {
              title: "Understanding Encryption and Cryptography",
              duration: "40 min",
            },
            { title: "Implementing Secure Protocols", duration: "50 min" },
            { title: "Securing Web Applications", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning a Secure System", duration: "30 min" },
            { title: "Implementing Security Measures", duration: "3 hours" },
            { title: "Project Review and Security Audit", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic understanding of networking concepts",
        "A computer with Kali Linux or similar tools installed",
        "No prior cybersecurity experience required",
      ],
      instructor: {
        name: "Michael Lee",
        bio: "A cybersecurity expert with 15 years of experience in ethical hacking and penetration testing. Michael has worked with global organizations to secure their systems and loves teaching practical security skills.",
      },
    },
  ];

  const course = courses.find((c) => c.slug === slug);
  const totalLectures = course
    ? course.curriculum.reduce(
        (sum, section) => sum + section.lectures.length,
        0
      )
    : 0;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create stars
    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2500;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2500;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2500;
      colors[i * 3] = 0.2 + Math.random() * 0.8; // Blue-green tint
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      colors[i * 3 + 2] = 1.0;
      sizes[i] = Math.random() * 6 + 3;
    }

    starGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create connections
    const lines: THREE.Line[] = [];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ffcc,
      transparent: true,
      opacity: 0.4,
    });

    for (let i = 0; i < starCount; i++) {
      for (let j = i + 1; j < starCount; j++) {
        const dist = Math.sqrt(
          Math.pow(positions[i * 3] - positions[j * 3], 2) +
            Math.pow(positions[i * 3 + 1] - positions[j * 3 + 1], 2) +
            Math.pow(positions[i * 3 + 2] - positions[j * 3 + 2], 2)
        );
        if (dist < 200) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              positions[i * 3],
              positions[i * 3 + 1],
              positions[i * 3 + 2]
            ),
            new THREE.Vector3(
              positions[j * 3],
              positions[j * 3 + 1],
              positions[j * 3 + 2]
            ),
          ]);
          const line = new THREE.Line(lineGeo, lineMaterial);
          lines.push(line);
          scene.add(line);
        }
      }
    }

    camera.position.z = 600;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0008;
      stars.rotation.x += 0.0003;
      lines.forEach((line) => {
        line.material.opacity = 0.3 + Math.sin(Date.now() * 0.0025) * 0.15;
      });
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-3xl text-red-400 font-mono tracking-wide">
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white">
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

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-green-400 font-mono mb-8 animate-[pulse_2s_ease-in-out_infinite] leading-tight drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">
            {course.title}
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto mb-10 font-mono leading-relaxed tracking-wide">
            {course.description}
          </p>
          <div className="mb-6">
            <div className="w-full bg-gray-800 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-green-500 to-cyan-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-gray-200 font-mono text-sm mt-2">
              Progress: {Math.round(progress.completionPercentage)}% Complete
            </p>
          </div>
          <Link
            href="/dashboard"
            className="py-4 px-10 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-500 font-mono text-lg shadow-lg shadow-green-500/30"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/20 opacity-50 z-0"></div>
      </section>

      {/* Course Overview Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-green-400 mb-8 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            Course Overview
          </h2>
          <p className="text-lg text-gray-200 font-mono leading-relaxed">
            {course.overview}
          </p>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-green-400 mb-8 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            What You'll Learn
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.learningObjectives.map((objective, index) => (
              <li
                key={index}
                className="flex items-start text-gray-200 font-mono text-base"
              >
                <span className="text-green-400 mr-2">✔</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Course Content Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-green-400 mb-8 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            Course Content
          </h2>
          <div className="space-y-6">
            {course.curriculum.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="relative bg-gray-800/90 rounded-2xl p-6 border-2 border-green-500/60 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-40 hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <button
                    className="w-full text-left text-2xl font-bold text-white mb-4 font-mono tracking-tight flex justify-between items-center"
                    onClick={() => toggleSection(sectionIndex)}
                  >
                    <span>{section.section}</span>
                    <span>{expandedSections[sectionIndex] ? "−" : "+"}</span>
                  </button>
                  <p className="text-gray-200 font-mono text-base mb-4">
                    Duration: {section.duration}
                  </p>
                  {expandedSections[sectionIndex] && (
                    <ul className="space-y-4">
                      {section.lectures.map((lecture, lectureIndex) => {
                        const detailKey = `${sectionIndex}-${lectureIndex}`;
                        const details = lectureDetails[detailKey] || {};
                        return (
                          <li
                            key={lectureIndex}
                            className="flex justify-between items-center text-gray-200 font-mono text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={progress.completedLectures.includes(
                                  lecture.title
                                )}
                                onChange={() =>
                                  handleCompleteLecture(
                                    lecture.title,
                                    totalLectures
                                  )
                                }
                                className="mr-2 h-4 w-4 text-green-500 focus:ring-green-400 border-gray-600 rounded"
                                disabled={progress.completedLectures.includes(
                                  lecture.title
                                )}
                              />
                              <button
                                onClick={() =>
                                  toggleLectureDetails(detailKey, lecture.title)
                                }
                                className="py-1 px-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white rounded-md hover:from-green-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 font-mono text-xs"
                              >
                                {details.isVisible
                                  ? "Hide Details"
                                  : "View Details"}
                              </button>
                              <span>{lecture.title}</span>
                            </div>
                            <span className="ml-4">{lecture.duration}</span>
                            {details.isVisible && (
                              <div className="mt-2 p-4 bg-gray-700/80 rounded-lg border border-green-500/40 w-full">
                                {details.isLoading ? (
                                  <p className="text-green-400 animate-pulse">
                                    Loading content...
                                  </p>
                                ) : (
                                  <p className="text-gray-200 text-sm leading-relaxed">
                                    {details.content}
                                  </p>
                                )}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-green-400 mb-8 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            Requirements
          </h2>
          <ul className="space-y-2">
            {course.requirements.map((requirement, index) => (
              <li
                key={index}
                className="flex items-start text-gray-200 font-mono text-base"
              >
                <span className="text-green-400 mr-2">•</span>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-green-400 mb-8 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
            Meet Your Instructor
          </h2>
          <div className="relative bg-gray-800/90 rounded-2xl p-6 border-2 border-green-500/60 shadow-2xl shadow-green-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-40"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-tight">
                {course.instructor.name}
              </h3>
              <p className="text-gray-200 font-mono text-base">
                {course.instructor.bio}
              </p>
            </div>
          </div>
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
