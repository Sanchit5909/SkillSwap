import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, eventRegistrations, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allEvents = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        eventDate: events.eventDate,
        location: events.location,
        category: events.category,
        maxParticipants: events.maxParticipants,
        registrationLink: events.registrationLink,
        createdAt: events.createdAt,
        creatorName: users.name,
      })
      .from(events)
      .leftJoin(users, eq(events.createdById, users.id))
      .orderBy(desc(events.eventDate));

    // Check registrations
    const userRegistrations = await db
      .select({ eventId: eventRegistrations.eventId })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, session.id));

    const registeredIds = userRegistrations.map((r) => r.eventId);

    const eventsWithRegistration = await Promise.all(
      allEvents.map(async (event) => {
        const regCount = await db
          .select()
          .from(eventRegistrations)
          .where(eq(eventRegistrations.eventId, event.id));
        return {
          ...event,
          isRegistered: registeredIds.includes(event.id),
          registrationCount: regCount.length,
        };
      })
    );

    return NextResponse.json({ events: eventsWithRegistration });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json({ error: "Failed to get events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, eventDate, location, category, maxParticipants, registrationLink } = body;

    if (!title || !description || !eventDate) {
      return NextResponse.json({ error: "Title, description, and date required" }, { status: 400 });
    }

    const [event] = await db
      .insert(events)
      .values({
        title,
        description,
        eventDate: new Date(eventDate),
        location,
        category: category || "general",
        maxParticipants,
        registrationLink,
        createdById: session.id,
      })
      .returning();

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
