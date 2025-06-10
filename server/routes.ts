import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTutorialSchema, insertAppSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const videoDir = path.join(uploadDir, "videos");
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }
    cb(null, videoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imageDir = path.join(uploadDir, "images");
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    cb(null, imageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadVideo = multer({ 
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4 and WebM videos are allowed.'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

const uploadImage = multer({ 
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const ADMIN_KEY = process.env.ADMIN_KEY || "nxtcloud-partyrock-admin";

  // Middleware to verify admin authentication
  const verifyAdmin = (req: any, res: any, next: any) => {
    const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
    if (adminKey !== ADMIN_KEY) {
      return res.status(401).json({ message: "관리자 인증이 필요합니다." });
    }
    next();
  };

  // Note: Videos now hosted on AWS S3, local uploads only for images/assets
  app.use('/uploads', express.static(uploadDir, {
    maxAge: '1y',
    etag: true,
    lastModified: true
  }));

  // Serve attached assets
  const attachedAssetsDir = path.join(process.cwd(), "attached_assets");
  app.use('/assets', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(attachedAssetsDir));



  // Debug endpoint to check file availability
  app.get('/api/debug/files', async (req, res) => {
    try {
      const uploadsPath = path.join(process.cwd(), 'uploads');
      const publicUploadsPath = path.join(process.cwd(), 'client/public/uploads');
      
      const checkDir = (dirPath: string) => {
        try {
          return fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
        } catch {
          return [];
        }
      };
      
      res.json({
        uploads: checkDir(uploadsPath),
        publicUploads: checkDir(publicUploadsPath),
        cwd: process.cwd(),
        env: process.env.NODE_ENV
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Auth endpoints
  app.post('/api/auth/admin', (req, res) => {
    const { adminKey } = req.body;
    if (adminKey === ADMIN_KEY) {
      res.json({ success: true, message: "관리자 인증이 완료되었습니다." });
    } else {
      res.status(401).json({ success: false, message: "올바르지 않은 관리자 키입니다." });
    }
  });

  // Tutorial endpoints
  app.get('/api/tutorials', async (req, res) => {
    try {
      const category = req.query.category as string;
      const tutorials = await storage.getTutorials(category);
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

  app.post('/api/tutorials', verifyAdmin, uploadVideo.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'subtitle', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const tutorialData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        difficulty: req.body.difficulty,
        duration: parseInt(req.body.duration) || 0,
        videoUrl: req.body.videoUrl, // Now expecting S3 URL from client
        thumbnailUrl: files.thumbnail ? `/uploads/images/${files.thumbnail[0].filename}` : null,
        subtitleUrl: files.subtitle ? `/uploads/subtitles/${files.subtitle[0].filename}` : null,
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

  app.post('/api/apps', verifyAdmin, uploadImage.single('screenshot'), async (req, res) => {
    try {
      const file = req.file;
      
      const appData = {
        name: req.body.name,
        description: req.body.description,
        partyrockLink: req.body.partyrockLink,
        category: req.body.category,
        difficulty: req.body.difficulty,
        useCase: req.body.useCase,
        screenshotUrl: file ? `/uploads/images/${file.filename}` : null,
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

  // Serve video files
  app.use('/uploads', express.static('uploads', {
    setHeaders: (res, path) => {
      if (path.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
      }
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
