import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { groupRecords } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const [record] = await db
      .select()
      .from(groupRecords)
      .where(eq(groupRecords.id, id))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    if (record.isFrozen && !body.isFrozen === false) {
      return NextResponse.json({ error: "Record is frozen and cannot be edited" }, { status: 400 });
    }

    const [updated] = await db
      .update(groupRecords)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(groupRecords.id, id))
      .returning();

    return NextResponse.json({ record: updated });
  } catch (error) {
    console.error("Update record error:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const [record] = await db
      .select()
      .from(groupRecords)
      .where(eq(groupRecords.id, id))
      .limit(1);

    if (record?.isFrozen) {
      return NextResponse.json({ error: "Cannot delete frozen record" }, { status: 400 });
    }

    await db.delete(groupRecords).where(eq(groupRecords.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete record error:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
