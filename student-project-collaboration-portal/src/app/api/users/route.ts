import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { ilike, or, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    let allUsers;
    if (search) {
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          department: users.department,
          year: users.year,
          skills: users.skills,
          interests: users.interests,
          bio: users.bio,
          profileImage: users.profileImage,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.department, `%${search}%`)
          )
        )
        .limit(limit);
    } else {
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          department: users.department,
          year: users.year,
          skills: users.skills,
          interests: users.interests,
          bio: users.bio,
          profileImage: users.profileImage,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .limit(limit);
    }

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Failed to get users" }, { status: 500 });
  }
}
