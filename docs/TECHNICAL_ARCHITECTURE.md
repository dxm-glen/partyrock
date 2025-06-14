# Technical Architecture - Korean Language Learning Platform

## System Overview
Full-stack multimedia education platform built with React, Express, and PostgreSQL, featuring AWS S3 integration for video content delivery.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for development and building
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **React Query** for state management and caching
- **Wouter** for client-side routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** (Neon serverless)
- **Session-based authentication**
- **Express middleware** for security

### Infrastructure
- **AWS S3** for video storage and delivery
- **Neon PostgreSQL** for database hosting
- **Replit** for development and deployment

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE,
  email VARCHAR,
  password_hash VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tutorials Table
```sql
CREATE TABLE tutorials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  subtitle_url TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  duration INTEGER,
  views INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Progress Table
```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tutorial_id INTEGER REFERENCES tutorials(id),
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP DEFAULT NOW()
);
```

## API Architecture

### Authentication Layer
```typescript
// Admin authentication middleware
const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ message: "관리자 인증이 필요합니다." });
  }
  next();
};
```

### Route Structure
- `/api/auth/*` - Authentication endpoints
- `/api/tutorials/*` - Tutorial management
- `/api/admin/*` - Admin-only operations
- `/api/apps/*` - App gallery features

### Data Flow
1. Client requests → Express middleware
2. Authentication validation
3. Database query via Drizzle ORM
4. Response transformation
5. Client state update via React Query

## Frontend Architecture

### Component Hierarchy
```
App
├── Header
├── Router (Wouter)
│   ├── Home
│   ├── Tutorials
│   ├── Learning Center
│   ├── App Gallery
│   └── Admin Panel
│       ├── VideoUpload
│       ├── TutorialManagement
│       └── AdminPasswordChange
└── Modals
```

### State Management
- **React Query** for server state
- **useState** for local component state
- **Custom hooks** for reusable logic

### Security Implementation
```typescript
// Content protection
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F12' || 
        (e.ctrlKey && (e.key === 's' || e.key === 'u'))) {
      e.preventDefault();
    }
  };
  
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('contextmenu', handleContextMenu);
}, []);
```

## S3 Integration

### Bucket Configuration
- **Bucket**: `partyrock-guide-nxtcloud`
- **Region**: `ap-northeast-2` (Seoul)
- **Access**: Public read for video content
- **CORS**: Configured for web player access

### File Organization
```
partyrock-guide-nxtcloud/
├── videos/
│   ├── signup-guide.mp4
│   ├── practice.mp4
│   ├── demo.mp4
│   └── hands-on.mp4
├── thumbnails/
│   └── *.jpg
└── subtitles/
    └── *.vtt
```

### URL Structure
```
https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/[filename]
```

## Security Architecture

### Content Protection
1. **Client-side prevention**
   - Right-click blocking
   - Keyboard shortcut prevention
   - CSS content protection
   
2. **Server-side validation**
   - Admin authentication
   - Request validation
   - Rate limiting ready

3. **Database security**
   - Parameterized queries
   - Connection pooling
   - Environment variable protection

### Authentication Flow
```
Client → Admin Login → Server Validation → Session Creation → API Access
```

## Performance Optimizations

### Caching Strategy
- **React Query**: Automatic request caching
- **Browser caching**: Static assets cached
- **Database indexing**: Optimized queries

### Loading States
- Skeleton components during data fetch
- Progressive loading for video content
- Error boundaries for graceful failures

## Development Workflow

### Environment Setup
```bash
npm install          # Install dependencies
npm run db:push     # Update database schema
npm run dev         # Start development server
```

### Code Organization
```
├── client/src/
│   ├── components/    # Reusable UI components
│   ├── pages/        # Route components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utility functions
├── server/
│   ├── routes.ts     # API endpoints
│   ├── storage.ts    # Database operations
│   └── db.ts         # Database connection
└── shared/
    └── schema.ts     # Shared TypeScript types
```

### Build Process
1. TypeScript compilation
2. Vite bundling and optimization
3. Asset optimization
4. Production deployment

## Monitoring and Analytics

### Current Metrics
- Tutorial view counts
- User engagement tracking
- Admin activity logging
- Error tracking via console

### Future Enhancements
- Real-time analytics dashboard
- User behavior tracking
- Performance monitoring
- Automated alerting

## Deployment Architecture

### Production Environment
- **Hosting**: Replit deployment
- **Database**: Neon PostgreSQL cluster
- **CDN**: AWS S3 for static assets
- **SSL**: Automatic HTTPS via Replit

### Environment Variables
```
DATABASE_URL=postgresql://...
ADMIN_KEY=16!^109a
SESSION_SECRET=auto-generated
```

## Testing Strategy

### Manual Testing
- Admin authentication flow
- Tutorial CRUD operations
- Video playback functionality
- Security feature validation

### Automated Testing (Future)
- Unit tests for utilities
- Integration tests for API
- E2E tests for user flows
- Performance benchmarking

---
*Architecture documented: June 14, 2025*  
*Version: 2.1.0*