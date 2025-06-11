# 보안 가이드

AWS PartyRock 한국어 학습 플랫폼의 비디오 콘텐츠 보안 및 다운로드 방지 시스템에 대한 상세 가이드입니다.

## 📋 목차

- [보안 개요](#보안-개요)
- [클라이언트 측 보안](#클라이언트-측-보안)
- [서버 측 보안](#서버-측-보안)
- [브라우저 호환성](#브라우저-호환성)
- [보안 한계](#보안-한계)
- [문제 해결](#문제-해결)

## 🔒 보안 개요

### 목적
- 교육 콘텐츠의 무단 다운로드 방지
- 저작권 보호 및 콘텐츠 보안 강화
- 정상적인 학습 활동은 제한하지 않음

### 보안 레이어
1. **HTML5 비디오 속성 제어**
2. **CSS 기반 사용자 인터페이스 차단**
3. **JavaScript 이벤트 차단**
4. **서버 보안 헤더**

## 🎯 클라이언트 측 보안

### HTML5 비디오 속성

```html
<video 
  controlsList="nodownload noremoteplayback"
  onContextMenu={(e) => e.preventDefault()}
  onDragStart={(e) => e.preventDefault()}
>
```

**적용 효과:**
- `nodownload`: 브라우저 기본 다운로드 버튼 숨김
- `noremoteplayback`: 원격 재생 차단
- `onContextMenu`: 우클릭 메뉴 비활성화
- `onDragStart`: 드래그 앤 드롭 차단

### CSS 보안 규칙

```css
/* 다운로드 버튼 완전 숨김 */
video::-webkit-media-controls-download-button {
  display: none !important;
}

/* 사용자 선택 방지 */
video {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* 터치 콜아웃 방지 (모바일) */
video[controlsList="nodownload"] {
  -webkit-touch-callout: none;
}
```

### JavaScript 이벤트 차단

**키보드 단축키 방지:**
- `Ctrl+S`: 파일 저장 방지
- `F12`: 개발자 도구 열기 방지
- `Ctrl+Shift+I`: 개발자 도구 대체 방법 방지
- `Ctrl+U`: 소스 코드 보기 방지

**구현 코드:**
```javascript
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') e.preventDefault();
  if (e.key === 'F12') e.preventDefault();
  if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
  if (e.ctrlKey && e.key === 'u') e.preventDefault();
});
```

## 🛡️ 서버 측 보안

### 보안 헤더 설정

```javascript
// 비디오 파일 캐싱 방지
if (req.path.match(/\.(mp4|webm|mov)$/i)) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Content-Disposition', 'inline; filename=""');
}

// 기본 보안 헤더
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-XSS-Protection', '1; mode=block');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

**헤더 설명:**
- `Cache-Control`: 비디오 캐싱 완전 방지
- `Content-Disposition`: 인라인 재생 강제, 다운로드 방지
- `X-Frame-Options`: iframe 임베딩 방지
- `X-Content-Type-Options`: MIME 타입 스니핑 방지

### AWS S3 보안 설정

**버킷 정책 (읽기 전용):**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::partyrock-guide-nxtcloud/*"
        }
    ]
}
```

**CORS 설정:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "x-amz-meta-custom-header"]
    }
]
```

## 🌐 브라우저 호환성

### 지원 브라우저
| 브라우저 | 버전 | 다운로드 방지 | 우클릭 차단 | 키보드 차단 |
|---------|------|-------------|------------|------------|
| Chrome | 60+ | ✅ | ✅ | ✅ |
| Firefox | 55+ | ✅ | ✅ | ✅ |
| Safari | 11+ | ✅ | ✅ | ✅ |
| Edge | 79+ | ✅ | ✅ | ✅ |

### 모바일 지원
- **iOS Safari**: 터치 콜아웃 방지
- **Android Chrome**: 길게 누르기 방지
- **모바일 Firefox**: 컨텍스트 메뉴 차단

## ⚠️ 보안 한계

### 기술적 한계
1. **브라우저 개발자 도구**: 완전 차단 불가능
2. **네트워크 탭**: HTTP 요청 모니터링 가능
3. **스크린 레코딩**: 화면 녹화 소프트웨어 사용 가능
4. **모바일 스크린샷**: 운영체제 레벨 캡처

### 우회 가능한 방법
- 브라우저 확장 프로그램
- 외부 다운로드 소프트웨어
- 네트워크 패킷 캡처
- 가상 머신 환경

### 권장 추가 보안
1. **DRM (Digital Rights Management)**: 상용 솔루션 고려
2. **워터마킹**: 사용자 식별 정보 삽입
3. **세션 기반 접근 제어**: 로그인 필수
4. **IP 기반 제한**: 특정 지역/기관만 접근

## 🔧 문제 해결

### 일반적인 문제

**Q: 비디오가 재생되지 않아요**
A: 브라우저 새로고침 후 다시 시도하세요. 보안 설정이 과도할 경우 일부 브라우저에서 재생이 제한될 수 있습니다.

**Q: 전체화면이 작동하지 않아요**
A: 보안 정책으로 인해 일부 기능이 제한될 수 있습니다. F11 키 대신 비디오 컨트롤의 전체화면 버튼을 사용하세요.

**Q: 키보드 단축키가 막혀있어요**
A: 콘텐츠 보호를 위해 의도적으로 차단된 기능입니다. 정상적인 학습에는 영향을 주지 않습니다.

### 개발자 문제 해결

**보안 설정 비활성화 (개발 환경):**
```javascript
// 개발 모드에서만 보안 비활성화
if (process.env.NODE_ENV === 'development') {
  // 키보드 이벤트 리스너 제거
  // 우클릭 방지 해제
}
```

**테스트 방법:**
1. 다양한 브라우저에서 우클릭 테스트
2. 키보드 단축키 동작 확인
3. 개발자 도구 접근 시도
4. 비디오 다운로드 버튼 확인

## 📊 보안 모니터링

### 로그 수집
- 비정상적인 네트워크 요청 패턴
- 반복적인 비디오 액세스
- 개발자 도구 사용 시도

### 분석 지표
- 비디오 완료율
- 평균 시청 시간
- 이탈 구간 분석
- 사용자 행동 패턴

---

**주의사항**: 이 보안 시스템은 일반적인 사용자의 무단 다운로드를 방지하는 수준입니다. 전문적인 기술 지식을 가진 사용자는 우회할 수 있으므로, 중요한 콘텐츠의 경우 추가적인 보안 조치를 고려해야 합니다.