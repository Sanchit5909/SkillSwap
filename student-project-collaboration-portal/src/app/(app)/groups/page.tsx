"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, TextArea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import { Users, MessageCircle, Plus, ArrowRight, FolderGit2 } from "lucide-react";

interface Group {
  id: string;
  name: string;
  projectId: string | null;
  leaderId: string | null;
  description: string | null;
  createdAt: string;
  projectTitle: string | null;
  leaderName: string | null;
  memberCount: number;
}

export default function GroupsPage() {
  const toast = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => setGroups(d.groups || []))
      .finally(() => setLoading(false));
  }, []);

  const createGroup = async () => {
    if (!form.name.trim()) {
      toast.error("Group name required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroups((prev) => [...prev, { ...data.group, memberCount: 1 }]);
      setShowCreate(false);
      setForm({ name: "", description: "" });
      toast.success("Group created!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Groups</h1>
            <p className="text-slate-500 mt-1">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Group
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 spinner" /></div>
        ) : groups.length === 0 ? (
          <Card>
            <CardBody className="text-center py-20">
              <Users size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No Groups Yet</h3>
              <p className="text-slate-400 text-sm mb-4">Create a group for your project team or join a project to get added automatically.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setShowCreate(true)} size="sm">Create Group</Button>
                <Link href="/projects"><Button variant="outline" size="sm">Browse Projects</Button></Link>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card hover>
                  <CardBody>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{group.name}</h3>
                        {group.projectTitle && (
                          <p className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5">
                            <FolderGit2 size={10} /> {group.projectTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{group.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-3">
                      <span className="flex items-center gap-1"><Users size={11} /> {group.memberCount} members</span>
                      <span className="flex items-center gap-1 text-indigo-600 font-medium">
                        Open Chat <ArrowRight size={11} />
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Group">
        <div className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g., AI Study Assistant Team"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <TextArea
            label="Description"
            placeholder="What is this group about?"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button className="flex-1" onClick={createGroup} loading={creating}>Create Group</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
