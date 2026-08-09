"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Check, X, Users, Clock } from "lucide-react";

interface Request {
  id: string;
  userId: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userImage: string | null;
  userDept: string | null;
  userYear: string | null;
  userSkills: string[] | null;
}

export default function ProjectRequestsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}/request`)
      .then((r) => r.json())
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    setProcessing(requestId);
    try {
      const res = await fetch(`/api/projects/${id}/request/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(action === "accept" ? "Request accepted!" : "Request rejected");
      // Update local state
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: action === "accept" ? "accepted" : "rejected" } : r))
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setProcessing(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Project
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Join Requests</h1>
          <p className="text-slate-500 text-sm">{pending.length} pending request{pending.length !== 1 ? "s" : ""}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><div className="w-8 h-8 spinner" /></div>
        ) : requests.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <Users size={48} className="text-slate-200 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No Requests Yet</h3>
              <p className="text-slate-400 text-sm">Students haven't applied to join your project yet.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-5">
            {pending.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-yellow-500" /> Pending ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((req) => (
                    <Card key={req.id}>
                      <CardBody>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <Avatar name={req.userName || "?"} image={req.userImage} size="md" />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900">{req.userName}</p>
                              <p className="text-xs text-slate-500">{req.userDept} • {req.userYear}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(req.userSkills || []).slice(0, 4).map((s) => (
                                  <Badge key={s} size="sm">{s}</Badge>
                                ))}
                              </div>
                              {req.message && (
                                <p className="text-sm text-slate-600 mt-2 bg-slate-50 rounded-lg p-3 italic">
                                  "{req.message}"
                                </p>
                              )}
                              <p className="text-xs text-slate-400 mt-2">{formatDate(req.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleAction(req.id, "reject")}
                              loading={processing === req.id}
                            >
                              <X size={14} />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(req.id, "accept")}
                              loading={processing === req.id}
                            >
                              <Check size={14} /> Accept
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {processed.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-900 mb-3">Processed ({processed.length})</h2>
                <div className="space-y-3">
                  {processed.map((req) => (
                    <Card key={req.id}>
                      <CardBody>
                        <div className="flex items-center gap-3">
                          <Avatar name={req.userName || "?"} image={req.userImage} size="sm" />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">{req.userName}</p>
                            <p className="text-xs text-slate-400">{req.userDept}</p>
                          </div>
                          <Badge variant={req.status === "accepted" ? "success" : "danger"}>
                            {req.status}
                          </Badge>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
