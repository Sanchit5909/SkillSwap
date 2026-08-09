import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { joinRequests, projects, notifications, projectMembers, groupMembers, groups, users } from "@/db/schema";
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
    const { message } = await req.json();

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.creatorId === session.id) {
      return NextResponse.json({ error: "Cannot request to join your own project" }, { status: 400 });
    }

    // Check existing member
    const [existingMember] = await db
      .select()
      .from(projectMembers)
      .where(and(eq(projectMembers.projectId, id), eq(projectMembers.userId, session.id)))
      .limit(1);

    if (existingMember) {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }

    // Check existing request
    const [existingRequest] = await db
      .select()
      .from(joinRequests)
      .where(and(eq(joinRequests.projectId, id), eq(joinRequests.userId, session.id)))
      .limit(1);

    if (existingRequest) {
      return NextResponse.json({ error: "Request already sent" }, { status: 400 });
    }

    const [request] = await db
      .insert(joinRequests)
      .values({
        projectId: id,
        userId: session.id,
        message: message || "",
        status: "pending",
      })
      .returning();

    // Notify project owner
    if (project.creatorId) {
      await db.insert(notifications).values({
        userId: project.creatorId,
        type: "join_request",
        title: "New Join Request",
        message: `${session.name} requested to join "${project.title}"`,
        link: `/projects/${id}/requests`,
      });
    }

    return NextResponse.json({ request }, { status: 201 });
  } catch (error) {
    console.error("Join request error:", error);
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const requests = await db
      .select({
        id: joinRequests.id,
        userId: joinRequests.userId,
        message: joinRequests.message,
        status: joinRequests.status,
        createdAt: joinRequests.createdAt,
        userName: users.name,
        userEmail: users.email,
        userImage: users.profileImage,
        userDept: users.department,
        userYear: users.year,
        userSkills: users.skills,
      })
      .from(joinRequests)
      .leftJoin(users, eq(joinRequests.userId, users.id))
      .where(eq(joinRequests.projectId, id));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Failed to get requests" }, { status: 500 });
  }
}
