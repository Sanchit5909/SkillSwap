import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedback, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allFeedback = await db
      .select({
        id: feedback.id,
        subject: feedback.subject,
        message: feedback.message,
        status: feedback.status,
        createdAt: feedback.createdAt,
        userId: feedback.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .orderBy(desc(feedback.createdAt));

    return NextResponse.json({ feedback: allFeedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    return NextResponse.json({ error: "Failed to get feedback" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const [fb] = await db
      .insert(feedback)
      .values({
        userId: session.id,
        subject: subject || "General",
        message,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ feedback: fb }, { status: 201 });
  } catch (error) {
    console.error("Submit feedback error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
