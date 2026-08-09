import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, groupMembers, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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

    const allMessages = await db
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
      .limit(100);

    return NextResponse.json({ messages: allMessages.reverse() });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

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
    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Check member
    const [member] = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, id))
      .limit(1);

    const [msg] = await db
      .insert(messages)
      .values({
        groupId: id,
        senderId: session.id,
        content: content.trim(),
      })
      .returning();

    return NextResponse.json({ message: { ...msg, senderName: session.name } }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
