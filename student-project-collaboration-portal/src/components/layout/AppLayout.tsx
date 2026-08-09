"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function AppLayout({
  children,
  requireAuth = true,
  requireAdmin = false,
}: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push("/login");
      } else if (requireAdmin && user?.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, loading, requireAuth, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 spinner" />
          <p className="text-slate-500 text-sm">Loading ProjectLink...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) return null;
  if (requireAdmin && user?.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
