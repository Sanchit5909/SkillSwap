"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Plus, FolderGit2, Users, Calendar, ArrowRight, Settings } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  domain: string | null;
  status: string;
  approvalStatus: string;
  memberCount: number;
  maxMembers: number | null;
  createdAt: string;
  deadline: string | null;
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"created" | "joined">("created");

  useEffect(() => {
    Promise.all([
      fetch("/api/projects?mine=true").then((r) => r.json()),
      fetch("/api/projects?joined=true").then((r) => r.json()),
    ]).then(([mine, joined]) => {
      setProjects(mine.projects || []);
      setJoinedProjects(joined.projects || []);
    }).finally(() => setLoading(false));
  }, []);

  const displayProjects = tab === "created" ? projects : joinedProjects;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
            <p className="text-slate-500 mt-1">{projects.length} created, {joinedProjects.length} joined</p>
          </div>
          <Link href="/my-projects/create">
            <Button><Plus size={16} /> Create Project</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {(["created", "joined"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t} ({t === "created" ? projects.length : joinedProjects.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 spinner" /></div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderGit2 size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-700 font-semibold mb-2">
              {tab === "created" ? "No projects created yet" : "No joined projects"}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              {tab === "created"
                ? "Create your first project idea and attract teammates"
                : "Browse and join projects to collaborate with others"}
            </p>
            <Link href={tab === "created" ? "/my-projects/create" : "/projects"}>
              <Button>{tab === "created" ? "Create Project" : "Explore Projects"}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProjects.map((project) => (
              <Card key={project.id} hover>
                <CardBody className="flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 text-sm flex-1">{project.title}</h3>
                    <StatusBadge status={project.approvalStatus} />
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-3 flex-1">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(project.technologies || []).slice(0, 3).map((tech) => (
                      <Badge key={tech} size="sm">{tech}</Badge>
                    ))}
                  </div>
                  <div className="border-t border-slate-50 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Users size={11} /> {project.memberCount}/{project.maxMembers} members</span>
                      {project.deadline && <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(project.deadline)}</span>}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <button className="w-full text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1">
                          View <ArrowRight size={11} />
                        </button>
                      </Link>
                      {tab === "created" && (
                        <Link href={`/projects/${project.id}/requests`} className="flex-1">
                          <button className="w-full text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1">
                            Requests
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
