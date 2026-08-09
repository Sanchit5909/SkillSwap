"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import {
  Users, Calendar, ArrowLeft, Send, Check, X,
  FolderGit2, Clock, Tag, Briefcase
} from "lucide-react";

interface ProjectDetail {
  project: {
    id: string; title: string; description: string;
    technologies: string[]; domain: string | null; department: string | null;
    requiredSkills: string[]; maxMembers: number | null;
    deadline: string | null; status: string; approvalStatus: string;
    creatorId: string | null; createdAt: string;
  };
  creator: { id: string; name: string; email: string; profileImage: string | null; department: string | null };
  members: Array<{ userId: string | null; name: string | null; email: string | null; profileImage: string | null; role: string | null; skills: string[] | null }>;
  existingRequest: { id: string; status: string } | null;
  isMember: boolean;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoinRequest = async () => {
    setRequesting(true);
    try {
      const res = await fetch(`/api/projects/${id}/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: joinMessage }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      toast.success("Join request sent! The project owner will review it.");
      setShowJoinModal(false);
      // Refresh
      const updated = await fetch(`/api/projects/${id}`).then((r) => r.json());
      setData(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 spinner" />
        </div>
      </AppLayout>
    );
  }

  if (!data?.project) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-semibold text-slate-700">Project not found</h2>
          <Link href="/projects"><Button className="mt-4">Back to Projects</Button></Link>
        </div>
      </AppLayout>
    );
  }

  const { project, creator, members, existingRequest, isMember } = data;
  const isOwner = user?.id === project.creatorId;
  const availableSpots = (project.maxMembers || 0) - members.length;
  const canJoin = !isOwner && !isMember && !existingRequest && availableSpots > 0 && project.approvalStatus === "approved";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardBody>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={project.approvalStatus} />
                      {project.domain && <Badge variant="primary">{project.domain}</Badge>}
                      {project.department && <Badge variant="secondary">{project.department}</Badge>}
                    </div>
                  </div>
                  {isOwner && (
                    <Link href={`/projects/${id}/requests`}>
                      <Button variant="outline" size="sm">Manage Requests</Button>
                    </Link>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed mb-6">{project.description}</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Technologies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.technologies || []).map((tech) => (
                        <Badge key={tech}>{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.requiredSkills || []).map((skill) => (
                        <Badge key={skill} variant="warning">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Users size={11} /> Team Size</p>
                    <p className="font-semibold text-slate-900">{members.length}/{project.maxMembers}</p>
                    {availableSpots > 0 && <p className="text-xs text-green-600">{availableSpots} spots open</p>}
                  </div>
                  {project.deadline && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Calendar size={11} /> Deadline</p>
                      <p className="font-semibold text-slate-900">{formatDate(project.deadline)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock size={11} /> Posted</p>
                    <p className="font-semibold text-slate-900">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" /> Team Members ({members.length})
                </h2>
              </CardHeader>
              <CardBody>
                {members.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No members yet</p>
                ) : (
                  <div className="space-y-3">
                    {members.map((m) => (
                      <div key={m.userId} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <Avatar name={m.name || "?"} image={m.profileImage} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{m.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(m.skills || []).slice(0, 3).map((s) => (
                              <Badge key={s} size="sm">{s}</Badge>
                            ))}
                          </div>
                        </div>
                        <Badge variant={m.role === "owner" ? "primary" : "default"} size="sm">
                          {m.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Creator */}
            <Card>
              <CardBody>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Project Creator</p>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={creator?.name || "?"} image={creator?.profileImage} size="md" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{creator?.name}</p>
                    <p className="text-xs text-slate-500">{creator?.department}</p>
                  </div>
                </div>
                <Link href={`/users/${creator?.id}`}>
                  <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                </Link>
              </CardBody>
            </Card>

            {/* Join Action */}
            <Card>
              <CardBody>
                {isOwner ? (
                  <div className="text-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <FolderGit2 size={20} className="text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-3">You own this project</p>
                    <Link href={`/projects/${id}/requests`}>
                      <Button className="w-full" size="sm">View Join Requests</Button>
                    </Link>
                  </div>
                ) : isMember ? (
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Check size={20} className="text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-green-700 mb-1">You're a member!</p>
                    <p className="text-xs text-slate-500 mb-3">You're part of this project team</p>
                    <Link href="/groups">
                      <Button variant="outline" size="sm" className="w-full">Go to Groups</Button>
                    </Link>
                  </div>
                ) : existingRequest ? (
                  <div className="text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${
                      existingRequest.status === "rejected" ? "bg-red-100" : "bg-yellow-100"
                    }`}>
                      {existingRequest.status === "rejected" ? (
                        <X size={20} className="text-red-600" />
                      ) : (
                        <Clock size={20} className="text-yellow-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      {existingRequest.status === "rejected" ? "Request Not Accepted" : "Request Pending"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {existingRequest.status === "rejected"
                        ? "Your request was not accepted"
                        : "Waiting for project owner's response"}
                    </p>
                  </div>
                ) : availableSpots <= 0 ? (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700 mb-1">Team is Full</p>
                    <p className="text-xs text-slate-400">This project has reached its maximum team size</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">Want to join?</p>
                    <p className="text-xs text-slate-500 mb-3">
                      {availableSpots} spot{availableSpots !== 1 ? "s" : ""} available
                    </p>
                    <Button className="w-full" onClick={() => setShowJoinModal(true)}>
                      <Send size={15} /> Request to Join
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Request to Join Project"
      >
        <div className="space-y-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <p className="text-sm font-medium text-indigo-900">{project.title}</p>
            <p className="text-xs text-indigo-600 mt-1">by {creator?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Message to Project Owner (optional)
            </label>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd be a great fit for this project..."
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowJoinModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleJoinRequest} loading={requesting}>
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
