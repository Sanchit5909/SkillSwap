import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements, groupMembers, notifications, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 });
    }

    const [announcement] = await db
      .insert(announcements)
      .values({
        groupId: id,
        title,
        content,
        createdById: session.id,
      })
      .returning();

    // Notify all members
    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id));

    for (const member of members) {
      if (member.userId && member.userId !== session.id) {
        await db.insert(notifications).values({
          userId: member.userId,
          type: "new_announcement",
          title: "New Announcement",
          message: `${session.name}: ${title}`,
          link: `/groups/${id}`,
        });
      }
    }

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
