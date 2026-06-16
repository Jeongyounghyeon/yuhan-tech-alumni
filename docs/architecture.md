# 아키텍처

→ 상위 문서: [CLAUDE.md](../CLAUDE.md)

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16 (App Router) | React 19 |
| 언어 | TypeScript | strict 모드 |
| 스타일 | Tailwind CSS v4 + shadcn/ui | |
| 인증 | NextAuth.js v5 (Auth.js) | Credentials provider, JWT 세션, PrismaAdapter 없음 |
| ORM | Prisma v7 | `@prisma/adapter-pg` 드라이버 어댑터 방식 |
| DB | PostgreSQL 16 | Docker 컨테이너 |
| 이미지 스토리지 | Cloudflare R2 | presigned URL 방식 |
| 캘린더 UI | 커스텀 컴포넌트 | `EventsCalendar.tsx` 직접 구현 |
| 폰트 | Noto Sans KR + Noto Serif KR | next/font/google |
| 배포 | Docker Compose → 자체 서버 | |

---

## 디렉토리 구조

```
yuhan-tech-alumni/
├── app/                        # Next.js App Router
│   ├── (public)/               # 레이아웃 그룹: Header + Footer 포함
│   │   ├── layout.tsx          # 공통 Header + Footer
│   │   ├── page.tsx            # 홈 (/)
│   │   ├── notices/            # 공지사항
│   │   ├── board/              # 자유게시판
│   │   ├── alumni/             # 동문 명부 (APPROVED 전용)
│   │   ├── events/             # 행사 일정
│   │   ├── gallery/            # 갤러리
│   │   ├── officers/           # 임원진
│   │   ├── scholarship/        # 장학회
│   │   ├── login/              # 로그인
│   │   ├── register/           # 회원가입
│   │   └── pending/            # 승인 대기 안내
│   ├── admin/                  # 백오피스 (ADMIN 전용, 별도 레이아웃)
│   │   ├── layout.tsx          # 관리자 사이드바 레이아웃
│   │   ├── page.tsx            # 대시보드
│   │   ├── members/            # 회원 승인 관리
│   │   ├── notices/            # 공지사항 CRUD
│   │   ├── events/             # 행사 일정 CRUD
│   │   ├── officers/           # 임원진 CRUD
│   │   └── scholarships/       # 장학회 CRUD
│   ├── actions/                # Server Actions
│   │   ├── auth.ts             # register
│   │   ├── board.ts            # createPost, createComment
│   │   ├── admin.ts            # 관리자 CRUD 전체 (assertAdmin 공유)
│   │   └── gallery.ts          # 갤러리 CRUD + R2 이미지 삭제
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth 핸들러
│       └── gallery/upload/     # R2 presigned URL 발급 (관리자)
├── components/
│   ├── ui/                     # shadcn/ui 기본 컴포넌트 (수정 금지)
│   ├── layout/                 # Header, Footer
│   ├── admin/                  # AdminNav 등 관리자 전용 컴포넌트
│   ├── auth/                   # SignOutButton
│   └── features/               # 기능별 컴포넌트 (Pagination, EventsCalendar, GalleryForm)
├── lib/
│   ├── prisma.ts               # Prisma 클라이언트 싱글턴
│   ├── auth.ts                 # NextAuth 설정 (Credentials + JWT)
│   └── utils.ts                # cn(), formatDate() 등 유틸
├── prisma/
│   ├── schema.prisma           # 전체 스키마
│   └── seed.ts                 # 시드 데이터
├── types/
│   └── next-auth.d.ts          # Session 타입 확장
├── proxy.ts                    # 경로별 권한 가드 (Next.js 미들웨어)
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

세션은 JWT 기반(`strategy: "jwt"`). DB 세션 테이블 없음.  
JWT 콜백에서 매 요청마다 DB의 `status`를 재조회하여 관리자 상태 변경을 즉시 반영.  
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
