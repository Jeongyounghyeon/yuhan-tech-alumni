# 아키텍처

→ 상위 문서: [CLAUDE.md](../CLAUDE.md)

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | React 19 |
| 언어 | TypeScript | strict 모드 |
| 스타일 | Tailwind CSS v4 + shadcn/ui | |
| 인증 | NextAuth.js v5 (Auth.js) | PrismaAdapter |
| ORM | Prisma v7 | `@prisma/adapter-pg` 드라이버 어댑터 방식 |
| DB | PostgreSQL 16 | Docker 컨테이너 |
| 이미지 스토리지 | Cloudflare R2 | presigned URL 방식 |
| 캘린더 UI | @schedule-x/react | 행사 일정 페이지 전용 |
| 폰트 | Noto Sans KR + Noto Serif KR | next/font/google |
| 배포 | Docker Compose → 자체 서버 | |

---

## 디렉토리 구조

```
yuhan-tech-alumni/
├── app/                        # Next.js App Router
│   ├── (public)/               # 레이아웃 그룹: 공개 페이지
│   │   ├── layout.tsx          # 공통 Header + Footer
│   │   ├── page.tsx            # 홈 (/)
│   │   ├── notices/            # 공지사항
│   │   ├── board/              # 자유게시판
│   │   ├── events/             # 행사 일정
│   │   ├── gallery/            # 갤러리
│   │   ├── officers/           # 임원진
│   │   └── scholarship/        # 장학회
│   ├── (auth)/                 # 레이아웃 그룹: 인증 전용 레이아웃
│   │   ├── login/page.tsx      # 로그인
│   │   └── pending/page.tsx    # 승인 대기 안내
│   ├── (member)/               # 레이아웃 그룹: 로그인 동문 전용
│   │   └── alumni/             # 동문 명부
│   ├── admin/                  # 백오피스 (ADMIN 전용)
│   │   ├── layout.tsx          # 관리자 사이드바 레이아웃
│   │   ├── page.tsx            # 대시보드
│   │   ├── members/
│   │   ├── notices/
│   │   ├── posts/
│   │   ├── gallery/
│   │   ├── events/
│   │   ├── officers/
│   │   └── scholarship/
│   └── api/                    # Route Handlers
│       ├── auth/[...nextauth]/ # NextAuth 핸들러
│       ├── notices/
│       ├── posts/
│       ├── alumni/
│       ├── events/
│       ├── gallery/
│       ├── officers/
│       └── scholarship/
├── components/
│   ├── ui/                     # shadcn/ui 기본 컴포넌트 (수정 금지)
│   ├── layout/                 # Header, Footer, Sidebar
│   └── features/               # 기능별 컴포넌트
│       ├── notices/
│       ├── board/
│       ├── alumni/
│       ├── events/
│       ├── gallery/
│       └── admin/
├── lib/
│   ├── prisma.ts               # Prisma 클라이언트 싱글턴
│   ├── auth.ts                 # NextAuth 설정
│   ├── r2.ts                   # Cloudflare R2 클라이언트
│   └── utils.ts                # cn() 등 유틸
├── prisma/
│   ├── schema.prisma           # 전체 스키마
│   └── migrations/             # 마이그레이션 기록
├── middleware.ts               # 경로별 권한 가드
├── docs/                       # 기술 문서
├── specs/                      # 기능 스펙
├── .env.local                  # 로컬 환경변수 (git 제외)
├── docker-compose.yml          # 전체 스택
└── Dockerfile                  # Next.js 앱 이미지
```

---

## 렌더링 전략

| 페이지 | 전략 | 이유 |
|--------|------|------|
| 홈 | SSR (공지 미리보기 dynamic) | 최신 공지 반영 |
| 공지사항 목록/상세 | SSR | SEO + 최신 데이터 |
| 자유게시판 목록 | SSR | 최신 데이터 |
| 동문 명부 | SSR + 클라이언트 필터 | 인증 필요, 검색 UX |
| 행사 일정 | SSR + 클라이언트 월 이동 | 캘린더 인터랙션 |
| 갤러리 | SSR | SEO |
| 임원진 | SSG (revalidate) | 변경 빈도 낮음 |
| 장학회 | SSG (revalidate) | 변경 빈도 낮음 |
| /admin | SSR | 인증 + 실시간 데이터 |

---

## 인증 아키텍처

```
클라이언트 요청
    ↓
proxy.ts (경로별 권한 체크, Next.js 16 규칙)
    ↓ 통과
App Router Page (서버 컴포넌트)
    ↓ auth() 호출
세션 확인 → 필요 시 추가 권한 검사
    ↓
API Route Handler (이중 검증)
```

세션은 DB 기반(`strategy: "database"`).  
세션 객체에 `user.status`, `user.id` 포함.  
→ 상세: [인증 스펙](../specs/auth/spec.md)

---

## 이미지 업로드 아키텍처

```
클라이언트
  1. POST /api/gallery/upload → presigned URL 요청
  2. presigned URL로 R2에 직접 PUT (서버 경유 없음)
  3. R2 URL을 DB에 저장 요청
```

서버가 이미지 바이너리를 처리하지 않아 메모리 부담 없음.  
→ 상세: [갤러리 스펙](../specs/gallery/spec.md)

---

## Docker Compose 구성

```yaml
services:
  app:       # Next.js (포트 3000)
  db:        # PostgreSQL 16 (포트 5432)
```

프로덕션에서 R2는 외부 서비스이므로 컨테이너 불필요.
