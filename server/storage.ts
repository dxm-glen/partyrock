import { 
  users, 
  tutorials, 
  appGallery, 
  userProgress,
  type User, 
  type InsertUser,
  type Tutorial,
  type InsertTutorial,
  type AppGalleryItem,
  type InsertAppGalleryItem,
  type UserProgress,
  type InsertUserProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tutorial methods
  getTutorials(category?: string): Promise<Tutorial[]>;
  getTutorial(id: number): Promise<Tutorial | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial | undefined>;
  deleteTutorial(id: number): Promise<boolean>;
  incrementTutorialViews(id: number): Promise<void>;
  
  // App Gallery methods
  getApps(category?: string): Promise<AppGalleryItem[]>;
  getApp(id: number): Promise<AppGalleryItem | undefined>;
  createApp(app: InsertAppGalleryItem): Promise<AppGalleryItem>;
  updateApp(id: number, app: Partial<InsertAppGalleryItem>): Promise<AppGalleryItem | undefined>;
  deleteApp(id: number): Promise<boolean>;
  
  // User Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressForTutorial(userId: number, tutorialId: number): Promise<UserProgress | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Tutorial methods
  async getTutorials(category?: string): Promise<Tutorial[]> {
    if (category && category !== '전체') {
      return await db.select().from(tutorials)
        .where(eq(tutorials.category, category))
        .orderBy(desc(tutorials.createdAt));
    }
    return await db.select().from(tutorials).orderBy(desc(tutorials.createdAt));
  }

  async getTutorial(id: number): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, id));
    return tutorial || undefined;
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const [newTutorial] = await db
      .insert(tutorials)
      .values(tutorial)
      .returning();
    return newTutorial;
  }

  async updateTutorial(id: number, tutorial: Partial<InsertTutorial>): Promise<Tutorial | undefined> {
    const [updatedTutorial] = await db
      .update(tutorials)
      .set(tutorial)
      .where(eq(tutorials.id, id))
      .returning();
    return updatedTutorial || undefined;
  }

  async deleteTutorial(id: number): Promise<boolean> {
    const result = await db.delete(tutorials).where(eq(tutorials.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementTutorialViews(id: number): Promise<void> {
    const tutorial = await this.getTutorial(id);
    if (tutorial) {
      await db
        .update(tutorials)
        .set({ views: (tutorial.views || 0) + 1 })
        .where(eq(tutorials.id, id));
    }
  }

  // App Gallery methods
  async getApps(category?: string): Promise<AppGalleryItem[]> {
    if (category && category !== '전체') {
      return await db.select().from(appGallery)
        .where(eq(appGallery.category, category))
        .orderBy(desc(appGallery.createdAt));
    }
    return await db.select().from(appGallery).orderBy(desc(appGallery.createdAt));
  }

  async getApp(id: number): Promise<AppGalleryItem | undefined> {
    const [app] = await db.select().from(appGallery).where(eq(appGallery.id, id));
    return app || undefined;
  }

  async createApp(app: InsertAppGalleryItem): Promise<AppGalleryItem> {
    const [newApp] = await db
      .insert(appGallery)
      .values(app)
      .returning();
    return newApp;
  }

  async updateApp(id: number, app: Partial<InsertAppGalleryItem>): Promise<AppGalleryItem | undefined> {
    const [updatedApp] = await db
      .update(appGallery)
      .set(app)
      .where(eq(appGallery.id, id))
      .returning();
    return updatedApp || undefined;
  }

  async deleteApp(id: number): Promise<boolean> {
    const result = await db.delete(appGallery).where(eq(appGallery.id, id));
    return (result.rowCount || 0) > 0;
  }

  // User Progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserProgressForTutorial(progress.userId!, progress.tutorialId!);
    
    if (existing) {
      const [updated] = await db
        .update(userProgress)
        .set({
          completed: progress.completed,
          watchTime: progress.watchTime,
          lastWatched: new Date(),
        })
        .where(and(
          eq(userProgress.userId, progress.userId!),
          eq(userProgress.tutorialId, progress.tutorialId!)
        ))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(userProgress)
        .values(progress)
        .returning();
      return newProgress;
    }
  }

  async getUserProgressForTutorial(userId: number, tutorialId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(
        eq(userProgress.userId, userId),
        eq(userProgress.tutorialId, tutorialId)
      ));
    return progress || undefined;
  }
}

export const storage = new DatabaseStorage();
