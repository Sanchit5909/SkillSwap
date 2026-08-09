import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, users, notifications, groups } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
    const body = await req.json();
    const { title, description, assignedToId, priority, deadline } = body;

    if (!title) {
      return NextResponse.json({ error: "Task title required" }, { status: 400 });
    }

    // Get group to find project
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);

    const [task] = await db
      .insert(tasks)
      .values({
        title,
        description,
        assignedToId: assignedToId || null,
        projectId: group?.projectId || null,
        groupId: id,
        status: "todo",
        priority: priority || "medium",
        deadline: deadline ? new Date(deadline) : null,
        createdById: session.id,
      })
      .returning();

    // Notify assigned user
    if (assignedToId && assignedToId !== session.id) {
      await db.insert(notifications).values({
        userId: assignedToId,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You've been assigned: "${title}"`,
        link: `/groups/${id}`,
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
