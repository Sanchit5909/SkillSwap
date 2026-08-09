import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groupRecords, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await db
      .select({
        id: groupRecords.id,
        groupName: groupRecords.groupName,
        projectName: groupRecords.projectName,
        members: groupRecords.members,
        status: groupRecords.status,
        isFrozen: groupRecords.isFrozen,
        createdAt: groupRecords.createdAt,
        updatedAt: groupRecords.updatedAt,
        creatorName: users.name,
      })
      .from(groupRecords)
      .leftJoin(users, eq(groupRecords.createdById, users.id))
      .orderBy(desc(groupRecords.createdAt));

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Get records error:", error);
    return NextResponse.json({ error: "Failed to get records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { groupName, projectName, members, status } = await req.json();

    if (!groupName || !projectName) {
      return NextResponse.json({ error: "Group name and project name required" }, { status: 400 });
    }

    const [record] = await db
      .insert(groupRecords)
      .values({
        groupName,
        projectName,
        members: members || [],
        status: status || "active",
        isFrozen: false,
        createdById: session.id,
      })
      .returning();

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Create record error:", error);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
