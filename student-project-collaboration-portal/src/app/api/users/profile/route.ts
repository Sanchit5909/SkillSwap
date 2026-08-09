import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      department,
      year,
      skills,
      interests,
      bio,
      profileImage,
    } = body;

    const isComplete = !!(name && department && year && skills?.length > 0);

    const [updated] = await db
      .update(users)
      .set({
        name: name || undefined,
        department: department || undefined,
        year: year || undefined,
        skills: skills || undefined,
        interests: interests || undefined,
        bio: bio || undefined,
        profileImage: profileImage || undefined,
        profileComplete: isComplete,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id))
      .returning();

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
