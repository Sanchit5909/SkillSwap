import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectMembers, joinRequests, notifications, groups, groupMembers, tasks } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // My projects (created)
    const myProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.creatorId, session.id));

    // Projects joined (as member, not creator)
    const joinedMemberships = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, session.id));

    const allProjectIds = joinedMemberships.map((m) => m.projectId).filter(Boolean) as string[];
    const myProjectIds = myProjects.map((p) => p.id);
    const joinedProjectIds = allProjectIds.filter((id) => !myProjectIds.includes(id));

    // Pending requests (on my projects)
    let pendingRequests = 0;
    for (const proj of myProjects) {
      const reqs = await db
        .select()
        .from(joinRequests)
        .where(and(eq(joinRequests.projectId, proj.id), eq(joinRequests.status, "pending")));
      pendingRequests += reqs.length;
    }

    // Unread notifications
    const unreadNotifs = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, session.id), eq(notifications.isRead, false)));

    // My groups
    const myGroups = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.userId, session.id));

    // My tasks
    const myTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, session.id));

    const todoTasks = myTasks.filter((t) => t.status === "todo");
    const inProgressTasks = myTasks.filter((t) => t.status === "in_progress");
    const completedTasks = myTasks.filter((t) => t.status === "completed");

    return NextResponse.json({
      stats: {
        myProjectsCount: myProjects.length,
        joinedProjectsCount: joinedProjectIds.length,
        pendingRequestsCount: pendingRequests,
        unreadNotificationsCount: unreadNotifs.length,
        myGroupsCount: myGroups.length,
        totalTasksCount: myTasks.length,
        todoTasksCount: todoTasks.length,
        inProgressTasksCount: inProgressTasks.length,
        completedTasksCount: completedTasks.length,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
