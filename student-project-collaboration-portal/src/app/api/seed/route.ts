import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  users, projects, projectMembers, groups, groupMembers,
  tasks, events, notifications, questions, announcements
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Check if already seeded
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    // Create admin
    const adminPass = await hashPassword("admin123");
    const [admin] = await db.insert(users).values({
      name: "Admin User",
      email: "admin@projectlink.com",
      password: adminPass,
      role: "admin",
      department: "Administration",
      year: "Alumni",
      bio: "Platform administrator",
      skills: ["Management", "Administration"],
      interests: ["Technology", "Education"],
      profileComplete: true,
    }).returning();

    // Create students
    const studentPass = await hashPassword("student123");
    const studentData = [
      {
        name: "Alex Johnson",
        email: "alex@student.com",
        department: "Computer Science",
        year: "3rd Year",
        bio: "Passionate about full-stack development and AI. Looking to build impactful projects.",
        skills: ["React", "Node.js", "Python", "MongoDB", "Machine Learning"],
        interests: ["Web Development", "AI/ML", "Open Source"],
      },
      {
        name: "Priya Sharma",
        email: "priya@student.com",
        department: "Information Technology",
        year: "2nd Year",
        bio: "UI/UX enthusiast with a love for creating beautiful user interfaces.",
        skills: ["Figma", "React", "Tailwind CSS", "JavaScript", "UI/UX Design"],
        interests: ["App Development", "Design", "Web Development"],
      },
      {
        name: "Marcus Chen",
        email: "marcus@student.com",
        department: "Computer Science",
        year: "4th Year",
        bio: "Backend developer specializing in distributed systems and cloud architecture.",
        skills: ["Python", "Docker", "Kubernetes", "AWS", "PostgreSQL", "Go"],
        interests: ["Cloud Computing", "Cybersecurity", "Data Science"],
      },
      {
        name: "Fatima Al-Hassan",
        email: "fatima@student.com",
        department: "Electrical Engineering",
        year: "3rd Year",
        bio: "IoT enthusiast working on smart systems for campus infrastructure.",
        skills: ["C++", "Arduino", "Raspberry Pi", "Python", "MQTT"],
        interests: ["IoT", "Robotics", "Embedded Systems"],
      },
      {
        name: "Ryan Torres",
        email: "ryan@student.com",
        department: "Computer Science",
        year: "2nd Year",
        bio: "Mobile developer with experience in cross-platform apps.",
        skills: ["Flutter", "Dart", "Firebase", "React Native", "Kotlin"],
        interests: ["App Development", "Web Development", "Game Development"],
      },
    ];

    const createdStudents = [];
    for (const student of studentData) {
      const [s] = await db.insert(users).values({
        ...student,
        password: studentPass,
        role: "student",
        profileComplete: true,
      }).returning();
      createdStudents.push(s);
    }

    const [alex, priya, marcus, fatima, ryan] = createdStudents;

    // Create projects
    const projectData = [
      {
        title: "AI-Powered Study Assistant",
        description: "An intelligent study assistant that helps students understand complex topics, generates practice questions, and tracks learning progress using machine learning algorithms.",
        technologies: ["Python", "TensorFlow", "React", "FastAPI", "PostgreSQL"],
        domain: "AI/ML",
        department: "Computer Science",
        requiredSkills: ["Python", "Machine Learning", "React"],
        creatorId: alex.id,
        maxMembers: 4,
        status: "active" as const,
        approvalStatus: "approved" as const,
        deadline: new Date("2024-06-30"),
      },
      {
        title: "Campus Navigation App",
        description: "A mobile application that helps new students navigate the campus using AR overlays, real-time location tracking, and an interactive map with building information.",
        technologies: ["Flutter", "Google Maps API", "ARCore", "Node.js", "MongoDB"],
        domain: "App Development",
        department: "Information Technology",
        requiredSkills: ["Flutter", "Mobile Development", "API Integration"],
        creatorId: priya.id,
        maxMembers: 3,
        status: "active" as const,
        approvalStatus: "approved" as const,
        deadline: new Date("2024-05-15"),
      },
      {
        title: "Smart Campus IoT System",
        description: "An IoT-based system to monitor and control campus resources like lighting, temperature, and security using smart sensors and a centralized dashboard.",
        technologies: ["Arduino", "Raspberry Pi", "Python", "MQTT", "React", "InfluxDB"],
        domain: "IoT",
        department: "Electrical Engineering",
        requiredSkills: ["IoT", "Python", "C++", "Embedded Systems"],
        creatorId: fatima.id,
        maxMembers: 5,
        status: "active" as const,
        approvalStatus: "approved" as const,
        deadline: new Date("2024-07-30"),
      },
      {
        title: "Blockchain-Based Certificate Verification",
        description: "A decentralized platform for issuing and verifying academic certificates using blockchain technology, eliminating certificate fraud.",
        technologies: ["Solidity", "Ethereum", "React", "Web3.js", "Node.js", "IPFS"],
        domain: "Web Development",
        department: "Computer Science",
        requiredSkills: ["Blockchain", "Solidity", "JavaScript", "Smart Contracts"],
        creatorId: marcus.id,
        maxMembers: 4,
        status: "active" as const,
        approvalStatus: "approved" as const,
        deadline: new Date("2024-08-15"),
      },
      {
        title: "Student Mental Health Platform",
        description: "An anonymous platform providing mental health resources, counseling appointment booking, mood tracking, and community support for college students.",
        technologies: ["React", "Node.js", "Socket.IO", "PostgreSQL", "TensorFlow"],
        domain: "Web Development",
        department: "Computer Science",
        requiredSkills: ["React", "Node.js", "Psychology", "UI/UX Design"],
        creatorId: ryan.id,
        maxMembers: 4,
        status: "pending" as const,
        approvalStatus: "pending" as const,
        deadline: new Date("2024-09-01"),
      },
      {
        title: "Peer-to-Peer Tutoring Marketplace",
        description: "A platform connecting students who need help in specific subjects with peer tutors. Includes scheduling, video calls, and payment integration.",
        technologies: ["Next.js", "PostgreSQL", "Stripe", "WebRTC", "Redis"],
        domain: "Web Development",
        department: "Information Technology",
        requiredSkills: ["React", "Node.js", "WebRTC", "Payment Integration"],
        creatorId: alex.id,
        maxMembers: 3,
        status: "active" as const,
        approvalStatus: "approved" as const,
        deadline: new Date("2024-10-01"),
      },
    ];

    const createdProjects = [];
    for (const proj of projectData) {
      const [p] = await db.insert(projects).values(proj).returning();
      createdProjects.push(p);
      // Add creator as member
      await db.insert(projectMembers).values({ projectId: p.id, userId: proj.creatorId, role: "owner" });
    }

    const [aiProject, navApp, iotProject, blockchainProject, mentalHealth, tutoring] = createdProjects;

    // Add members to projects
    await db.insert(projectMembers).values({ projectId: aiProject.id, userId: priya.id, role: "member" });
    await db.insert(projectMembers).values({ projectId: aiProject.id, userId: marcus.id, role: "member" });
    await db.insert(projectMembers).values({ projectId: navApp.id, userId: ryan.id, role: "member" });
    await db.insert(projectMembers).values({ projectId: iotProject.id, userId: marcus.id, role: "member" });
    await db.insert(projectMembers).values({ projectId: blockchainProject.id, userId: alex.id, role: "member" });
    await db.insert(projectMembers).values({ projectId: tutoring.id, userId: priya.id, role: "member" });

    // Create groups
    const [aiGroup] = await db.insert(groups).values({
      name: "AI Study Assistant Team",
      projectId: aiProject.id,
      leaderId: alex.id,
      description: "Building the next-gen AI study tool",
    }).returning();

    await db.insert(groupMembers).values([
      { groupId: aiGroup.id, userId: alex.id, role: "leader" },
      { groupId: aiGroup.id, userId: priya.id, role: "member" },
      { groupId: aiGroup.id, userId: marcus.id, role: "member" },
    ]);

    const [navGroup] = await db.insert(groups).values({
      name: "Campus Nav Crew",
      projectId: navApp.id,
      leaderId: priya.id,
      description: "AR-based campus navigation team",
    }).returning();

    await db.insert(groupMembers).values([
      { groupId: navGroup.id, userId: priya.id, role: "leader" },
      { groupId: navGroup.id, userId: ryan.id, role: "member" },
    ]);

    // Create tasks
    const taskData = [
      { title: "Setup ML model architecture", description: "Design and implement the base neural network model for question generation", assignedToId: alex.id, groupId: aiGroup.id, projectId: aiProject.id, status: "completed" as const, priority: "high" as const, createdById: alex.id },
      { title: "Build React dashboard UI", description: "Create the student dashboard with progress tracking components", assignedToId: priya.id, groupId: aiGroup.id, projectId: aiProject.id, status: "in_progress" as const, priority: "high" as const, createdById: alex.id },
      { title: "Integrate FastAPI backend", description: "Connect the ML model to the REST API endpoints", assignedToId: marcus.id, groupId: aiGroup.id, projectId: aiProject.id, status: "in_progress" as const, priority: "medium" as const, createdById: alex.id },
      { title: "Write unit tests", description: "Add comprehensive test coverage for all API endpoints", assignedToId: alex.id, groupId: aiGroup.id, projectId: aiProject.id, status: "todo" as const, priority: "medium" as const, createdById: alex.id },
      { title: "Design AR overlay UI", description: "Create Figma mockups for campus navigation AR interface", assignedToId: priya.id, groupId: navGroup.id, projectId: navApp.id, status: "completed" as const, priority: "high" as const, createdById: priya.id },
      { title: "Implement Google Maps integration", description: "Integrate Google Maps API with custom campus overlays", assignedToId: ryan.id, groupId: navGroup.id, projectId: navApp.id, status: "in_progress" as const, priority: "high" as const, createdById: priya.id },
    ];

    for (const task of taskData) {
      await db.insert(tasks).values({ ...task, deadline: new Date("2024-05-30") });
    }

    // Create announcements
    await db.insert(announcements).values([
      {
        groupId: aiGroup.id,
        title: "Project Meeting Tomorrow",
        content: "Team meeting scheduled for tomorrow at 10 AM in the CS Lab. We'll review the ML model progress and plan next sprint.",
        createdById: alex.id,
      },
      {
        groupId: aiGroup.id,
        title: "Phase 1 Complete! 🎉",
        content: "Great work everyone! We have completed Phase 1 of the project. The ML model is working with 89% accuracy. Let's keep up the momentum!",
        createdById: alex.id,
      },
      {
        groupId: navGroup.id,
        title: "ARCore Setup Required",
        content: "Please make sure you have Android Studio installed with ARCore SDK. We'll start AR development next week.",
        createdById: priya.id,
      },
    ]);

    // Create events
    const eventData = [
      {
        title: "HackFest 2024 - 48-Hour Hackathon",
        description: "Annual college hackathon! Form teams of 2-4, build an innovative solution, and compete for prizes worth ₹1,00,000. Open to all students.",
        eventDate: new Date("2024-04-15"),
        location: "Main Auditorium, Block A",
        category: "hackathon",
        maxParticipants: 200,
        createdById: admin.id,
      },
      {
        title: "Web Development Workshop - React & Next.js",
        description: "Hands-on workshop covering modern web development with React and Next.js. Perfect for beginners and intermediate developers.",
        eventDate: new Date("2024-03-20"),
        location: "CS Lab 3, Floor 2",
        category: "workshop",
        maxParticipants: 50,
        createdById: admin.id,
      },
      {
        title: "Project Showcase Day 2024",
        description: "Annual project showcase where students present their semester projects to faculty, industry professionals, and potential recruiters.",
        eventDate: new Date("2024-05-10"),
        location: "Exhibition Hall, Block B",
        category: "showcase",
        maxParticipants: 500,
        createdById: admin.id,
      },
      {
        title: "AI & Machine Learning Bootcamp",
        description: "3-day intensive bootcamp on AI and Machine Learning fundamentals, practical implementation, and industry applications.",
        eventDate: new Date("2024-04-01"),
        location: "Online (Google Meet)",
        category: "workshop",
        maxParticipants: 100,
        createdById: admin.id,
      },
    ];

    for (const event of eventData) {
      await db.insert(events).values(event);
    }

    // Create sample questions
    const questionData = [
      { userId: alex.id, question: "How do I implement JWT authentication in Node.js?", answer: "Use the jsonwebtoken library to sign and verify tokens...", subject: "Web Development" },
      { userId: priya.id, question: "What is the best way to manage state in React?", answer: "For small apps use useState and useContext. For large apps consider Redux or Zustand...", subject: "Web Development" },
      { userId: marcus.id, question: "How do I connect to PostgreSQL from Python?", answer: "Use the psycopg2 or SQLAlchemy library...", subject: "Database" },
    ];

    for (const q of questionData) {
      await db.insert(questions).values(q);
    }

    // Create notifications for users
    await db.insert(notifications).values([
      { userId: alex.id, type: "general", title: "Welcome to Project Link!", message: "Start exploring projects and finding teammates.", link: "/dashboard" },
      { userId: priya.id, type: "task_assigned", title: "New Task Assigned", message: "You've been assigned: Build React dashboard UI", link: `/groups/${aiGroup.id}` },
      { userId: marcus.id, type: "new_member", title: "New Group Member", message: "You joined AI Study Assistant Team", link: `/groups/${aiGroup.id}` },
    ]);

    return NextResponse.json({
      message: "Seeded successfully!",
      credentials: {
        admin: { email: "admin@projectlink.com", password: "admin123" },
        student: { email: "alex@student.com", password: "student123" },
      }
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
