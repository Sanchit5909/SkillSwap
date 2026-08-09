import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diff = now.getTime() - past.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electronics & Communication",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics",
  "Physics",
  "Business Administration",
  "Other",
];

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Alumni"];

export const DOMAINS = [
  "Web Development",
  "App Development",
  "AI/ML",
  "Cybersecurity",
  "IoT",
  "Cloud Computing",
  "Data Science",
  "Blockchain",
  "Game Development",
  "Robotics",
  "Other",
];

export const SKILLS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C",
  "Go",
  "Rust",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "FastAPI",
  "Spring Boot",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Figma",
  "UI/UX Design",
  "GraphQL",
  "REST APIs",
  "HTML/CSS",
  "Tailwind CSS",
  "Vue.js",
  "Angular",
  "Flutter",
  "React Native",
  "Swift",
  "Kotlin",
];
