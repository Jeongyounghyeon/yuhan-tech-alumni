# 데이터베이스

→ 상위 문서: [CLAUDE.md](../CLAUDE.md)

---

## 전체 Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ───────────────────────────────
// 인증 (NextAuth PrismaAdapter)
// ───────────────────────────────

enum UserStatus {
  PENDING   // 소셜 로그인 완료, 승인 대기
  APPROVED  // 관리자 승인 완료
  REJECTED  // 승인 거절
  ADMIN     // 관리자
}

model User {
  id             Int            @id @default(autoincrement())
  name           String
  email          String         @unique
  image          String?
  status         UserStatus     @default(PENDING)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  accounts       Account[]
  sessions       Session[]
  alumniProfile  AlumniProfile?
  notices        Notice[]
  posts          Post[]
  comments       Comment[]
  galleryPosts   GalleryPost[]
  events         Event[]
}

model Account {
  id                String  @id @default(cuid())
  userId            Int
  type              String
  provider          String
  providerAccountId String
  access_token      String? @db.Text
  refresh_token     String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       Int
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ───────────────────────────────
// 동문 프로필
// ───────────────────────────────

model AlumniProfile {
  id             Int     @id @default(autoincrement())
  graduationYear Int
  department     String
  phone          String
  bio            String? @db.VarChar(500)

  userId Int  @unique
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ───────────────────────────────
// 공지사항
// ───────────────────────────────

model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  content   String   @db.Text
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}

// ───────────────────────────────
// 자유게시판
// ───────────────────────────────

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String    @db.Text
  viewCount Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  authorId Int
  author   User      @relation(fields: [authorId], references: [id])
  comments Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())

  authorId Int
  author   User @relation(fields: [authorId], references: [id])
  postId   Int
  post     Post @relation(fields: [postId], references: [id], onDelete: Cascade)
}

// ───────────────────────────────
// 갤러리
// ───────────────────────────────

model GalleryPost {
  id        Int            @id @default(autoincrement())
  title     String
  content   String?        @db.Text
  viewCount Int            @default(0)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  authorId Int
  author   User           @relation(fields: [authorId], references: [id])
  images   GalleryImage[]
}

model GalleryImage {
  id    Int    @id @default(autoincrement())
  url   String
  order Int    @default(0)

  postId Int
  post   GalleryPost @relation(fields: [postId], references: [id], onDelete: Cascade)
}

// ───────────────────────────────
// 행사 일정
// ───────────────────────────────

model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?  @db.Text
  location    String?
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId Int
  author   User @relation(fields: [authorId], references: [id])
}

// ───────────────────────────────
// 임원진
// ───────────────────────────────

model Officer {
  id             Int      @id @default(autoincrement())
  name           String
  position       String
  graduationYear Int?
  photoUrl       String?
  order          Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// ───────────────────────────────
// 장학회
// ───────────────────────────────

model ScholarshipInfo {
  id          Int    @id @default(1)
  description String @db.Text
}

model Scholarship {
  id          Int      @id @default(autoincrement())
  name        String
  amount      String
  period      String
  description String?  @db.Text
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
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
User ──1:N──► Account (OAuth)
User ──1:N──► Session
```

---

## 설계 결정

| 결정 | 이유 |
|------|------|
| `User.status` enum 4단계 | PENDING/APPROVED 외 REJECTED, ADMIN 분리로 미들웨어 판단 단순화 |
| `AlumniProfile` 분리 | User(인증)와 동문 정보(도메인) 관심사 분리 |
| `GalleryImage.order` 필드 | 이미지 순서 변경 지원 |
| `Officer`에 User 관계 없음 | 임원진은 관리자가 직접 입력, 실제 유저 계정과 무관 |
| `ScholarshipInfo` id=1 고정 | 단일 레코드 설정값 패턴 (upsert로 관리) |

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
