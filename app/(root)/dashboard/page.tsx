/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import * as THREE from "three";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const courses = [
    {
      title: "Front-End Development",
      description:
        "Craft immersive, responsive web interfaces with HTML, CSS, JavaScript, and React. Build dynamic applications that deliver seamless user experiences across all platforms.",
      icon: "🌐",
    },
    {
      title: "Back-End Development",
      description:
        "Master server-side development with Node.js, Express, and databases like MongoDB. Create scalable APIs and manage data to power next-generation applications.",
      icon: "🗄️",
    },
    {
      title: "Artificial Intelligence",
      description:
        "Unlock the power of AI with machine learning, neural networks, and TensorFlow. Develop intelligent systems that adapt and solve complex real-world problems.",
      icon: "🤖",
    },
    {
      title: "Cybersecurity",
      description:
        "Defend the digital frontier with skills in ethical hacking, penetration testing, and security protocols. Secure systems and data against evolving threats.",
      icon: "🔒",
    },
  ];

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
            Conquer the Digital Frontier
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto mb-10 font-mono leading-relaxed tracking-wide">
            Embark on a transformative journey with our elite courses in
            Front-End, Back-End, AI, and Cybersecurity. Acquire cutting-edge
            skills to build, innovate, and secure the future of technology.
          </p>
          <button className="py-4 px-10 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-500 font-mono text-lg shadow-lg shadow-green-500/30">
            Launch Your Journey
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/20 opacity-50 z-0"></div>
      </section>

      {/* Courses Section */}
      <section className="py-24 bg-gray-900" id="courses">
        <h2 className="text-5xl font-extrabold text-center text-green-400 mb-16 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
          Our Elite Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mx-auto max-w-7xl px-4">
          {courses.map((course, index) => (
            <Link
              key={index}
              href={`/courses/${course.title.toLowerCase().replace(/ /g, "-")}`}
              className="relative bg-gray-800/90 rounded-2xl p-8 flex flex-col items-center text-center border-2 border-green-500/60 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-500 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-40 hover:opacity-60 transition-opacity duration-500"></div>
              <div className="relative z-10 text-6xl mb-6 text-green-400 animate-[bounce_3s_ease-in-out_infinite]">
                {course.icon}
              </div>
              <h3 className="relative z-10 text-2xl font-bold text-white mb-4 font-mono tracking-tight drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]">
                {course.title}
              </h3>
              <p className="relative z-10 text-gray-200 mb-6 font-mono text-base leading-relaxed">
                {course.description}
              </p>
              <div className="relative z-10 flex flex-col space-y-4 w-full">
                <button
                  className="py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 font-mono text-sm"
                  onClick={(e) => e.stopPropagation()} // Prevent card click from triggering quiz button
                >
                  Take a Quiz
                </button>
              </div>
            </Link>
          ))}
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
