"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, TextArea, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  MessageCircle, Users, CheckSquare, FileText, Megaphone,
  Plus, Send, Upload, Trash2, ArrowLeft, Lock, ChevronRight
} from "lucide-react";

interface GroupData {
  group: { id: string; name: string; projectId: string | null; leaderId: string | null; description: string | null; createdAt: string };
  project: { id: string; title: string; description: string; status: string } | null;
  members: Array<{ userId: string | null; name: string | null; email: string | null; profileImage: string | null; role: string | null; skills: string[] | null }>;
  tasks: Array<{ id: string; title: string; description: string | null; status: string; priority: string; deadline: string | null; assignedToId: string | null; assigneeName: string | null }>;
  announcements: Array<{ id: string; title: string; content: string; createdAt: string; creatorName: string | null }>;
  files: Array<{ id: string; fileName: string; fileUrl: string; fileType: string | null; fileSize: number | null; createdAt: string; uploadedById: string | null; uploaderName: string | null }>;
  messages: Array<{ id: string; content: string; createdAt: string; senderId: string | null; senderName: string | null; senderImage: string | null }>;
}

type Tab = "chat" | "tasks" | "files" | "members" | "announcements";

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("chat");
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAnnouncModal, setShowAnnouncModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedToId: "", priority: "medium", deadline: "" });
  const [announcForm, setAnnouncForm] = useState({ title: "", content: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Failed to load group"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.messages, tab]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/groups/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMsg }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData((prev) => prev ? {
        ...prev,
        messages: [...prev.messages, { ...d.message, senderName: user?.name, senderImage: user?.profileImage }]
      } : prev);
      setNewMsg("");
    } catch (err: unknown) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const createTask = async () => {
    if (!taskForm.title.trim()) { toast.error("Task title required"); return; }
    try {
      const res = await fetch(`/api/groups/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData((prev) => prev ? { ...prev, tasks: [...prev.tasks, d.task] } : prev);
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", assignedToId: "", priority: "medium", deadline: "" });
      toast.success("Task created!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setData((prev) => prev ? {
        ...prev,
        tasks: prev.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
      } : prev);
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task");
    }
  };

  const createAnnouncement = async () => {
    if (!announcForm.title.trim() || !announcForm.content.trim()) {
      toast.error("Title and content required");
      return;
    }
    try {
      const res = await fetch(`/api/groups/${id}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcForm),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData((prev) => prev ? {
        ...prev,
        announcements: [{ ...d.announcement, creatorName: user?.name }, ...prev.announcements]
      } : prev);
      setShowAnnouncModal(false);
      setAnnouncForm({ title: "", content: "" });
      toast.success("Announcement posted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to post announcement");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("groupId", id);
      if (data?.project) formData.append("projectId", data.project.id);

      const res = await fetch("/api/files/upload", { method: "POST", body: formData });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData((prev) => prev ? { ...prev, files: [...prev.files, { ...d.file, uploaderName: user?.name }] } : prev);
      toast.success("File uploaded!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      setData((prev) => prev ? { ...prev, files: prev.files.filter((f) => f.id !== fileId) } : prev);
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    }
  };

  if (loading) {
    return <AppLayout><div className="flex justify-center h-96 items-center"><div className="w-10 h-10 spinner" /></div></AppLayout>;
  }

  if (!data?.group) {
    return <AppLayout><div className="text-center py-20"><p className="text-slate-500">Group not found or you're not a member</p></div></AppLayout>;
  }

  const { group, project, members, tasks, announcements, files, messages } = data;
  const isLeader = group.leaderId === user?.id;
  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "chat", label: "Chat", icon: <MessageCircle size={15} />, count: messages.length },
    { key: "tasks", label: "Tasks", icon: <CheckSquare size={15} />, count: tasks.length },
    { key: "files", label: "Files", icon: <FileText size={15} />, count: files.length },
    { key: "members", label: "Members", icon: <Users size={15} />, count: members.length },
    { key: "announcements", label: "Announcements", icon: <Megaphone size={15} />, count: announcements.length },
  ];

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <a href="/groups" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 text-sm w-fit">
            <ArrowLeft size={16} /> Back to Groups
          </a>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
              {project && (
                <p className="text-indigo-600 text-sm mt-1 flex items-center gap-1.5">
                  <ChevronRight size={14} /> {project.title}
                </p>
              )}
              {group.description && <p className="text-slate-500 text-sm mt-1">{group.description}</p>}
            </div>
            {tasks.length > 0 && (
              <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Progress</p>
                  <p className="text-lg font-bold text-indigo-600">{progress}%</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-xs text-slate-500">{completedTasks.length}/{tasks.length} tasks</p>
                  <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1">
                    <div className="bg-indigo-500 rounded-full h-1.5" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.icon} {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {tab === "chat" && (
          <div className="flex flex-col" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MessageCircle size={40} className="mx-auto mb-3 text-slate-200" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                        <Avatar name={msg.senderName || "?"} image={msg.senderImage} size="sm" className="flex-shrink-0" />
                        <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                          {!isMe && <p className="text-xs text-slate-500 font-medium">{msg.senderName}</p>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-sm"
                              : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-xs text-slate-400">{timeAgo(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <Button onClick={sendMessage} loading={sending} size="md">
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tasks Tab */}
        {tab === "tasks" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Task Board</h2>
              <Button size="sm" onClick={() => setShowTaskModal(true)}>
                <Plus size={15} /> Add Task
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { status: "todo", label: "To Do", tasks: todoTasks, color: "bg-slate-50 border-slate-200" },
                { status: "in_progress", label: "In Progress", tasks: inProgressTasks, color: "bg-yellow-50 border-yellow-200" },
                { status: "completed", label: "Completed", tasks: completedTasks, color: "bg-green-50 border-green-200" },
              ].map((col) => (
                <div key={col.status} className={`rounded-2xl border p-4 ${col.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm text-slate-700">{col.label}</h3>
                    <span className="text-xs bg-white border border-current/20 rounded-full px-2 py-0.5 text-slate-500">
                      {col.tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {col.tasks.map((task) => (
                      <div key={task.id} className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-slate-900 flex-1">{task.title}</p>
                          <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "success"} size="sm">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>}
                        {task.assigneeName && (
                          <p className="text-xs text-indigo-600 flex items-center gap-1">
                            <Users size={10} /> {task.assigneeName}
                          </p>
                        )}
                        {task.deadline && (
                          <p className="text-xs text-slate-400 mt-1">{formatDate(task.deadline)}</p>
                        )}
                        <div className="flex gap-1 mt-2">
                          {col.status !== "todo" && (
                            <button
                              onClick={() => updateTaskStatus(task.id, "todo")}
                              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                            >← Todo</button>
                          )}
                          {col.status !== "in_progress" && (
                            <button
                              onClick={() => updateTaskStatus(task.id, "in_progress")}
                              className="text-xs text-yellow-600 hover:text-yellow-800 px-2 py-1 rounded-lg hover:bg-yellow-50 transition-colors"
                            >In Progress</button>
                          )}
                          {col.status !== "completed" && (
                            <button
                              onClick={() => updateTaskStatus(task.id, "completed")}
                              className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                            >✓ Done</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {col.tasks.length === 0 && (
                      <div className="text-center py-6 text-slate-300 text-xs">No tasks</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {tab === "files" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Project Files</h2>
              <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors ${uploading ? "opacity-50" : ""}`}>
                {uploading ? <div className="w-4 h-4 spinner border-white border-t-transparent" /> : <Upload size={15} />}
                {uploading ? "Uploading..." : "Upload File"}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            {files.length === 0 ? (
              <Card><CardBody className="text-center py-16">
                <FileText size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No files uploaded yet</p>
              </CardBody></Card>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardBody className="flex items-center gap-3 py-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{file.fileName}</p>
                        <p className="text-xs text-slate-400">
                          By {file.uploaderName} • {formatDate(file.createdAt)}
                          {file.fileSize && ` • ${(file.fileSize / 1024).toFixed(1)} KB`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">Download</Button>
                        </a>
                        {file.uploadedById === user?.id && (
                          <Button variant="danger" size="sm" onClick={() => deleteFile(file.id)}>
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {tab === "members" && (
          <div>
            <h2 className="font-semibold text-slate-900 mb-4">Team Members ({members.length})</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {members.map((m) => (
                <Card key={m.userId}>
                  <CardBody className="flex items-center gap-3">
                    <Avatar name={m.name || "?"} image={m.profileImage} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 text-sm">{m.name}</p>
                        {m.role === "leader" && <Badge variant="primary" size="sm">Leader</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(m.skills || []).slice(0, 3).map((s) => (
                          <Badge key={s} size="sm">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {tab === "announcements" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-900">Announcements</h2>
              {isLeader && (
                <Button size="sm" onClick={() => setShowAnnouncModal(true)}>
                  <Plus size={15} /> Post Announcement
                </Button>
              )}
            </div>
            {announcements.length === 0 ? (
              <Card><CardBody className="text-center py-12">
                <Megaphone size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No announcements yet</p>
                {isLeader && <Button size="sm" className="mt-3" onClick={() => setShowAnnouncModal(true)}>Post First Announcement</Button>}
              </CardBody></Card>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <Card key={a.id}>
                    <CardBody>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Megaphone size={16} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 mb-1">{a.title}</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{a.content}</p>
                          <p className="text-xs text-slate-400 mt-2">Posted by {a.creatorName} • {timeAgo(a.createdAt)}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <div className="space-y-4">
          <Input label="Task Title" placeholder="e.g., Setup database schema" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} required />
          <TextArea label="Description" placeholder="Task details..." value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          <Select
            label="Assign To"
            value={taskForm.assignedToId}
            onChange={(e) => setTaskForm((p) => ({ ...p, assignedToId: e.target.value }))}
            placeholder="Select member"
            options={members.filter(m => m.userId).map((m) => ({ value: m.userId!, label: m.name || "Unknown" }))}
          />
          <Select label="Priority" value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
            options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
          <Input label="Deadline" type="date" value={taskForm.deadline} onChange={(e) => setTaskForm((p) => ({ ...p, deadline: e.target.value }))} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={createTask}>Create Task</Button>
          </div>
        </div>
      </Modal>

      {/* Announcement Modal */}
      <Modal isOpen={showAnnouncModal} onClose={() => setShowAnnouncModal(false)} title="Post Announcement">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g., Team meeting tomorrow" value={announcForm.title} onChange={(e) => setAnnouncForm((p) => ({ ...p, title: e.target.value }))} required />
          <TextArea label="Content" placeholder="Announcement details..." value={announcForm.content} onChange={(e) => setAnnouncForm((p) => ({ ...p, content: e.target.value }))} rows={4} required />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAnnouncModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={createAnnouncement}>Post Announcement</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
