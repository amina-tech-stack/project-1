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
  const coursesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!canvasRef.current) return;

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

    const starCount = 600;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2500;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2500;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2500;
      colors[i * 3] = 0.2 + Math.random() * 0.8;
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

  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const courses = [
    {
      title: "Front-End Development",
      description:
        "Build responsive web interfaces with HTML, CSS, JavaScript, and React.",
    },
    {
      title: "Back-End Development",
      description: "Develop scalable APIs with Node.js, Express, and MongoDB.",
    },
    {
      title: "Artificial Intelligence",
      description:
        "Create intelligent systems using machine learning and TensorFlow.",
    },
    {
      title: "Cybersecurity",
      description: "Learn ethical hacking and secure systems against threats.",
    },
    {
      title: "Cloud Computing",
      description: "Deploy scalable apps on AWS, Azure, or Google Cloud.",
    },
    {
      title: "Data Science",
      description: "Analyze data with Python, Pandas, and machine learning.",
    },
    {
      title: "Mobile App Development",
      description: "Create mobile apps with React Native and Flutter.",
    },
    {
      title: "DevOps Engineering",
      description: "Automate software delivery with Docker and Kubernetes.",
    },
    {
      title: "Blockchain Technology",
      description: "Build smart contracts with Ethereum and Solidity.",
    },
    {
      title: "UI/UX Design",
      description: "Design user-friendly interfaces with Figma and Adobe XD.",
    },
    {
      title: "Game Development",
      description: "Create games with Unity and Unreal Engine.",
    },
    {
      title: "Internet of Things",
      description: "Develop IoT solutions with Arduino and Raspberry Pi.",
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
    return null;
  }

  return (
    <div className="bg-gray-900 text-white">
      <nav className="bg-gray-800/95 backdrop-blur-lg border-b-2 border-green-500/40 sticky top-0 z-50 shadow-lg shadow-green-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-extrabold text-green-400 font-mono tracking-widest">
              NexThec
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

      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-green-400 font-mono mb-8 animate-[pulse_2s_ease-in-out_infinite] leading-tight drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">
            Conquer the Digital Frontier
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto mb-10 font-mono leading-relaxed tracking-wide">
            Embark on a transformative journey with our elite courses in
            technology and innovation. Acquire cutting-edge skills to build,
            innovate, and secure the future.
          </p>
          <button
            onClick={scrollToCourses}
            className="py-4 px-10 bg-gradient-to-r from-green-500 to-cyan-500 text-white rounded-xl hover:from-green-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-500 font-mono text-lg shadow-lg shadow-green-500/30"
          >
            Launch Your Journey
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/20 opacity-50 z-0"></div>
      </section>

      <section ref={coursesRef} id="courses" className="py-32 bg-gray-900">
        <h2 className="text-6xl font-extrabold text-center text-green-400 mb-20 font-mono tracking-widest drop-shadow-[0_0_15px_rgba(0,255,136,0.4)] animate-[fadeIn_1s_ease-in]">
          Explore Our Elite Courses
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-auto max-w-7xl px-6">
          {courses.map((course, index) => (
            <Link
              key={index}
              href={`/courses/${course.title.toLowerCase().replace(/ /g, "-")}`}
              className="relative bg-gray-800/90 rounded-xl p-6 flex flex-col items-center text-center border-2 border-green-500/60 shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden cursor-pointer min-h-[250px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-cyan-500/20 opacity-40 hover:opacity-60 transition-opacity duration-500"></div>
              <h3 className="relative z-10 text-lg font-bold text-white mb-3 font-mono tracking-tight drop-shadow-[0_0_5px_rgba(0,255,136,0.5)]">
                {course.title}
              </h3>
              <p className="relative z-10 text-gray-200 mb-4 font-mono text-l leading-relaxed">
                {course.description}
              </p>
              <div className="relative z-10 flex flex-col space-y-3 w-full mt-auto">
                <button
                  className="py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 font-mono text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  Take a Quiz
                </button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="bg-gray-800/95 py-12 border-t-2 border-green-500/40 shadow-lg shadow-green-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-200 font-mono mb-6 leading-relaxed">
            Join a global community of tech pioneers. Our meticulously designed
            courses offer hands-on projects, expert mentorship, and the latest
            industry insights to propel you to the forefront of technology.
          </p>
          <p className="text-sm text-gray-400 font-mono">
            &copy; 2025 NexThec. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
