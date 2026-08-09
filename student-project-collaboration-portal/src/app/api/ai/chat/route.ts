import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, ilike } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, subject } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question required" }, { status: 400 });
    }

    let answer = "";
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.startsWith("sk-")) {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey });

        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are ProjectLink AI, a helpful assistant for college students working on projects. Help them with programming questions, project ideas, debugging, technology choices, and academic topics. Be concise, friendly, and practical.",
            },
            { role: "user", content: question },
          ],
          max_tokens: 1000,
        });

        answer = completion.choices[0]?.message?.content || "I could not generate a response.";
      } catch (aiError) {
        console.error("AI API error:", aiError);
        answer = getFallbackAnswer(question);
      }
    } else {
      answer = getFallbackAnswer(question);
    }

    // Save question to DB
    const [saved] = await db
      .insert(questions)
      .values({
        userId: session.id,
        question: question.trim(),
        answer,
        subject: subject || "General",
      })
      .returning();

    return NextResponse.json({ answer, questionId: saved.id });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject") || "";

    let allQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.userId, session.id))
      .orderBy(desc(questions.createdAt))
      .limit(50);

    if (search) {
      allQuestions = allQuestions.filter(
        (q) =>
          q.question.toLowerCase().includes(search.toLowerCase()) ||
          (q.answer && q.answer.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (subject) {
      allQuestions = allQuestions.filter((q) => q.subject === subject);
    }

    return NextResponse.json({ questions: allQuestions });
  } catch (error) {
    console.error("Get questions error:", error);
    return NextResponse.json({ error: "Failed to get questions" }, { status: 500 });
  }
}

function getFallbackAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("react") || q.includes("component") || q.includes("hooks")) {
    return `**React Development Tips:**\n\n1. **Component Structure**: Break your UI into small, reusable components\n2. **Hooks**: Use useState for local state, useEffect for side effects, useContext for shared state\n3. **Performance**: Use React.memo() for expensive components and useMemo/useCallback to optimize re-renders\n4. **Best Practices**: Keep components focused on one responsibility\n\nFor more help, check the official React docs at react.dev`;
  }

  if (q.includes("python") || q.includes("django") || q.includes("flask")) {
    return `**Python Project Tips:**\n\n1. **Virtual Environments**: Always use venv or conda to isolate dependencies\n2. **Django**: Great for full-featured web apps with ORM, admin panel, auth\n3. **Flask**: Lightweight, perfect for REST APIs and microservices\n4. **FastAPI**: Modern, fast, with automatic API docs\n\nTip: Use requirements.txt or pyproject.toml to manage dependencies`;
  }

  if (q.includes("database") || q.includes("sql") || q.includes("mongodb")) {
    return `**Database Design Tips:**\n\n1. **Relational (PostgreSQL/MySQL)**: Great for structured data with relationships\n2. **NoSQL (MongoDB)**: Flexible schema, good for unstructured data\n3. **Indexing**: Always index frequently queried columns\n4. **Normalization**: Avoid data duplication in relational databases\n\nFor college projects, PostgreSQL is highly recommended for learning industry standards`;
  }

  if (q.includes("project idea") || q.includes("what project")) {
    return `**College Project Ideas:**\n\n1. **Student Marketplace** - Buy/sell textbooks, notes\n2. **Study Group Finder** - Connect students by subject/interest\n3. **Campus Event Manager** - Track college events\n4. **Attendance Tracker** - QR-based attendance system\n5. **Placement Portal** - Job/internship aggregator for students\n6. **Lost & Found App** - Report lost items on campus\n7. **College Carpooling** - Rideshare app for students\n\nChoose based on a real problem you face at college!`;
  }

  if (q.includes("git") || q.includes("version control") || q.includes("github")) {
    return `**Git Best Practices for Team Projects:**\n\n1. **Branching**: Use feature branches (feature/login, fix/bug-123)\n2. **Commits**: Write descriptive commit messages\n3. **Pull Requests**: Always code review before merging to main\n4. **Git Flow**: main → develop → feature branches\n5. **Conflicts**: Communicate with teammates to avoid merge conflicts\n\nSetup: git clone → git checkout -b feature/your-feature → git add . → git commit -m "message" → git push`;
  }

  if (q.includes("api") || q.includes("rest") || q.includes("backend")) {
    return `**REST API Design Tips:**\n\n1. **Use HTTP Methods Correctly**: GET (read), POST (create), PUT (update), DELETE (remove)\n2. **Status Codes**: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error\n3. **Versioning**: Use /api/v1/ prefix\n4. **Authentication**: JWT tokens for stateless auth\n5. **Error Handling**: Always return consistent error format\n\nExample: GET /api/projects returns list, POST /api/projects creates new project`;
  }

  return `**Answer:**\n\nI'm ProjectLink AI, here to help with your college project questions!\n\n🔍 You asked: "${question}"\n\nI'm currently running in demo mode (AI API key not configured). Here are some suggestions:\n\n1. **Search Online**: Stack Overflow, MDN Docs, official documentation\n2. **Ask Teammates**: Use the group chat to collaborate\n3. **Check GitHub**: Look for open source examples\n4. **YouTube**: Many free tutorials for common topics\n\nTo enable full AI responses, add your OpenAI API key to the .env file.\n\n💡 Tip: Be specific in your questions for better answers!`;
}
