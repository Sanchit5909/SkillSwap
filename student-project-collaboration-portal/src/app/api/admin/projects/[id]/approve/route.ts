import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, notifications } from "@/db/schema";
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
    const { action, reason } = await req.json(); // "approve" or "reject"

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isApproved = action === "approve";

    const [updated] = await db
      .update(projects)
      .set({
        approvalStatus: isApproved ? "approved" : "rejected",
        status: isApproved ? "active" : "rejected",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    // Notify project creator
    if (project.creatorId) {
      await db.insert(notifications).values({
        userId: project.creatorId,
        type: isApproved ? "project_approved" : "project_rejected",
        title: isApproved ? "Project Approved!" : "Project Not Approved",
        message: isApproved
          ? `Your project "${project.title}" has been approved and is now live!`
          : `Your project "${project.title}" was not approved. ${reason || ""}`,
        link: `/projects/${id}`,
      });
    }

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Admin approve error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
