import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { joinRequests, projects, notifications, projectMembers, groupMembers, groups } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, requestId } = await params;
    const { action } = await req.json(); // "accept" or "reject"

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project || project.creatorId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [request] = await db
      .select()
      .from(joinRequests)
      .where(eq(joinRequests.id, requestId))
      .limit(1);

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "accept") {
      // Update request
      await db
        .update(joinRequests)
        .set({ status: "accepted", updatedAt: new Date() })
        .where(eq(joinRequests.id, requestId));

      // Add to project members
      const existingMember = await db
        .select()
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, request.userId!)))
        .limit(1);

      if (existingMember.length === 0) {
        await db.insert(projectMembers).values({
          projectId: id,
          userId: request.userId!,
          role: "member",
        });
      }

      // Add to project group if exists
      const [group] = await db
        .select()
        .from(groups)
        .where(eq(groups.projectId, id))
        .limit(1);

      if (group) {
        const existingGroupMember = await db
          .select()
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, group.id), eq(groupMembers.userId, request.userId!)))
          .limit(1);

        if (existingGroupMember.length === 0) {
          await db.insert(groupMembers).values({
            groupId: group.id,
            userId: request.userId!,
            role: "member",
          });
        }
      }

      // Notify student
      if (request.userId) {
        await db.insert(notifications).values({
          userId: request.userId,
          type: "request_accepted",
          title: "Join Request Accepted!",
          message: `Your request to join "${project.title}" was accepted. Welcome to the team!`,
          link: `/projects/${id}`,
        });
      }
    } else if (action === "reject") {
      await db
        .update(joinRequests)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(joinRequests.id, requestId));

      if (request.userId) {
        await db.insert(notifications).values({
          userId: request.userId,
          type: "request_rejected",
          title: "Join Request Not Accepted",
          message: `Your request to join "${project.title}" was not accepted at this time.`,
          link: `/projects`,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Handle request error:", error);
    return NextResponse.json({ error: "Failed to handle request" }, { status: 500 });
  }
}
