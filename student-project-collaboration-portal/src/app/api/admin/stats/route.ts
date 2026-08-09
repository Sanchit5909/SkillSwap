import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, projects, groups, events, feedback } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [studentCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "student"));

    const [projectCount] = await db
      .select({ count: count() })
      .from(projects);

    const [groupCount] = await db
      .select({ count: count() })
      .from(groups);

    const [pendingProjects] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.approvalStatus, "pending"));

    const [eventCount] = await db
      .select({ count: count() })
      .from(events);

    const [pendingFeedback] = await db
      .select({ count: count() })
      .from(feedback)
      .where(eq(feedback.status, "pending"));

    return NextResponse.json({
      stats: {
        totalStudents: studentCount?.count || 0,
        totalProjects: projectCount?.count || 0,
        activeGroups: groupCount?.count || 0,
        pendingProjects: pendingProjects?.count || 0,
        totalEvents: eventCount?.count || 0,
        pendingFeedback: pendingFeedback?.count || 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
