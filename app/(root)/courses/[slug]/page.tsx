/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import * as THREE from "three";
import Link from "next/link";
import Modal from "react-modal";

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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Handle AI explanation
  const handleAIExplain = async (lectureTitle: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/explain-lecture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lectureTitle }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      if (data.explanation) {
        setPopupContent(data.explanation);
        setIsPopupOpen(true);
      } else {
        setError(data.error || "No explanation received");
      }
    } catch (error: any) {
      console.error("Error fetching explanation:", error);
      setError(error.message || "Failed to fetch explanation");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionIndex: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex],
    }));
  };

  // Navigate to course content page
  const navigateToLecture = (lectureTitle: string) => {
    console.log("Navigating to:", { slug, lectureTitle });
    router.push(`/courses/${slug}/${encodeURIComponent(lectureTitle)}`);
  };

  // Course data
  const courses = [
    {
      slug: "front-end-development",
      title: "Front-End Development",
      description:
        "Build responsive web interfaces with HTML, CSS, JavaScript, and React.",
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
      description: "Develop scalable APIs with Node.js, Express, and MongoDB.",
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
      description:
        "Create intelligent systems using machine learning and TensorFlow.",
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
      description: "Learn ethical hacking and secure systems against threats.",
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
    {
      slug: "cloud-computing",
      title: "Cloud Computing",
      description: "Deploy scalable apps on AWS, Azure, or Google Cloud.",
      overview:
        "Master cloud computing with this comprehensive course. Learn to build, deploy, and manage scalable applications using AWS, Azure, and Google Cloud. Gain hands-on experience with real-world cloud projects.",
      learningObjectives: [
        "Understand cloud computing concepts and services.",
        "Deploy applications on AWS, Azure, and Google Cloud.",
        "Manage cloud infrastructure and resources.",
        "Implement cloud security best practices.",
        "Build a cloud-based project for your portfolio.",
      ],
      curriculum: [
        {
          section: "Introduction to Cloud Computing",
          lectures: [
            { title: "What is Cloud Computing?", duration: "15 min" },
            { title: "Overview of Cloud Providers", duration: "20 min" },
            { title: "Setting Up Cloud Accounts", duration: "25 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "AWS Fundamentals",
          lectures: [
            { title: "Introduction to AWS Services", duration: "40 min" },
            { title: "EC2 and S3 Basics", duration: "50 min" },
            { title: "Deploying a Simple Application", duration: "45 min" },
            { title: "Project: AWS Static Website", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Azure & Google Cloud",
          lectures: [
            { title: "Introduction to Azure", duration: "40 min" },
            { title: "Google Cloud Platform Basics", duration: "50 min" },
            { title: "Comparing Cloud Providers", duration: "45 min" },
            { title: "Project: Multi-Cloud Deployment", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Cloud Security & Management",
          lectures: [
            { title: "Securing Cloud Resources", duration: "40 min" },
            { title: "Monitoring and Scaling", duration: "50 min" },
            { title: "Cost Optimization", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Cloud Application", duration: "30 min" },
            { title: "Building and Deploying", duration: "3 hours" },
            { title: "Project Review and Optimization", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic understanding of web development",
        "A computer with internet access",
        "Free-tier accounts for AWS, Azure, or Google Cloud",
      ],
      instructor: {
        name: "Sarah Johnson",
        bio: "A cloud architect with 10 years of experience deploying scalable applications on AWS, Azure, and Google Cloud. Sarah is passionate about teaching cloud technologies to aspiring engineers.",
      },
    },
    {
      slug: "data-science",
      title: "Data Science",
      description: "Analyze data with Python, Pandas, and machine learning.",
      overview:
        "Unlock the power of data science with this hands-on course. Learn to analyze and visualize data using Python, Pandas, and Jupyter, and apply machine learning techniques to derive actionable insights.",
      learningObjectives: [
        "Master data analysis with Python and Pandas.",
        "Create visualizations using Matplotlib and Seaborn.",
        "Apply machine learning algorithms to datasets.",
        "Interpret and communicate data insights.",
        "Build a data science portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to Data Science",
          lectures: [
            { title: "What is Data Science?", duration: "15 min" },
            { title: "Setting Up Python and Jupyter", duration: "20 min" },
            { title: "Data Science Workflow", duration: "15 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Data Analysis with Python",
          lectures: [
            { title: "Introduction to Pandas", duration: "40 min" },
            { title: "Data Cleaning and Preparation", duration: "50 min" },
            { title: "Exploratory Data Analysis", duration: "45 min" },
            { title: "Project: Data Analysis Report", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Data Visualization",
          lectures: [
            { title: "Matplotlib and Seaborn Basics", duration: "40 min" },
            {
              title: "Creating Interactive Visualizations",
              duration: "50 min",
            },
            { title: "Storytelling with Data", duration: "45 min" },
            { title: "Project: Visualization Dashboard", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Machine Learning for Data Science",
          lectures: [
            { title: "Introduction to Scikit-Learn", duration: "40 min" },
            { title: "Supervised Learning Models", duration: "50 min" },
            { title: "Model Evaluation and Tuning", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Data Science Project", duration: "30 min" },
            { title: "Building and Analyzing", duration: "3 hours" },
            { title: "Project Presentation", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic Python programming knowledge",
        "Python and Jupyter installed",
        "Familiarity with basic statistics",
      ],
      instructor: {
        name: "Dr. Laura Patel",
        bio: "A data scientist with 9 years of experience in analytics and machine learning. Laura has worked with global firms to derive insights from data and is passionate about teaching data science.",
      },
    },
    {
      slug: "mobile-app-development",
      title: "Mobile App Development",
      description: "Create mobile apps with React Native and Flutter.",
      overview:
        "Learn to build cross-platform mobile applications with React Native and Flutter. This course covers app development for iOS and Android, focusing on creating intuitive, high-performance mobile experiences.",
      learningObjectives: [
        "Develop cross-platform apps with React Native.",
        "Build mobile UIs with Flutter and Dart.",
        "Integrate APIs and manage app state.",
        "Test and deploy mobile applications.",
        "Create a mobile app portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to Mobile App Development",
          lectures: [
            { title: "What is Mobile App Development?", duration: "15 min" },
            { title: "Setting Up React Native", duration: "20 min" },
            { title: "Setting Up Flutter", duration: "20 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "React Native Basics",
          lectures: [
            { title: "React Native Components", duration: "40 min" },
            { title: "Navigation and State Management", duration: "50 min" },
            { title: "Building a Simple App", duration: "45 min" },
            { title: "Project: Task Manager App", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Flutter Fundamentals",
          lectures: [
            { title: "Introduction to Dart", duration: "40 min" },
            { title: "Flutter Widgets and Layouts", duration: "50 min" },
            { title: "State Management in Flutter", duration: "45 min" },
            { title: "Project: Weather App", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Advanced Mobile Development",
          lectures: [
            { title: "Integrating APIs in Apps", duration: "40 min" },
            { title: "Testing Mobile Apps", duration: "50 min" },
            { title: "Deploying to App Stores", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Mobile App", duration: "30 min" },
            { title: "Building and Testing", duration: "3 hours" },
            { title: "Project Review and Deployment", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic JavaScript knowledge (for React Native)",
        "A computer with React Native and Flutter installed",
        "Android Studio or Xcode (optional for emulation)",
      ],
      instructor: {
        name: "Chris Wong",
        bio: "A mobile app developer with 7 years of experience building apps for iOS and Android. Chris specializes in React Native and Flutter and enjoys mentoring new developers.",
      },
    },
    {
      slug: "devops-engineering",
      title: "DevOps Engineering",
      description: "Automate software delivery with Docker and Kubernetes.",
      overview:
        "Master DevOps practices to streamline software delivery. Learn to automate development pipelines using CI/CD, Docker, and Kubernetes, and build scalable, reliable systems.",
      learningObjectives: [
        "Understand DevOps principles and practices.",
        "Set up CI/CD pipelines for automated deployments.",
        "Containerize applications with Docker.",
        "Orchestrate containers with Kubernetes.",
        "Build a DevOps portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to DevOps",
          lectures: [
            { title: "What is DevOps?", duration: "15 min" },
            { title: "Setting Up Your DevOps Environment", duration: "20 min" },
            { title: "Overview of CI/CD", duration: "15 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "CI/CD Pipelines",
          lectures: [
            { title: "Introduction to CI/CD", duration: "40 min" },
            { title: "Setting Up GitHub Actions", duration: "50 min" },
            { title: "Automating Builds and Tests", duration: "45 min" },
            { title: "Project: CI/CD Pipeline", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Docker Fundamentals",
          lectures: [
            { title: "Introduction to Docker", duration: "40 min" },
            { title: "Building Docker Images", duration: "50 min" },
            {
              title: "Docker Compose for Multi-Container Apps",
              duration: "45 min",
            },
            { title: "Project: Dockerized Application", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Kubernetes Basics",
          lectures: [
            { title: "Introduction to Kubernetes", duration: "40 min" },
            { title: "Deploying Apps with Kubernetes", duration: "50 min" },
            { title: "Scaling and Managing Clusters", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your DevOps Project", duration: "30 min" },
            { title: "Building and Deploying", duration: "3 hours" },
            { title: "Project Review and Optimization", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic understanding of Linux commands",
        "A computer with Docker and Kubernetes installed",
        "Familiarity with Git",
      ],
      instructor: {
        name: "Alex Carter",
        bio: "A DevOps engineer with 10 years of experience automating software delivery for tech companies. Alex is an expert in Docker and Kubernetes and loves teaching modern DevOps practices.",
      },
    },
    {
      slug: "blockchain-technology",
      title: "Blockchain Technology",
      description: "Build smart contracts with Ethereum and Solidity.",
      overview:
        "Explore the world of blockchain technology with this practical course. Learn to build decentralized applications and smart contracts using Ethereum and Solidity, focusing on secure, transparent solutions.",
      learningObjectives: [
        "Understand blockchain concepts and decentralization.",
        "Write smart contracts with Solidity.",
        "Develop decentralized applications (DApps).",
        "Deploy blockchain solutions on Ethereum.",
        "Create a blockchain portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to Blockchain",
          lectures: [
            { title: "What is Blockchain?", duration: "15 min" },
            { title: "Setting Up Ethereum Tools", duration: "20 min" },
            { title: "Blockchain Use Cases", duration: "15 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Solidity Basics",
          lectures: [
            { title: "Introduction to Solidity", duration: "40 min" },
            { title: "Smart Contract Fundamentals", duration: "50 min" },
            { title: "Testing Smart Contracts", duration: "45 min" },
            { title: "Project: Simple Smart Contract", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Building DApps",
          lectures: [
            { title: "What are DApps?", duration: "40 min" },
            {
              title: "Integrating Front-End with Blockchain",
              duration: "50 min",
            },
            { title: "Deploying DApps on Ethereum", duration: "45 min" },
            { title: "Project: Decentralized Voting App", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Blockchain Security",
          lectures: [
            { title: "Securing Smart Contracts", duration: "40 min" },
            { title: "Auditing Blockchain Applications", duration: "50 min" },
            { title: "Common Vulnerabilities", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Blockchain Project", duration: "30 min" },
            { title: "Building and Deploying", duration: "3 hours" },
            { title: "Project Review and Audit", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic JavaScript knowledge",
        "A computer with Ethereum tools installed",
        "Familiarity with web development",
      ],
      instructor: {
        name: "Dr. Priya Sharma",
        bio: "A blockchain developer with 8 years of experience building decentralized applications on Ethereum. Priya is passionate about blockchain innovation and teaching its applications.",
      },
    },
    {
      slug: "ui-ux-design",
      title: "UI/UX Design",
      description: "Design user-friendly interfaces with Figma and Adobe XD.",
      overview:
        "Master the art of UI/UX design with this hands-on course. Learn to create user-friendly interfaces using Figma and Adobe XD, focusing on user research, prototyping, and usability testing.",
      learningObjectives: [
        "Conduct user research and create personas.",
        "Design wireframes and prototypes with Figma.",
        "Create visually appealing UI designs.",
        "Perform usability testing and iterate designs.",
        "Build a UI/UX portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to UI/UX Design",
          lectures: [
            { title: "What is UI/UX Design?", duration: "15 min" },
            { title: "Setting Up Figma and Adobe XD", duration: "20 min" },
            { title: "Design Thinking Principles", duration: "15 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "User Research & Personas",
          lectures: [
            { title: "Conducting User Interviews", duration: "40 min" },
            { title: "Creating User Personas", duration: "50 min" },
            { title: "Defining User Journeys", duration: "45 min" },
            { title: "Project: User Research Report", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Wireframing & Prototyping",
          lectures: [
            { title: "Wireframing Basics", duration: "40 min" },
            { title: "Prototyping in Figma", duration: "50 min" },
            { title: "Interactive Prototypes", duration: "45 min" },
            { title: "Project: Mobile App Prototype", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "UI Design & Usability Testing",
          lectures: [
            { title: "Designing UI Components", duration: "40 min" },
            { title: "Usability Testing Methods", duration: "50 min" },
            { title: "Iterating Based on Feedback", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your UI/UX Project", duration: "30 min" },
            { title: "Designing and Testing", duration: "3 hours" },
            { title: "Project Presentation", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic computer literacy",
        "Figma or Adobe XD installed",
        "No prior design experience required",
      ],
      instructor: {
        name: "Emma Davis",
        bio: "A UI/UX designer with 6 years of experience creating user-friendly interfaces for tech startups. Emma is passionate about teaching design principles and user-centered design.",
      },
    },
    {
      slug: "game-development",
      title: "Game Development",
      description: "Create games with Unity and Unreal Engine.",
      overview:
        "Learn to build immersive games with Unity and Unreal Engine. This course covers 3D modeling, physics, and scripting to create engaging gaming experiences for various platforms.",
      learningObjectives: [
        "Understand game development fundamentals.",
        "Build 2D and 3D games with Unity.",
        "Create games using Unreal Engine.",
        "Implement game physics and mechanics.",
        "Develop a game portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to Game Development",
          lectures: [
            { title: "What is Game Development?", duration: "15 min" },
            { title: "Setting Up Unity", duration: "20 min" },
            { title: "Setting Up Unreal Engine", duration: "20 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Unity Basics",
          lectures: [
            { title: "Unity Interface and Workflow", duration: "40 min" },
            { title: "2D Game Development", duration: "50 min" },
            { title: "Scripting with C#", duration: "45 min" },
            { title: "Project: 2D Platformer Game", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Unreal Engine Fundamentals",
          lectures: [
            { title: "Unreal Engine Interface", duration: "40 min" },
            { title: "Blueprints Visual Scripting", duration: "50 min" },
            { title: "3D Game Development", duration: "45 min" },
            { title: "Project: 3D Shooter Game", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Game Physics & Mechanics",
          lectures: [
            { title: "Implementing Game Physics", duration: "40 min" },
            { title: "Creating Game Mechanics", duration: "50 min" },
            { title: "Testing and Optimization", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your Game Project", duration: "30 min" },
            { title: "Building and Testing", duration: "3 hours" },
            { title: "Project Review and Publishing", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic programming knowledge (C# or C++ recommended)",
        "Unity and Unreal Engine installed",
        "A computer with a GPU for 3D rendering",
      ],
      instructor: {
        name: "James Wilson",
        bio: "A game developer with 10 years of experience building games with Unity and Unreal Engine. James has worked on indie and AAA titles and loves teaching game development.",
      },
    },
    {
      slug: "internet-of-things",
      title: "Internet of Things",
      description: "Develop IoT solutions with Arduino and Raspberry Pi.",
      overview:
        "Explore the Internet of Things with this practical course. Learn to build connected devices and smart systems using Arduino and Raspberry Pi, focusing on real-world IoT applications.",
      learningObjectives: [
        "Understand IoT concepts and architectures.",
        "Program Arduino for sensor-based projects.",
        "Build IoT systems with Raspberry Pi.",
        "Integrate IoT devices with cloud platforms.",
        "Create an IoT portfolio project.",
      ],
      curriculum: [
        {
          section: "Introduction to IoT",
          lectures: [
            { title: "What is IoT?", duration: "15 min" },
            { title: "Setting Up Arduino", duration: "20 min" },
            { title: "Setting Up Raspberry Pi", duration: "20 min" },
          ],
          duration: "1 hour",
        },
        {
          section: "Arduino Programming",
          lectures: [
            { title: "Arduino Basics", duration: "40 min" },
            { title: "Sensors and Actuators", duration: "50 min" },
            { title: "Building IoT Prototypes", duration: "45 min" },
            { title: "Project: Smart Sensor System", duration: "1.5 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Raspberry Pi IoT",
          lectures: [
            { title: "Raspberry Pi Setup and Python", duration: "40 min" },
            { title: "Connecting IoT Devices", duration: "50 min" },
            { title: "IoT Data Visualization", duration: "45 min" },
            { title: "Project: Smart Home System", duration: "2 hours" },
          ],
          duration: "3 weeks",
        },
        {
          section: "Cloud Integration",
          lectures: [
            { title: "Connecting IoT to the Cloud", duration: "40 min" },
            { title: "Data Storage and Analysis", duration: "50 min" },
            { title: "IoT Security", duration: "45 min" },
          ],
          duration: "2 weeks",
        },
        {
          section: "Capstone Project",
          lectures: [
            { title: "Planning Your IoT Project", duration: "30 min" },
            { title: "Building and Testing", duration: "3 hours" },
            { title: "Project Review and Deployment", duration: "1 hour" },
          ],
          duration: "3 weeks",
        },
      ],
      requirements: [
        "Basic programming knowledge (Python or C recommended)",
        "Arduino and Raspberry Pi hardware",
        "Basic electronics knowledge (optional)",
      ],
      instructor: {
        name: "Dr. Maria Gonzalez",
        bio: "An IoT expert with 8 years of experience developing smart systems with Arduino and Raspberry Pi. Maria is passionate about teaching IoT and its real-world applications.",
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
        <div className="text-2xl text-green-400 animate-pulse font-mono tracking-wide">
          Loading...
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
        <div className="text-2xl text-red-400 font-mono tracking-wide">
          Course not found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Navbar */}
      <nav className="bg-gray-800/95 backdrop-blur-lg border-b border-green-500/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-green-400 font-mono">
              CyberLearn
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-200 font-mono">
              Hello, {session.user.name}
            </span>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 font-mono text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] w-full flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-green-400 font-mono mb-6 leading-tight">
            {course.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-200 max-w-3xl mx-auto mb-8 font-mono">
            {course.description}
          </p>
          <div className="mb-6">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-gray-300 font-mono text-sm mt-2">
              Progress: {Math.round(progress.completionPercentage)}% Complete
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 font-mono text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/20 z-0"></div>
      </section>

      {/* Course Overview Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 font-mono">
            Course Overview
          </h2>
          <p className="text-base text-gray-200 font-mono leading-relaxed">
            {course.overview}
          </p>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 font-mono">
            What You'll Learn
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.learningObjectives.map((objective, index) => (
              <li
                key={index}
                className="flex items-start text-gray-200 font-mono text-sm"
              >
                <span className="text-green-400 mr-2">✔</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Course Content Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 font-mono">
            Course Content
          </h2>
          <div className="space-y-4">
            {course.curriculum.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="bg-gray-800 rounded-lg p-5 border border-green-500/30"
              >
                <button
                  className="w-full text-left text-xl font-bold text-white mb-3 font-mono flex justify-between items-center"
                  onClick={() => toggleSection(sectionIndex)}
                >
                  <span>{section.section}</span>
                  <span>{expandedSections[sectionIndex] ? "−" : "+"}</span>
                </button>
                <p className="text-gray-300 font-mono text-sm mb-3">
                  Duration: {section.duration}
                </p>
                {expandedSections[sectionIndex] && (
                  <ul className="space-y-3">
                    {section.lectures.map((lecture, lectureIndex) => (
                      <li
                        key={lectureIndex}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-200 font-mono text-sm"
                      >
                        <div className="flex items-center space-x-3">
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
                            className="h-4 w-4 text-green-500 focus:ring-green-400 border-gray-600 rounded"
                            disabled={progress.completedLectures.includes(
                              lecture.title
                            )}
                          />
                          <button
                            onClick={() => navigateToLecture(lecture.title)}
                            className="py-1.5 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-mono text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleAIExplain(lecture.title)}
                            className="py-1.5 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-mono text-xs"
                            disabled={isLoading}
                          >
                            {isLoading ? "Loading..." : "AI Explain"}
                          </button>
                          <span className="truncate">{lecture.title}</span>
                        </div>
                        <span className="mt-2 sm:mt-0 sm:ml-4 text-gray-300">
                          {lecture.duration}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for AI Explanation */}
      <Modal
        isOpen={isPopupOpen}
        onRequestClose={() => setIsPopupOpen(false)}
        contentLabel="AI Explanation"
        className="relative bg-gray-800 rounded-lg p-6 max-w-lg mx-auto my-8 max-h-[70vh] overflow-y-auto outline-none"
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        appElement={
          typeof window !== "undefined"
            ? document.getElementById("__next") || document.body
            : document.body
        }
      >
        <h2 className="text-xl font-bold text-green-400 mb-4 font-mono">
          AI Explanation
        </h2>
        {error ? (
          <p className="text-red-400 font-mono text-sm">{error}</p>
        ) : (
          <p className="text-gray-200 font-mono text-sm">{popupContent}</p>
        )}
        <button
          onClick={() => setIsPopupOpen(false)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 font-mono text-sm w-full sm:w-auto"
        >
          Close
        </button>
      </Modal>

      {/* Requirements Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 font-mono">
            Requirements
          </h2>
          <ul className="space-y-2">
            {course.requirements.map((requirement, index) => (
              <li
                key={index}
                className="flex items-start text-gray-200 font-mono text-sm"
              >
                <span className="text-green-400 mr-2">•</span>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-green-400 mb-6 font-mono">
            Meet Your Instructor
          </h2>
          <div className="bg-gray-800 rounded-lg p-5 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-2 font-mono">
              {course.instructor.name}
            </h3>
            <p className="text-gray-200 font-mono text-sm">
              {course.instructor.bio}
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 py-8 border-t border-green-500/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-200 font-mono mb-4">
            Join a global community of tech pioneers. Our meticulously designed
            courses in Front-End, Back-End, AI, Cybersecurity, Cloud Computing,
            Data Science, Mobile Apps, DevOps, Blockchain, UI/UX, Game
            Development, and IoT offer hands-on projects, expert mentorship, and
            the latest industry insights to propel you to the forefront of
            technology.
          </p>
          <p className="text-xs text-gray-400 font-mono">
            &copy; 2025 CyberLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
