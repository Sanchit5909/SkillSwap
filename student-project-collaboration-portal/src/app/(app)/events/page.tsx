"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Users, Clock, ExternalLink, CheckCircle } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location: string | null;
  category: string | null;
  maxParticipants: number | null;
  registrationLink: string | null;
  creatorName: string | null;
  isRegistered: boolean;
  registrationCount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  hackathon: "bg-red-100 text-red-700",
  workshop: "bg-blue-100 text-blue-700",
  showcase: "bg-purple-100 text-purple-700",
  general: "bg-slate-100 text-slate-700",
};

export default function EventsPage() {
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isRegistered: data.registered, registrationCount: e.registrationCount + (data.registered ? 1 : -1) }
            : e
        )
      );
      toast.success(data.registered ? "Registered for event!" : "Unregistered from event");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegistering(null);
    }
  };

  const upcoming = events.filter((e) => new Date(e.eventDate) >= new Date());
  const past = events.filter((e) => new Date(e.eventDate) < new Date());

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={24} className="text-indigo-600" /> Events
          </h1>
          <p className="text-slate-500 mt-1">Discover hackathons, workshops, and college events</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 spinner" /></div>
        ) : events.length === 0 ? (
          <Card>
            <CardBody className="text-center py-16">
              <Calendar size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">No events available</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-indigo-600" /> Upcoming Events ({upcoming.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {upcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={handleRegister}
                      isRegistering={registering === event.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="font-semibold text-slate-500 mb-4">Past Events ({past.length})</h2>
                <div className="grid md:grid-cols-2 gap-4 opacity-70">
                  {past.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRegister={handleRegister}
                      isRegistering={registering === event.id}
                      isPast
                    />
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

function EventCard({ event, onRegister, isRegistering, isPast = false }: {
  event: Event;
  onRegister: (id: string) => void;
  isRegistering: boolean;
  isPast?: boolean;
}) {
  const categoryColor = CATEGORY_COLORS[event.category || "general"] || CATEGORY_COLORS.general;
  const isUpcoming = new Date(event.eventDate) >= new Date();

  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">{event.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor}`}>
              {event.category || "Event"}
            </span>
          </div>
          {event.isRegistered && (
            <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} className="text-indigo-400" />
            <span>{formatDateTime(event.eventDate)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={14} className="text-indigo-400" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users size={14} className="text-indigo-400" />
            <span>
              {event.registrationCount} registered
              {event.maxParticipants && ` / ${event.maxParticipants} max`}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {!isPast && (
            <Button
              variant={event.isRegistered ? "outline" : "primary"}
              size="sm"
              className="flex-1"
              onClick={() => onRegister(event.id)}
              loading={isRegistering}
            >
              {event.isRegistered ? "✓ Registered (Unregister)" : "Register Now"}
            </Button>
          )}
          {event.registrationLink && (
            <a href={event.registrationLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink size={14} />
              </Button>
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
