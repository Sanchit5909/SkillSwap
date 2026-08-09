"use client";

import React from "react";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ name, image, size = "md", className = "" }: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const colors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-blue-500",
    "bg-violet-500",
  ];

  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  if (image && !image.startsWith("data:")) {
    return (
      <img
        src={image}
        alt={name}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold text-white ${bgColor} ${sizes[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
