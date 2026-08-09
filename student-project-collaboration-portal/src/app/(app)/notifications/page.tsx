"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { timeAgo } from "@/lib/utils";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  join_request: "👋",
  request_accepted: "✅",
  request_rejected: "❌",
  new_member: "👥",
  new_message: "💬",
  new_announcement: "📢",
  task_assigned: "📋",
  task_completed: "🎉",
  project_approved: "🚀",
  project_rejected: "❌",
  event_reminder: "📅",
  general: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarking(false);
  };

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Bell size={22} className="text-indigo-600" /> Notifications
            </h1>
            <p className="text-slate-500 mt-1">{unread.length} unread notification{unread.length !== 1 ? "s" : ""}</p>
          </div>
          {unread.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} loading={marking}>
              <CheckCheck size={15} /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 spinner" /></div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <Bell size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">All Caught Up!</h3>
              <p className="text-slate-400 text-sm">No notifications yet. Start collaborating to receive updates.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border transition-colors ${
                  notif.isRead ? "border-slate-100" : "border-indigo-100 bg-indigo-50/30"
                }`}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className={`text-xl flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                    notif.isRead ? "bg-slate-100" : "bg-indigo-100"
                  }`}>
                    <span>{TYPE_ICONS[notif.type] || "🔔"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mt-1.5 font-medium"
                      >
                        View details <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
