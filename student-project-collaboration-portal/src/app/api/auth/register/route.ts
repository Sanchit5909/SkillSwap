import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { cookies } from "next/headers";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().optional(),
  year: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check existing user
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const [user] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
        department: data.department,
        year: data.year,
        role: "student",
        skills: [],
        interests: [],
      })
      .returning();

    // Welcome notification
    await db.insert(notifications).values({
      userId: user.id,
      type: "general",
      title: "Welcome to Project Link!",
      message: "Complete your profile to start collaborating with other students.",
      link: "/profile/setup",
    });

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role || "student",
      name: user.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodErr = error as z.ZodError;
      return NextResponse.json({ error: zodErr.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
