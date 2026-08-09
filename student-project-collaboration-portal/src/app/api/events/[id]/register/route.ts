import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eventRegistrations } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [existing] = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, session.id)))
      .limit(1);

    if (existing) {
      // Unregister
      await db
        .delete(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, session.id)));
      return NextResponse.json({ registered: false });
    }

    await db.insert(eventRegistrations).values({
      eventId: id,
      userId: session.id,
    });

    return NextResponse.json({ registered: true });
  } catch (error) {
    console.error("Register event error:", error);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
