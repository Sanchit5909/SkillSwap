import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  json,
  pgEnum,
  serial,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "pending",
  "approved",
  "active",
  "completed",
  "rejected",
]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "completed",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "join_request",
  "request_accepted",
  "request_rejected",
  "new_member",
  "new_message",
  "new_announcement",
  "task_assigned",
  "task_completed",
  "project_approved",
  "project_rejected",
  "event_reminder",
  "general",
]);
export const feedbackStatusEnum = pgEnum("feedback_status", [
  "pending",
  "handled",
]);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  department: varchar("department", { length: 255 }),
  year: varchar("year", { length: 50 }),
  skills: json("skills").$type<string[]>().default([]),
  interests: json("interests").$type<string[]>().default([]),
  bio: text("bio"),
  profileImage: text("profile_image"),
  role: userRoleEnum("role").default("student"),
  isActive: boolean("is_active").default(true),
  profileComplete: boolean("profile_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  technologies: json("technologies").$type<string[]>().default([]),
  domain: varchar("domain", { length: 100 }),
  department: varchar("department", { length: 255 }),
  requiredSkills: json("required_skills").$type<string[]>().default([]),
  creatorId: uuid("creator_id").references(() => users.id),
  maxMembers: integer("max_members").default(4),
  deadline: timestamp("deadline"),
  status: projectStatusEnum("status").default("draft"),
  approvalStatus: approvalStatusEnum("approval_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project Members
export const projectMembers = pgTable("project_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  userId: uuid("user_id").references(() => users.id),
  role: varchar("role", { length: 100 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Join Requests
export const joinRequests = pgTable("join_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  userId: uuid("user_id").references(() => users.id),
  message: text("message"),
  status: requestStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Groups
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  projectId: uuid("project_id").references(() => projects.id),
  leaderId: uuid("leader_id").references(() => users.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Group Members
export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groups.id),
  userId: uuid("user_id").references(() => users.id),
  role: varchar("role", { length: 100 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  projectId: uuid("project_id").references(() => projects.id),
  groupId: uuid("group_id").references(() => groups.id),
  status: taskStatusEnum("status").default("todo"),
  priority: taskPriorityEnum("priority").default("medium"),
  deadline: timestamp("deadline"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groups.id),
  senderId: uuid("sender_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").references(() => groups.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  type: notificationTypeEnum("type").default("general"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: varchar("location", { length: 255 }),
  category: varchar("category", { length: 100 }).default("general"),
  maxParticipants: integer("max_participants"),
  registrationLink: text("registration_link"),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event Registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id),
  userId: uuid("user_id").references(() => users.id),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Feedback
export const feedback = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: feedbackStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions (AI Chatbot history)
export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  question: text("question").notNull(),
  answer: text("answer"),
  subject: varchar("subject", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Files
export const projectFiles = pgTable("project_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  groupId: uuid("group_id").references(() => groups.id),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 100 }),
  fileSize: integer("file_size"),
  publicId: text("public_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Excel/Group Records
export const groupRecords = pgTable("group_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupName: varchar("group_name", { length: 255 }).notNull(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  members: json("members").$type<string[]>().default([]),
  status: varchar("status", { length: 100 }).default("active"),
  isFrozen: boolean("is_frozen").default(false),
  createdById: uuid("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  projectMembers: many(projectMembers),
  groupMembers: many(groupMembers),
  tasks: many(tasks),
  messages: many(messages),
  notifications: many(notifications),
  joinRequests: many(joinRequests),
  questions: many(questions),
  feedback: many(feedback),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.creatorId], references: [users.id] }),
  members: many(projectMembers),
  joinRequests: many(joinRequests),
  tasks: many(tasks),
  files: many(projectFiles),
  groups: many(groups),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  project: one(projects, { fields: [groups.projectId], references: [projects.id] }),
  leader: one(users, { fields: [groups.leaderId], references: [users.id] }),
  members: many(groupMembers),
  messages: many(messages),
  announcements: many(announcements),
  tasks: many(tasks),
  files: many(projectFiles),
}));
