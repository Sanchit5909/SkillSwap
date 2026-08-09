"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Eye, EyeOff, Zap, User, Mail, Lock } from "lucide-react";
import { DEPARTMENTS, YEARS } from "@/lib/utils";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    year: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        year: formData.year,
      });
      toast.success("Account created! Complete your profile.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-8 py-6 text-white text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">ProjectLink</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create Account</h1>
          <p className="text-indigo-100 text-sm">Join thousands of student collaborators</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <Input
            label="Full Name"
            placeholder="Alex Johnson"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            leftIcon={<User size={16} />}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            leftIcon={<Mail size={16} />}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              placeholder="Select dept."
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
            />
            <Select
              label="Year"
              value={formData.year}
              onChange={(e) => handleChange("year", e.target.value)}
              placeholder="Select year"
              options={YEARS.map((y) => ({ value: y, label: y }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            leftIcon={<Lock size={16} />}
            required
          />

          <p className="text-xs text-slate-400">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <div className="px-8 pb-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
