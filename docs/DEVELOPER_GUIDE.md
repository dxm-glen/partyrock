# 개발자 가이드

AWS PartyRock 한국어 학습 플랫폼 개발을 위한 상세 가이드입니다.

## 📋 목차

- [개발 환경 설정](#개발-환경-설정)
- [아키텍처 개요](#아키텍처-개요)
- [프론트엔드 개발](#프론트엔드-개발)
- [백엔드 개발](#백엔드-개발)
- [데이터베이스 설계](#데이터베이스-설계)
- [API 설계](#api-설계)
- [배포 가이드](#배포-가이드)
- [테스팅](#테스팅)
- [코딩 컨벤션](#코딩-컨벤션)

## 🛠️ 개발 환경 설정

### 필수 요구사항
- Node.js 18.x 이상
- PostgreSQL 14.x 이상
- npm 또는 yarn

### 로컬 개발 환경 구축

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd partyrock-korea-platform

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# DATABASE_URL, ADMIN_KEY 등 설정

# 4. 데이터베이스 설정
npm run db:push

# 5. 개발 서버 실행
npm run dev
```

### 개발 도구 설정

#### VS Code 확장 프로그램
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### ESLint 설정 (.eslintrc.js)
```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
```

## 🏗️ 아키텍처 개요

### 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • Components    │    │ • REST API      │    │ • Users         │
│ • Pages         │    │ • File Upload   │    │ • Tutorials     │
│ • Hooks         │    │ • Auth          │    │ • Apps          │
│ • State Mgmt    │    │ • Validation    │    │ • Progress      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 기술 스택 선택 이유

**Frontend (React + TypeScript)**
- 컴포넌트 재사용성과 유지보수성
- TypeScript로 런타임 오류 방지
- React Query로 서버 상태 관리 최적화

**Backend (Express + Drizzle)**
- 빠른 개발과 유연한 라우팅
- TypeScript 네이티브 ORM으로 타입 안정성
- PostgreSQL과의 원활한 연동

**Database (PostgreSQL)**
- 관계형 데이터 구조에 최적
- 확장성과 성능 우수
- 복잡한 쿼리 지원

## 🎨 프론트엔드 개발

### 프로젝트 구조
```
client/src/
├── components/          # 재사용 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── TutorialCard.tsx
│   ├── VideoUpload.tsx
│   └── Header.tsx
├── pages/              # 페이지 컴포넌트
│   └── home.tsx
├── hooks/              # 커스텀 훅
│   └── use-toast.ts
├── lib/                # 유틸리티
│   ├── queryClient.ts
│   ├── utils.ts
│   └── constants.ts
└── index.css           # 글로벌 스타일
```

### 컴포넌트 개발 가이드

#### 1. 타입 정의
```typescript
interface TutorialCardProps {
  tutorial: Tutorial;
  onPlay?: (id: number) => void;
}
```

#### 2. 컴포넌트 구현
```typescript
export default function TutorialCard({ tutorial, onPlay }: TutorialCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* 컴포넌트 내용 */}
    </Card>
  );
}
```

#### 3. 스타일링 (Tailwind CSS)
```typescript
// 조건부 스타일링
const buttonClass = cn(
  "px-4 py-2 rounded-lg",
  isActive ? "bg-blue-500 text-white" : "bg-gray-200"
);
```

### 상태 관리

#### React Query 사용
```typescript
// 데이터 페칭
const { data: tutorials, isLoading } = useQuery({
  queryKey: ['/api/tutorials'],
  enabled: true,
});

// 뮤테이션
const createMutation = useMutation({
  mutationFn: async (data: FormData) => {
    return apiRequest("POST", "/api/tutorials", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['/api/tutorials']);
  }
});
```

#### 로컬 상태 관리
```typescript
// useState 활용
const [activeTab, setActiveTab] = useState("home");
const [isModalOpen, setIsModalOpen] = useState(false);
```

### 라우팅 (Wouter)
```typescript
import { Route, Switch } from "wouter";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tutorials/:id" component={TutorialDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}
```

## 🔧 백엔드 개발

### API 라우트 구조
```
server/
├── routes.ts           # 메인 라우트 파일
├── storage.ts          # 데이터베이스 로직
├── db.ts              # 데이터베이스 연결
└── index.ts           # 서버 엔트리포인트
```

### 라우트 개발 패턴

#### 1. 기본 CRUD 패턴
```typescript
// GET - 목록 조회
app.get('/api/tutorials', async (req, res) => {
  try {
    const category = req.query.category as string;
    const tutorials = await storage.getTutorials(category);
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// POST - 생성
app.post('/api/tutorials', verifyAdmin, async (req, res) => {
  try {
    const validatedData = insertTutorialSchema.parse(req.body);
    const tutorial = await storage.createTutorial(validatedData);
    res.json(tutorial);
  } catch (error) {
    res.status(400).json({ message: "잘못된 데이터" });
  }
});
```

#### 2. 파일 업로드 처리
```typescript
const uploadVideo = multer({
  storage: multer.diskStorage({
    destination: 'uploads/videos',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});
```

#### 3. 인증 미들웨어
```typescript
const verifyAdmin = (req: any, res: any, next: any) => {
  const adminKey = req.headers['x-admin-key'] || req.body.adminKey;
  if (adminKey !== ADMIN_KEY) {
    return res.status(401).json({ message: "인증 실패" });
  }
  next();
};
```

### 데이터 검증 (Zod)
```typescript
import { z } from 'zod';

const tutorialSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['가입 및 로그인 안내', '위젯 및 제작 실습', '데모 확인']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});
```

## 🗃️ 데이터베이스 설계

### 스키마 정의 (Drizzle)
```typescript
// shared/schema.ts
export const tutorials = pgTable("tutorials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  duration: integer("duration"), // 초 단위
  views: integer("views").default(0),
  rating: integer("rating").default(0), // 1-5 * 10
  createdAt: timestamp("created_at").defaultNow(),
});
```

### 관계 정의
```typescript
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
```

### 마이그레이션
```bash
# 스키마 변경 후 실행
npm run db:push

# 개발용 데이터베이스 브라우저
npm run db:studio
```

## 🌐 API 설계

### REST API 엔드포인트

#### 튜토리얼 관련
```
GET    /api/tutorials              # 튜토리얼 목록
GET    /api/tutorials/:id          # 특정 튜토리얼 조회
POST   /api/tutorials              # 튜토리얼 생성 (관리자)
PUT    /api/tutorials/:id          # 튜토리얼 수정 (관리자)
DELETE /api/tutorials/:id          # 튜토리얼 삭제 (관리자)
```

#### 앱 갤러리 관련
```
GET    /api/apps                   # 앱 목록
POST   /api/apps                   # 앱 등록 (관리자)
PUT    /api/apps/:id               # 앱 수정 (관리자)
DELETE /api/apps/:id               # 앱 삭제 (관리자)
```

#### 관리자 관련
```
POST   /api/auth/admin             # 관리자 인증
GET    /api/admin/stats            # 통계 조회 (관리자)
```

### 응답 형식
```typescript
// 성공 응답
{
  "data": { /* 데이터 */ },
  "message": "성공"
}

// 오류 응답
{
  "error": "오류 메시지",
  "code": "ERROR_CODE"
}
```

## 🚀 배포 가이드

### Replit 배포
1. **환경 변수 설정**
   ```
   DATABASE_URL=postgresql://...
   ADMIN_KEY=nxtcloud-partyrock-admin
   ```

2. **빌드 스크립트 확인**
   ```json
   {
     "scripts": {
       "build": "vite build",
       "start": "npm run dev"
     }
   }
   ```

3. **Deploy 버튼 클릭**

### 프로덕션 최적화
- 번들 크기 최적화
- 이미지 압축
- CDN 활용
- 캐싱 전략

## 🧪 테스팅

### 단위 테스트
```typescript
// 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import TutorialCard from './TutorialCard';

test('renders tutorial title', () => {
  const tutorial = { id: 1, title: 'Test Tutorial' };
  render(<TutorialCard tutorial={tutorial} />);
  expect(screen.getByText('Test Tutorial')).toBeInTheDocument();
});
```

### API 테스트
```typescript
// API 엔드포인트 테스트
describe('GET /api/tutorials', () => {
  it('should return tutorials list', async () => {
    const response = await request(app).get('/api/tutorials');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

## 📝 코딩 컨벤션

### 파일 명명 규칙
- 컴포넌트: `PascalCase.tsx`
- 훅: `use-kebab-case.ts`
- 유틸리티: `kebab-case.ts`
- 페이지: `lowercase.tsx`

### 변수 명명 규칙
```typescript
// 컴포넌트 props
interface ComponentProps {
  isActive: boolean;          // boolean은 is/has/can 접두사
  onButtonClick: () => void;  // 이벤트 핸들러는 on 접두사
  userList: User[];          // 배열은 복수형
}

// 상수
const API_ENDPOINTS = {
  TUTORIALS: '/api/tutorials',
  APPS: '/api/apps'
};
```

### 코드 구조
```typescript
// 1. Import 순서
import React from 'react';           // 외부 라이브러리
import { Button } from '@/components/ui/button';  // 내부 컴포넌트
import { ApiRequest } from '@/lib/api';           // 내부 유틸리티

// 2. 타입 정의
interface Props {
  // ...
}

// 3. 컴포넌트 구현
export default function Component({ prop1, prop2 }: Props) {
  // 4. 상태 관리
  const [state, setState] = useState();
  
  // 5. 이펙트
  useEffect(() => {
    // ...
  }, []);
  
  // 6. 이벤트 핸들러
  const handleClick = () => {
    // ...
  };
  
  // 7. 렌더링
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Git 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 등

예시: feat: 튜토리얼 비디오 업로드 기능 추가
```

## 🔍 디버깅 가이드

### 개발자 도구 활용
1. **Network 탭**: API 요청/응답 확인
2. **Console**: JavaScript 오류 확인
3. **Application**: 로컬 스토리지 상태 확인

### 로그 출력
```typescript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### 일반적인 문제 해결
- **CORS 오류**: 서버 설정 확인
- **404 오류**: 라우트 경로 확인
- **인증 실패**: 관리자 키 확인
- **파일 업로드 실패**: Multer 설정 및 파일 크기 확인

---

이 가이드는 지속적으로 업데이트되며, 새로운 기능 추가 시 해당 섹션도 함께 업데이트됩니다.