# Spec: 인증 및 동문 가입 (Auth)

## 개요
이메일/비밀번호 기반 회원가입 + 관리자 승인 방식.  
회원가입 시 PENDING 상태로 저장되며, 관리자 승인 후 APPROVED 상태로 전환되어 동문 전용 기능을 사용할 수 있다.

---

## 인증 플로우

```
1. /register 에서 이메일/비밀번호로 회원가입
   (이름, 이메일, 비밀번호, 졸업연도, 학과 입력)
2. DB에 User(PENDING) + AlumniProfile 동시 생성
3. /login 으로 리다이렉트 → 가입 완료 안내
4. 로그인 → PENDING 상태 → /pending 안내 페이지
5. 관리자가 /admin/members 에서 승인
6. status: APPROVED → 동문 기능 전체 활성화
```

---

## 유저 상태 (UserStatus)

| 상태 | 설명 |
|------|------|
| `PENDING` | 회원가입 완료, 관리자 승인 대기 |
| `APPROVED` | 승인 완료, 동문 전용 기능 사용 가능 |
| `REJECTED` | 승인 거절, 로그인 가능하나 동문 기능 차단 |
| `ADMIN` | 관리자 |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/register` | 회원가입 페이지 |
| `/login` | 로그인 페이지 (이메일/비밀번호) |
| `/pending` | 승인 대기 안내 페이지 |
| `/api/auth/[...nextauth]` | NextAuth.js 핸들러 |

---

## 미들웨어 (`proxy.ts`)

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
  password       String?        // 이메일/비밀번호 인증 (bcrypt, cost 12)
  status         UserStatus     @default(PENDING)
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  alumniProfile  AlumniProfile?
}

model AlumniProfile {
  id             Int     @id @default(autoincrement())
  graduationYear Int     @map("graduation_year")
  department     String  @map("department")  // 필수
  phone          String? @map("phone")        // 선택

  userId Int  @unique @map("user_id")
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## NextAuth 설정

- OAuth 없음 (Credentials provider만 사용)
- `session.strategy: "jwt"` (DB 세션 테이블 불필요)
- `PrismaAdapter` 미사용
- `callbacks.jwt`: 매 요청마다 DB에서 `status` 재조회 (관리자 변경 즉시 반영)
- `callbacks.session`: `session.user.status`, `session.user.id` 포함

---

## 수용 기준

- [x] 이메일/비밀번호로 회원가입이 동작한다
- [x] 회원가입 시 AlumniProfile이 함께 생성된다
- [x] 신규 가입 시 PENDING 상태로 저장된다
- [x] PENDING 유저가 /alumni 접근 시 /pending으로 리다이렉트된다
- [x] REJECTED 유저가 로그인 시도 시 접근 거부 메시지를 표시한다
- [x] ADMIN 유저만 /admin에 접근 가능하다
- [x] 세션에 status, id가 포함된다
