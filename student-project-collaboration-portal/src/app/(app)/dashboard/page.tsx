"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  FolderGit2, Users, Bell, MessageCircle, Search,
  Plus, Bot, Calendar, CheckSquare, TrendingUp,
  ArrowRight, Zap, Award, Clock
} from "lucide-react";

interface Stats {
  myProjectsCount: number;
  joinedProjectsCount: number;
  pendingRequestsCount: number;
  unreadNotificationsCount: number;
  myGroupsCount: number;
  totalTasksCount: number;
  todoTasksCount: number;
  inProgressTasksCount: number;
  completedTasksCount: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  domain: string | null;
  status: string;
  approvalStatus: string;
  createdAt: string;
  technologies: string[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
  link: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, myProjRes, notifRes, availProjRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/projects?mine=true"),
          fetch("/api/notifications"),
          fetch("/api/projects?approvalStatus=approved&status=active"),
        ]);

        const [statsData, myProjData, notifData, availData] = await Promise.all([
          statsRes.json(),
          myProjRes.json(),
          notifRes.json(),
          availProjRes.json(),
        ]);

        setStats(statsData.stats);
        setMyProjects(myProjData.projects?.slice(0, 3) || []);
        setNotifications(notifData.notifications?.slice(0, 5) || []);
        setAvailableProjects(availData.projects?.slice(0, 4) || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { label: "Create Project", icon: Plus, href: "/my-projects/create", color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
    { label: "Find Project", icon: Search, href: "/projects", color: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "My Groups", icon: Users, href: "/groups", color: "bg-cyan-600 hover:bg-cyan-700 text-white" },
    { label: "Ask AI", icon: Bot, href: "/ai-chat", color: "bg-pink-600 hover:bg-pink-700 text-white" },
    { label: "Events", icon: Calendar, href: "/events", color: "bg-orange-500 hover:bg-orange-600 text-white" },
    { label: "Notifications", icon: Bell, href: "/notifications", color: "bg-slate-600 hover:bg-slate-700 text-white" },
  ];

  const profilePercent = user ? (
    [user.name, user.email, user.department, user.year, user.bio,
      (user.skills?.length ?? 0) > 0, (user.interests?.length ?? 0) > 0, user.profileImage]
      .filter(Boolean).length / 8 * 100
  ) : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 spinner" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
                {user?.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-slate-500 mt-1">Here's what's happening with your projects today.</p>
            </div>
            <Link href="/my-projects/create">
              <Button>
                <Plus size={16} /> New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {!user?.profileComplete && (
          <div className="mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                <p className="text-indigo-100 text-sm">Help teammates find you by completing your profile</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-white/20 rounded-full h-2 max-w-32">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${Math.round(profilePercent)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(profilePercent)}%</span>
                </div>
              </div>
              <Link href="/profile/setup">
                <Button variant="secondary" size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50">
                  Complete Profile <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "My Projects", value: stats?.myProjectsCount || 0, icon: FolderGit2, color: "text-indigo-600 bg-indigo-50" },
            { label: "Joined Projects", value: stats?.joinedProjectsCount || 0, icon: Users, color: "text-purple-600 bg-purple-50" },
            { label: "Pending Requests", value: stats?.pendingRequestsCount || 0, icon: Clock, color: "text-orange-600 bg-orange-50" },
            { label: "My Groups", value: stats?.myGroupsCount || 0, icon: MessageCircle, color: "text-cyan-600 bg-cyan-50" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardBody className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Task Progress */}
        {stats && stats.totalTasksCount > 0 && (
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <CheckSquare size={16} className="text-indigo-600" /> My Task Progress
                </h3>
                <span className="text-sm text-slate-500">{stats.totalTasksCount} total tasks</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "To Do", value: stats.todoTasksCount, color: "bg-slate-200 text-slate-600" },
                  { label: "In Progress", value: stats.inProgressTasksCount, color: "bg-yellow-100 text-yellow-700" },
                  { label: "Completed", value: stats.completedTasksCount, color: "bg-green-100 text-green-700" },
                ].map((t) => (
                  <div key={t.label} className={`rounded-xl p-3 text-center ${t.color}`}>
                    <div className="text-2xl font-bold">{t.value}</div>
                    <div className="text-xs font-medium mt-0.5">{t.label}</div>
                  </div>
                ))}
              </div>
              {stats.totalTasksCount > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round((stats.completedTasksCount / stats.totalTasksCount) * 100)}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full h-2 transition-all"
                      style={{ width: `${(stats.completedTasksCount / stats.totalTasksCount) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Zap size={18} className="text-indigo-600" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <button className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl transition-all shadow-sm ${action.color}`}>
                    <action.icon size={20} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>

            {/* Recent Notifications */}
            <h2 className="text-lg font-semibold text-slate-900 mb-3 mt-6 flex items-center gap-2">
              <Bell size={18} className="text-indigo-600" /> Recent Notifications
            </h2>
            <Card>
              <CardBody className="p-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-slate-500 text-sm">No notifications yet</div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((n) => (
                      <Link key={n.id} href={n.link || "/notifications"}>
                        <div className={`p-3 rounded-xl cursor-pointer transition-colors ${n.isRead ? "hover:bg-slate-50" : "bg-indigo-50 hover:bg-indigo-100"}`}>
                          <p className={`text-sm ${n.isRead ? "text-slate-600" : "text-slate-900 font-medium"}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/notifications" className="block text-center text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium">
                  View all notifications →
                </Link>
              </CardBody>
            </Card>
          </div>

          {/* My Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FolderGit2 size={18} className="text-indigo-600" /> My Projects
              </h2>
              <Link href="/my-projects" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View all
              </Link>
            </div>
            {myProjects.length === 0 ? (
              <Card>
                <CardBody className="text-center py-10">
                  <FolderGit2 size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm mb-3">No projects yet</p>
                  <Link href="/my-projects/create">
                    <Button size="sm">Create Project</Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {myProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card hover>
                      <CardBody>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-slate-900 text-sm line-clamp-1">{project.title}</h3>
                          <StatusBadge status={project.approvalStatus} />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{project.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {(project.technologies || []).slice(0, 3).map((tech: string) => (
                            <Badge key={tech} size="sm">{tech}</Badge>
                          ))}
                          {(project.technologies || []).length > 3 && (
                            <Badge size="sm">+{project.technologies.length - 3}</Badge>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
                <Link href="/my-projects/create">
                  <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors text-sm flex items-center justify-center gap-2">
                    <Plus size={16} /> Create New Project
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Available Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Search size={18} className="text-indigo-600" /> Available Projects
              </h2>
              <Link href="/projects" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Explore all
              </Link>
            </div>
            {availableProjects.length === 0 ? (
              <Card>
                <CardBody className="text-center py-10">
                  <Search size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No projects available</p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card hover>
                      <CardBody>
                        <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">{project.description}</p>
                        {project.domain && (
                          <Badge variant="primary" size="sm">{project.domain}</Badge>
                        )}
                      </CardBody>
                    </Card>
                  </Link>
                ))}
                <Link href="/projects">
                  <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Search size={16} /> Explore All Projects
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
