"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, TextArea, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { DOMAINS, DEPARTMENTS, SKILLS } from "@/lib/utils";
import { Plus, X, ArrowLeft, Save, Send } from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
    domain: "",
    department: "",
    requiredSkills: [] as string[],
    maxMembers: 4,
    deadline: "",
  });

  const handleChange = (field: string, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTech = () => {
    if (newTech.trim() && !form.technologies.includes(newTech.trim())) {
      handleChange("technologies", [...form.technologies, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTech = (t: string) => {
    handleChange("technologies", form.technologies.filter((tech) => tech !== t));
  };

  const addSkill = (skill: string) => {
    if (!form.requiredSkills.includes(skill)) {
      handleChange("requiredSkills", [...form.requiredSkills, skill]);
    }
  };

  const removeSkill = (s: string) => {
    handleChange("requiredSkills", form.requiredSkills.filter((skill) => skill !== s));
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(status === "draft" ? "Project saved as draft" : "Project submitted for approval!");
      router.push("/my-projects");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
          <p className="text-slate-500 mt-1">Fill in the details below. Published projects need admin approval.</p>
        </div>

        <div className="space-y-5">
          {/* Basic Info */}
          <Card>
            <CardHeader><h2 className="font-semibold text-slate-900">Project Details</h2></CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g., AI-Powered Study Assistant"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
              <TextArea
                label="Project Description"
                placeholder="Describe your project, its goals, what problem it solves, and what you're building..."
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                required
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Domain"
                  value={form.domain}
                  onChange={(e) => handleChange("domain", e.target.value)}
                  options={DOMAINS.map((d) => ({ value: d, label: d }))}
                  placeholder="Select domain"
                />
                <Select
                  label="Department"
                  value={form.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                  placeholder="Select department"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Team Size (max members)"
                  type="number"
                  min={2}
                  max={20}
                  value={form.maxMembers}
                  onChange={(e) => handleChange("maxMembers", parseInt(e.target.value) || 4)}
                />
                <Input
                  label="Project Deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                />
              </div>
            </CardBody>
          </Card>

          {/* Technologies */}
          <Card>
            <CardHeader><h2 className="font-semibold text-slate-900">Technologies</h2></CardHeader>
            <CardBody>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., React, Python, TensorFlow"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
                <Button variant="outline" size="sm" onClick={addTech}>
                  <Plus size={16} /> Add
                </Button>
              </div>
              {form.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.technologies.map((tech) => (
                    <div key={tech} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                      {tech}
                      <button onClick={() => removeTech(tech)} className="hover:text-red-500 ml-1">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader><h2 className="font-semibold text-slate-900">Required Skills</h2></CardHeader>
            <CardBody>
              <p className="text-xs text-slate-500 mb-3">Select skills that team members should have:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {SKILLS.slice(0, 20).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => form.requiredSkills.includes(skill) ? removeSkill(skill) : addSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      form.requiredSkills.includes(skill)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {form.requiredSkills.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Selected ({form.requiredSkills.length}):</p>
                  <div className="flex flex-wrap gap-1">
                    {form.requiredSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSubmit("draft")}
              loading={loading}
            >
              <Save size={16} /> Save as Draft
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSubmit("published")}
              loading={loading}
            >
              <Send size={16} /> Publish Project
            </Button>
          </div>
          <p className="text-xs text-center text-slate-400">
            Published projects are submitted for admin approval before appearing in Project Discovery.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
