# 유한공업고등학교 총동문회 — Agent 컨텍스트

Next.js 16 (App Router) 기반 동문회 커뮤니티 사이트.  
Docker + 자체 서버 배포.

---

## 문서 맵

### 기술 문서 (작업 전 반드시 확인)
- [아키텍처](architecture.md) — 기술 스택, 디렉토리 구조, 주요 설계 결정
- [컨벤션](conventions.md) — 코딩 규칙, 네이밍, API 응답 형식, 컴포넌트 작성 패턴
- [데이터베이스](database.md) — 전체 Prisma 스키마, 모델 관계, 마이그레이션 규칙

### 기능 스펙 (해당 기능 코드와 함께 커밋된 것만 유효)
- [홈](../specs/home/spec.md)
- [공지사항](../specs/notices/spec.md)
- [자유게시판](../specs/board/spec.md)
- [동문 명부](../specs/alumni/spec.md)
- [행사 일정](../specs/events/spec.md)
- [갤러리](../specs/gallery/spec.md)
- [임원진](../specs/officers/spec.md)
- [장학회](../specs/scholarship/spec.md)
- [인증 / 동문 가입](../specs/auth/spec.md)
- [백오피스 /admin](../specs/admin/spec.md)

> spec 파일은 기능 구현 코드와 동일 커밋에 포함된다.  
> 코드 없이 spec만 존재하는 경우 해당 스펙은 아직 미구현 상태다.

---

## 빠른 참조

| 항목 | 값 |
|------|-----|
| Node | 20+ |
| 패키지 매니저 | pnpm |
| 포트 (dev) | 3000 |
| DB 포트 | 5432 |
| 환경변수 파일 | `.env.local` (로컬), `.env` (Docker) |

### 자주 쓰는 명령어
```bash
pnpm dev                    # 개발 서버
pnpm build                  # 프로덕션 빌드
pnpm prisma db push         # 스키마 동기화 (개발)
pnpm prisma migrate dev     # 마이그레이션 생성
pnpm prisma studio          # DB GUI
docker compose up -d        # 전체 스택 실행
```

---

## ⚠️ 버전 gotcha — 코드 작성 전 반드시 확인

학습 데이터와 다른 버전 특유의 패턴들. AI가 잘못된 코드를 생성하기 쉬운 지점.

### Prisma v7 — import 경로와 어댑터

```ts
// ❌ 틀림 (Prisma v5/v6 이하 패턴)
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ✅ 맞음 (Prisma v7)
import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})
```

- 생성된 클라이언트 위치: `app/generated/prisma/` (gitignore, 빌드 시 재생성)
- 싱글턴 패턴: `lib/prisma.ts` 참고

### Next.js 16 — 미들웨어 파일명

```
❌ middleware.ts   (Next.js 15 이하)
✅ proxy.ts        (Next.js 16)
```

- 경로 보호 로직은 `proxy.ts`에 작성한다

### NextAuth v5 (beta) — 주요 변경점

```ts
// ❌ v4 패턴
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
const session = await getServerSession(authOptions)

// ✅ v5 패턴
import { auth } from '@/lib/auth'
const session = await auth()
```

- Route Handler: `app/api/auth/[...nextauth]/route.ts` — `handlers` export
- 설정 파일: `lib/auth.ts`

### Prisma 모델 타입 import

```ts
// ❌ 틀림
import type { User } from '@prisma/client'

// ✅ 맞음
import type { User, UserStatus } from '@/app/generated/prisma/client'
```

---

## 핵심 제약

- 모든 API Route는 권한 검사를 서버에서 수행한다 (클라이언트 신뢰 금지)
- 이미지 업로드는 반드시 R2 presigned URL 방식으로 처리한다 (서버 경유 금지)
- `status: PENDING` 유저는 동문 전용 기능에 접근할 수 없다
- `/admin/**` 경로는 `proxy.ts`에서 ADMIN 권한을 검증한다
