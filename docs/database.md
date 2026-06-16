# 데이터베이스

→ 상위 문서: [CLAUDE.md](../CLAUDE.md)

---

## 전체 Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ───────────────────────────────
// 인증 (Credentials + JWT)
// ───────────────────────────────

enum UserStatus {
  PENDING   // 회원가입 완료, 승인 대기
  APPROVED  // 관리자 승인 완료
  REJECTED  // 승인 거절
}

model User {
  id              Int        @id @default(autoincrement())
  name            String
  email           String     @unique
  image           String?
  password        String?    // bcrypt hash (cost 12)
  status          UserStatus @default(PENDING)
  isAdmin         Boolean    @default(false) @map("is_admin")
  rejectionReason String?    @map("rejection_reason")
  createdAt       DateTime   @default(now()) @map("created_at")
  updatedAt       DateTime   @updatedAt @map("updated_at")

  alumniProfile AlumniProfile?
  notices       Notice[]
  posts         Post[]
  comments      Comment[]
  galleryPosts  GalleryPost[]
  events        Event[]

  @@map("users")
}

// ───────────────────────────────
// 동문 프로필
// ───────────────────────────────

model AlumniProfile {
  id             Int     @id @default(autoincrement())
  graduationYear Int     @map("graduation_year")
  department     String  @map("department")  // 필수
  phone          String? @map("phone")        // 선택

  userId Int  @unique @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("alumni_profiles")
}

// ───────────────────────────────
// 공지사항
// ───────────────────────────────

model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  viewCount Int      @default(0) @map("view_count")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  authorId Int  @map("author_id")
  author   User @relation(fields: [authorId], references: [id])

  @@map("notices")
}

// ───────────────────────────────
// 자유게시판
// ───────────────────────────────

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  viewCount Int      @default(0) @map("view_count")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  authorId Int       @map("author_id")
  author   User      @relation(fields: [authorId], references: [id])
  comments Comment[]

  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  authorId Int  @map("author_id")
  author   User @relation(fields: [authorId], references: [id])
  postId   Int  @map("post_id")
  post     Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("comments")
}

// ───────────────────────────────
// 갤러리
// ───────────────────────────────

model GalleryPost {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?  @db.Text
  viewCount Int      @default(0) @map("view_count")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  authorId Int          @map("author_id")
  author   User         @relation(fields: [authorId], references: [id])
  images   GalleryImage[]

  @@map("gallery_posts")
}

model GalleryImage {
  id    Int    @id @default(autoincrement())
  url   String
  order Int    @default(0)

  postId Int         @map("post_id")
  post   GalleryPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("gallery_images")
}

// ───────────────────────────────
// 행사 일정
// ───────────────────────────────

model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  location    String?
  startDate   DateTime @map("start_date")
  endDate     DateTime @map("end_date")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  authorId Int  @map("author_id")
  author   User @relation(fields: [authorId], references: [id])

  @@map("events")
}

// ───────────────────────────────
// 임원진
// ───────────────────────────────

model Officer {
  id             Int      @id @default(autoincrement())
  name           String
  position       String
  graduationYear Int?     @map("graduation_year")
  photoUrl       String?  @map("photo_url")
  order          Int      @default(0)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  @@map("officers")
}

// ───────────────────────────────
// 장학회
// ───────────────────────────────

model Scholarship {
  id          Int      @id @default(autoincrement())
  name        String
  amount      String
  period      String
  description String?  @db.Text
  order       Int      @default(0)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("scholarships")
}
```

---

## 모델 관계 요약

```
User ──1:1──► AlumniProfile
User ──1:N──► Notice
User ──1:N──► Post ──1:N──► Comment
User ──1:N──► GalleryPost ──1:N──► GalleryImage
User ──1:N──► Event
```

---

## 설계 결정

| 결정 | 이유 |
|------|------|
| `User.status` enum 3단계 + `isAdmin` 분리 | 인증 상태(PENDING/APPROVED/REJECTED)와 관리자 권한(`isAdmin`)을 별도 필드로 관리 |
| `User.password` nullable | OAuth 추가 시 소셜 로그인 유저는 password 없음 |
| `AlumniProfile` 분리 | User(인증)와 동문 정보(도메인) 관심사 분리 |
| `AlumniProfile.phone` nullable | 회원가입 필수 항목 최소화, 이후 프로필 수정에서 추가 가능 |
| OAuth 테이블 없음 | 현재 Credentials 전용, JWT 세션 → Account/Session/VerificationToken 불필요 |
| `ScholarshipInfo` 테이블 없음 | 소개 텍스트는 변경 빈도가 낮아 코드 상수로 관리 |
| `GalleryImage.order` 필드 | 이미지 순서 변경 지원 |
| `Officer`에 User 관계 없음 | 임원진은 관리자가 직접 입력, 실제 유저 계정과 무관 |
| snake_case DB 컬럼 | `@map` / `@@map` 으로 Prisma camelCase ↔ DB snake_case 매핑 |

---

## 마이그레이션 규칙

- 개발 중: `pnpm prisma db push` (빠른 반복, 마이그레이션 파일 생성 안 함)
- 스테이징/프로덕션 배포 전: `pnpm prisma migrate dev --name <설명>` 으로 마이그레이션 파일 생성
- 컬럼 삭제/타입 변경 시 반드시 팀원 공유 후 진행

---

## Prisma 클라이언트 사용

```ts
// lib/prisma.ts — 싱글턴 패턴 (Next.js 핫리로드 대응)
// Prisma v7: 드라이버 어댑터 방식 (@prisma/adapter-pg)
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

> Prisma v7부터 `new PrismaClient()` 직접 생성 대신 드라이버 어댑터 필수.  
> 생성된 클라이언트는 `app/generated/prisma/client`에 위치 (`.gitignore` 포함, 빌드 시 재생성).
