import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Link - Student Project Collaboration Portal",
  description:
    "Find teammates, build projects, collaborate smarter. The ultimate platform for college students.",
  keywords: "student projects, collaboration, college, teamwork, hackathon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
