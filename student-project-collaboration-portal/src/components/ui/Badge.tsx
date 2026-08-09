"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  className = "",
  size = "md",
}: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    primary: "bg-indigo-100 text-indigo-700",
    secondary: "bg-purple-100 text-purple-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-cyan-100 text-cyan-700",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    draft: { variant: "default", label: "Draft" },
    pending: { variant: "warning", label: "Pending" },
    approved: { variant: "success", label: "Approved" },
    active: { variant: "primary", label: "Active" },
    completed: { variant: "info", label: "Completed" },
    rejected: { variant: "danger", label: "Rejected" },
    todo: { variant: "default", label: "To Do" },
    in_progress: { variant: "warning", label: "In Progress" },
    handled: { variant: "success", label: "Handled" },
    accepted: { variant: "success", label: "Accepted" },
    low: { variant: "success", label: "Low" },
    medium: { variant: "warning", label: "Medium" },
    high: { variant: "danger", label: "High" },
  };

  const config = statusMap[status] || { variant: "default", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
