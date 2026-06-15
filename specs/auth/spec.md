# Spec: 인증 및 동문 가입 (Auth)

## 개요
소셜 로그인 기반 인증. 최초 로그인 시 PENDING 상태로 저장되며,  
관리자 승인 후 APPROVED 상태로 전환되어 동문 전용 기능을 사용할 수 있다.

---

## 인증 플로우

```
1. 소셜 로그인 (Google / Kakao / Naver)
2. 신규 유저: DB에 User 저장 (status: PENDING)
   기존 유저: 세션 발급
3. PENDING → 승인 대기 안내 페이지 (/pending)
4. 관리자가 /admin/members에서 승인
5. status: APPROVED → 동문 기능 전체 활성화
```

---

## 유저 상태 (UserStatus)

| 상태 | 설명 |
|------|------|
| `PENDING` | 소셜 로그인 완료, 관리자 승인 대기 |
| `APPROVED` | 승인 완료, 동문 전용 기능 사용 가능 |
| `REJECTED` | 승인 거절, 로그인 가능하나 동문 기능 차단 |
| `ADMIN` | 관리자 |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/login` | 로그인 페이지 (소셜 버튼) |
| `/pending` | 승인 대기 안내 페이지 |
| `/api/auth/[...nextauth]` | NextAuth.js 핸들러 |

---

## 미들웨어 (`middleware.ts`)

```
/alumni          → APPROVED 이상만 접근
/board/new       → APPROVED 이상만 접근
/admin/**        → ADMIN만 접근
/pending         → PENDING만 접근 (APPROVED면 / 로 리다이렉트)
```

---

## 데이터 모델

```prisma
enum UserStatus {
  PENDING
  APPROVED
  REJECTED
  ADMIN
}

model User {
  id             Int            @id @default(autoincrement())
  name           String
  email          String         @unique
  image          String?
  status         UserStatus     @default(PENDING)
  createdAt      DateTime       @default(now())
  alumniProfile  AlumniProfile?
  accounts       Account[]
  sessions       Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            Int
  type              String
  provider          String
  providerAccountId String
  access_token      String?
  refresh_token     String?
  expires_at        Int?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       Int
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## NextAuth 설정 포인트

- `PrismaAdapter` 사용
- `session.strategy: "database"`
- `callbacks.session`: `session.user.status`, `session.user.id` 포함
- `callbacks.signIn`: REJECTED 유저 로그인 차단

---

## 동문 프로필 등록

최초 APPROVED 전환 시 또는 APPROVED 후 마이페이지에서 AlumniProfile 등록.  
필수 항목: 졸업년도, 학과, 전화번호.

---

## 수용 기준

- [ ] Google / Kakao / Naver 소셜 로그인이 동작한다
- [ ] 신규 로그인 시 PENDING 상태로 저장된다
- [ ] PENDING 유저가 /alumni 접근 시 /pending으로 리다이렉트된다
- [ ] REJECTED 유저가 로그인 시도 시 접근 거부 메시지를 표시한다
- [ ] ADMIN 유저만 /admin에 접근 가능하다
- [ ] 세션에 status, id가 포함된다
