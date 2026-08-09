import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groups, groupMembers, users, projects, tasks, announcements, projectFiles, messages } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

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

    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        projectId: groups.projectId,
        leaderId: groups.leaderId,
        description: groups.description,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .where(eq(groups.id, id))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const members = await db
      .select({
        id: groupMembers.id,
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        name: users.name,
        email: users.email,
        profileImage: users.profileImage,
        department: users.department,
        skills: users.skills,
      })
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, id));

    const isMember = members.some((m) => m.userId === session.id);
    if (!isMember && session.role !== "admin") {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
    }

    const [project] = group.projectId
      ? await db.select().from(projects).where(eq(projects.id, group.projectId)).limit(1)
      : [null];

    const groupTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        deadline: tasks.deadline,
        assignedToId: tasks.assignedToId,
        createdAt: tasks.createdAt,
        assigneeName: users.name,
        assigneeImage: users.profileImage,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedToId, users.id))
      .where(eq(tasks.groupId, id));

    const groupAnnouncements = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        createdAt: announcements.createdAt,
        createdById: announcements.createdById,
        creatorName: users.name,
      })
      .from(announcements)
      .leftJoin(users, eq(announcements.createdById, users.id))
      .where(eq(announcements.groupId, id))
      .orderBy(desc(announcements.createdAt));

    const files = await db
      .select({
        id: projectFiles.id,
        fileName: projectFiles.fileName,
        fileUrl: projectFiles.fileUrl,
        fileType: projectFiles.fileType,
        fileSize: projectFiles.fileSize,
        createdAt: projectFiles.createdAt,
        uploadedById: projectFiles.uploadedById,
        uploaderName: users.name,
      })
      .from(projectFiles)
      .leftJoin(users, eq(projectFiles.uploadedById, users.id))
      .where(eq(projectFiles.groupId, id));

    const recentMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderImage: users.profileImage,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.groupId, id))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    return NextResponse.json({
      group,
      project,
      members,
      tasks: groupTasks,
      announcements: groupAnnouncements,
      files,
      messages: recentMessages.reverse(),
    });
  } catch (error) {
    console.error("Get group error:", error);
    return NextResponse.json({ error: "Failed to get group" }, { status: 500 });
  }
}
