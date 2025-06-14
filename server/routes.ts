import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTutorialSchema, insertAppSchema } from "@shared/schema";
// Removed multer configuration - now using S3 URLs directly

export async function registerRoutes(app: Express): Promise<Server> {
  let ADMIN_KEY = process.env.ADMIN_KEY || "16!^109a";

  // Middleware to verify admin authentication
  const verifyAdmin = (req: any, res: any, next: any) => {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: "관리자 인증이 필요합니다." });
    }
    next();
  };

  // Serve attached assets
  app.use('/assets', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static("./attached_assets"));

  // Auth endpoints
  app.post('/api/auth/admin', (req, res) => {
    const { adminKey } = req.body;
    if (adminKey === ADMIN_KEY) {
      res.json({ success: true, message: "관리자 인증이 완료되었습니다." });
    } else {
      res.status(401).json({ success: false, message: "올바르지 않은 관리자 키입니다." });
    }
  });

  // Change admin password
  app.post('/api/auth/admin/change-password', verifyAdmin, (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "새 비밀번호는 최소 6자 이상이어야 합니다." });
    }
    ADMIN_KEY = newPassword;
    res.json({ success: true, message: "관리자 비밀번호가 성공적으로 변경되었습니다." });
  });

  // Tutorial endpoints
  app.get('/api/tutorials', async (req, res) => {
    try {
      const category = req.query.category as string;
      const tutorials = await storage.getTutorials(category, true); // Only published tutorials
      res.json(tutorials);
    } catch (error) {
      res.status(500).json({ message: "튜토리얼을 불러오는 중 오류가 발생했습니다." });
    }
  });

  // Admin endpoint to get all tutorials (including unpublished)
  app.get('/api/admin/tutorials', verifyAdmin, async (req, res) => {
    try {
      const category = req.query.category as string;
      const tutorials = await storage.getTutorials(category, false); // All tutorials
      res.json(tutorials);
    } catch (error) {
      res.status(500).json({ message: "튜토리얼을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.get('/api/tutorials/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tutorial = await storage.getTutorial(id);
      if (!tutorial) {
        return res.status(404).json({ message: "튜토리얼을 찾을 수 없습니다." });
      }
      
      // Increment view count
      await storage.incrementTutorialViews(id);
      
      res.json(tutorial);
    } catch (error) {
      res.status(500).json({ message: "튜토리얼을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/tutorials', verifyAdmin, async (req, res) => {
    try {
      const tutorialData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        difficulty: req.body.difficulty,
        duration: parseInt(req.body.duration) || 0,
        videoUrl: req.body.videoUrl, // S3 URL from client
        thumbnailUrl: req.body.thumbnailUrl, // Optional S3 thumbnail URL
        subtitleUrl: req.body.subtitleUrl, // Optional S3 subtitle URL
      };

      const validatedData = insertTutorialSchema.parse(tutorialData);
      const tutorial = await storage.createTutorial(validatedData);
      res.json(tutorial);
    } catch (error) {
      res.status(400).json({ message: "튜토리얼 생성 중 오류가 발생했습니다." });
    }
  });

  app.put('/api/tutorials/:id', verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTutorialSchema.partial().parse(req.body);
      const tutorial = await storage.updateTutorial(id, validatedData);
      
      if (!tutorial) {
        return res.status(404).json({ message: "튜토리얼을 찾을 수 없습니다." });
      }
      
      res.json(tutorial);
    } catch (error) {
      res.status(400).json({ message: "튜토리얼 수정 중 오류가 발생했습니다." });
    }
  });

  app.patch('/api/tutorials/:id', verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTutorialSchema.partial().parse(req.body);
      const tutorial = await storage.updateTutorial(id, validatedData);
      
      if (!tutorial) {
        return res.status(404).json({ message: "튜토리얼을 찾을 수 없습니다." });
      }
      
      res.json(tutorial);
    } catch (error) {
      res.status(400).json({ message: "튜토리얼 수정 중 오류가 발생했습니다." });
    }
  });

  app.delete('/api/tutorials/:id', verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTutorial(id);
      
      if (!success) {
        return res.status(404).json({ message: "튜토리얼을 찾을 수 없습니다." });
      }
      
      res.json({ message: "튜토리얼이 삭제되었습니다." });
    } catch (error) {
      res.status(500).json({ message: "튜토리얼 삭제 중 오류가 발생했습니다." });
    }
  });

  // App Gallery endpoints
  app.get('/api/apps', async (req, res) => {
    try {
      const category = req.query.category as string;
      const apps = await storage.getApps(category);
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "앱 갤러리를 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.get('/api/apps/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const app = await storage.getApp(id);
      if (!app) {
        return res.status(404).json({ message: "앱을 찾을 수 없습니다." });
      }
      res.json(app);
    } catch (error) {
      res.status(500).json({ message: "앱을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/apps', verifyAdmin, async (req, res) => {
    try {
      const appData = {
        name: req.body.name,
        description: req.body.description,
        partyrockLink: req.body.partyrockLink,
        category: req.body.category,
        difficulty: req.body.difficulty,
        useCase: req.body.useCase,
        screenshotUrl: req.body.screenshotUrl, // S3 URL from client
      };

      const validatedData = insertAppSchema.parse(appData);
      const app = await storage.createApp(validatedData);
      res.json(app);
    } catch (error) {
      res.status(400).json({ message: "앱 생성 중 오류가 발생했습니다." });
    }
  });

  app.put('/api/apps/:id', verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAppSchema.partial().parse(req.body);
      const app = await storage.updateApp(id, validatedData);
      
      if (!app) {
        return res.status(404).json({ message: "앱을 찾을 수 없습니다." });
      }
      
      res.json(app);
    } catch (error) {
      res.status(400).json({ message: "앱 수정 중 오류가 발생했습니다." });
    }
  });

  app.delete('/api/apps/:id', verifyAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteApp(id);
      
      if (!success) {
        return res.status(404).json({ message: "앱을 찾을 수 없습니다." });
      }
      
      res.json({ message: "앱이 삭제되었습니다." });
    } catch (error) {
      res.status(500).json({ message: "앱 삭제 중 오류가 발생했습니다." });
    }
  });

  // Stats endpoint for admin dashboard
  app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
    try {
      const tutorials = await storage.getTutorials();
      const apps = await storage.getApps();
      
      const stats = {
        totalTutorials: tutorials.length,
        totalApps: apps.length,
        totalViews: tutorials.reduce((sum, tutorial) => sum + (tutorial.views || 0), 0),
        recentTutorials: tutorials.slice(0, 5),
        recentApps: apps.slice(0, 5),
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "통계 정보를 불러오는 중 오류가 발생했습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
