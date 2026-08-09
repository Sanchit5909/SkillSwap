"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { DOMAINS, DEPARTMENTS } from "@/lib/utils";
import { Search, Filter, Users, Calendar, ArrowRight, X } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  domain: string | null;
  department: string | null;
  requiredSkills: string[];
  creatorId: string | null;
  creatorName: string | null;
  creatorImage: string | null;
  maxMembers: number | null;
  memberCount: number;
  deadline: string | null;
  status: string;
  approvalStatus: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [department, setDepartment] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        approvalStatus: "approved",
        status: "active",
      });
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDomain = !domain || p.domain === domain;
    const matchDept = !department || p.department === department;
    return matchSearch && matchDomain && matchDept;
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Discover Projects</h1>
          <p className="text-slate-500">Find your next collaboration from {projects.length} active projects</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, technologies, domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                showFilters || domain || department
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter size={16} />
              Filters {(domain || department) ? "(active)" : ""}
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-slate-100 slide-in">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Domains</option>
                {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {(domain || department) && (
                <button
                  onClick={() => { setDomain(""); setDepartment(""); }}
                  className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={14} /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{filtered.length}</span> projects
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-slate-100 rounded mb-2" />
                <div className="h-3 bg-slate-100 rounded mb-2 w-4/5" />
                <div className="h-3 bg-slate-100 rounded mb-4 w-2/3" />
                <div className="flex gap-2">
                  <div className="h-5 bg-slate-100 rounded-full w-16" />
                  <div className="h-5 bg-slate-100 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-700 font-semibold mb-2">No projects found</h3>
            <p className="text-slate-400 text-sm mb-4">Try adjusting your filters or search terms</p>
            <button onClick={() => { setSearch(""); setDomain(""); setDepartment(""); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card hover className="h-full">
                  <CardBody className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm leading-snug flex-1">
                        {project.title}
                      </h3>
                      {project.domain && (
                        <Badge variant="primary" size="sm" className="flex-shrink-0">
                          {project.domain}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed flex-1">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {(project.technologies || []).slice(0, 4).map((tech) => (
                        <Badge key={tech} size="sm">{tech}</Badge>
                      ))}
                      {(project.technologies || []).length > 4 && (
                        <Badge size="sm">+{project.technologies.length - 4}</Badge>
                      )}
                    </div>

                    <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {project.creatorName && (
                          <Avatar name={project.creatorName} image={project.creatorImage} size="xs" />
                        )}
                        <span className="text-xs text-slate-500 truncate max-w-[100px]">
                          {project.creatorName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users size={12} />
                        {project.memberCount}/{project.maxMembers}
                      </div>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                        <Calendar size={11} />
                        Due {formatDate(project.deadline)}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
