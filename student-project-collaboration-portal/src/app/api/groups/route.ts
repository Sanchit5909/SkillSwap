import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups, groupMembers, users, projects } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get groups where user is a member
    const memberGroups = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, session.id));

    const groupIds = memberGroups.map((g) => g.groupId).filter(Boolean) as string[];

    const allGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        projectId: groups.projectId,
        leaderId: groups.leaderId,
        description: groups.description,
        createdAt: groups.createdAt,
        projectTitle: projects.title,
        leaderName: users.name,
      })
      .from(groups)
      .leftJoin(projects, eq(groups.projectId, projects.id))
      .leftJoin(users, eq(groups.leaderId, users.id));

    const userGroups = allGroups.filter((g) => groupIds.includes(g.id));

    // Get member counts
    const groupsWithCounts = await Promise.all(
      userGroups.map(async (group) => {
        const members = await db
          .select()
          .from(groupMembers)
          .where(eq(groupMembers.groupId, group.id));
        return { ...group, memberCount: members.length };
      })
    );

    return NextResponse.json({ groups: groupsWithCounts });
  } catch (error) {
    console.error("Get groups error:", error);
    return NextResponse.json({ error: "Failed to get groups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, projectId, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Group name required" }, { status: 400 });
    }

    const [group] = await db
      .insert(groups)
      .values({
        name,
        projectId: projectId || null,
        leaderId: session.id,
        description,
      })
      .returning();

    // Add creator as leader
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: session.id,
      role: "leader",
    });

    // If project provided, add all project members
    if (projectId) {
      const { projectMembers: pm } = await import("@/db/schema");
      const projMembers = await db
        .select()
        .from(pm)
        .where(eq(pm.projectId, projectId));

      for (const member of projMembers) {
        if (member.userId && member.userId !== session.id) {
          await db.insert(groupMembers).values({
            groupId: group.id,
            userId: member.userId,
            role: "member",
          });
        }
      }
    }

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
