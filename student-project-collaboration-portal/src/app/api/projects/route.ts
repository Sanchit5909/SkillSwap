import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectMembers, users, notifications } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, ilike, or, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const domain = searchParams.get("domain") || "";
    const department = searchParams.get("department") || "";
    const myProjects = searchParams.get("mine") === "true";
    const joined = searchParams.get("joined") === "true";
    const status = searchParams.get("status") || "";
    const approvalStatus = searchParams.get("approvalStatus") || "";

    let allProjects = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        technologies: projects.technologies,
        domain: projects.domain,
        department: projects.department,
        requiredSkills: projects.requiredSkills,
        creatorId: projects.creatorId,
        maxMembers: projects.maxMembers,
        deadline: projects.deadline,
        status: projects.status,
        approvalStatus: projects.approvalStatus,
        createdAt: projects.createdAt,
        creatorName: users.name,
        creatorImage: users.profileImage,
        creatorDept: users.department,
      })
      .from(projects)
      .leftJoin(users, eq(projects.creatorId, users.id));

    // Filter by my projects
    if (myProjects) {
      allProjects = allProjects.filter((p) => p.creatorId === session.id);
    }

    // Filter by joined projects
    if (joined) {
      const memberOf = await db
        .select({ projectId: projectMembers.projectId })
        .from(projectMembers)
        .where(eq(projectMembers.userId, session.id));
      const projectIds = memberOf.map((m) => m.projectId).filter(Boolean) as string[];
      allProjects = allProjects.filter(
        (p) => projectIds.includes(p.id) && p.creatorId !== session.id
      );
    }

    if (search) {
      allProjects = allProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (domain) {
      allProjects = allProjects.filter((p) => p.domain === domain);
    }

    if (department) {
      allProjects = allProjects.filter((p) => p.department === department);
    }

    if (status) {
      allProjects = allProjects.filter((p) => p.status === status);
    }

    if (approvalStatus) {
      allProjects = allProjects.filter((p) => p.approvalStatus === approvalStatus);
    }

    // Get member counts
    const projectsWithMembers = await Promise.all(
      allProjects.map(async (project) => {
        const members = await db
          .select({ userId: projectMembers.userId })
          .from(projectMembers)
          .where(eq(projectMembers.projectId, project.id));
        return { ...project, memberCount: members.length };
      })
    );

    return NextResponse.json({ projects: projectsWithMembers });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Failed to get projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      technologies,
      domain,
      department,
      requiredSkills,
      maxMembers,
      deadline,
      status,
    } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    const publishStatus = status === "published" ? "pending" : "draft";

    const [project] = await db
      .insert(projects)
      .values({
        title,
        description,
        technologies: technologies || [],
        domain,
        department,
        requiredSkills: requiredSkills || [],
        creatorId: session.id,
        maxMembers: maxMembers || 4,
        deadline: deadline ? new Date(deadline) : undefined,
        status: publishStatus,
        approvalStatus: publishStatus === "pending" ? "pending" : "pending",
      })
      .returning();

    // Add creator as member
    await db.insert(projectMembers).values({
      projectId: project.id,
      userId: session.id,
      role: "owner",
    });

    // Notify admin if pending approval
    if (publishStatus === "pending") {
      const admins = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "admin"));

      for (const admin of admins) {
        await db.insert(notifications).values({
          userId: admin.id,
          type: "general",
          title: "New Project Pending Approval",
          message: `"${title}" by ${session.name} requires approval.`,
          link: `/admin/projects`,
        });
      }
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
