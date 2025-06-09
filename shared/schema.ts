import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  subtitleUrl: text("subtitle_url"),
  category: text("category").notNull(), // 기초, 응용, 고급
  difficulty: text("difficulty").notNull(), // 초급, 중급, 고급
  duration: integer("duration"), // in seconds
  views: integer("views").default(0),
  rating: integer("rating").default(0), // 1-5 scale * 10 (e.g., 48 = 4.8)
  createdAt: timestamp("created_at").defaultNow(),
});

export const appGallery = pgTable("app_gallery", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  screenshotUrl: text("screenshot_url"),
  partyrockLink: text("partyrock_link"),
  category: text("category").notNull(), // 교육, 비즈니스, 정부/공공
  difficulty: text("difficulty").notNull(), // 초급, 중급, 고급
  useCase: text("use_case"),
  rating: integer("rating").default(0), // 1-5 scale * 10 (e.g., 48 = 4.8)
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  tutorialId: integer("tutorial_id").references(() => tutorials.id),
  completed: boolean("completed").default(false),
  watchTime: integer("watch_time").default(0), // in seconds
  lastWatched: timestamp("last_watched").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));

export const tutorialsRelations = relations(tutorials, ({ many }) => ({
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  tutorial: one(tutorials, {
    fields: [userProgress.tutorialId],
    references: [tutorials.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTutorialSchema = createInsertSchema(tutorials).omit({
  id: true,
  createdAt: true,
  views: true,
  rating: true,
});

export const insertAppSchema = createInsertSchema(appGallery).omit({
  id: true,
  createdAt: true,
  rating: true,
  featured: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastWatched: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tutorial = typeof tutorials.$inferSelect;
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;
export type AppGalleryItem = typeof appGallery.$inferSelect;
export type InsertAppGalleryItem = z.infer<typeof insertAppSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
