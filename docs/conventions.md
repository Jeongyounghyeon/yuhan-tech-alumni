# 컨벤션

→ 상위 문서: [CLAUDE.md](../CLAUDE.md)

---

## 파일 · 디렉토리 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `NoticeCard.tsx` |
| 유틸 · 훅 파일 | camelCase | `useAlumni.ts` |
| API Route 파일 | Next.js 규칙 | `route.ts` |
| 디렉토리 | kebab-case | `gallery-post/` |
| 상수 파일 | UPPER_SNAKE | `AUTH_ROLES.ts` |

---

## 컴포넌트 작성 규칙

### 서버 컴포넌트 (기본)
- 기본적으로 서버 컴포넌트로 작성한다
- DB fetch, 인증 확인은 서버 컴포넌트에서 처리한다

### 클라이언트 컴포넌트
- 파일 상단에 `'use client'` 선언
- 이벤트 핸들러, 상태, 브라우저 API가 필요한 경우만 사용
- 클라이언트 컴포넌트는 트리의 말단(leaf)에 위치시킨다

### 컴포넌트 구조
```tsx
// 1. imports
// 2. types/interfaces
// 3. 컴포넌트 함수 (named export)
// 4. 헬퍼 함수 (컴포넌트 내부에서만 쓰이면 하단)

export function NoticeCard({ title, date }: NoticeCardProps) {
  return (...)
}
```

- `export default` 대신 named export 사용 (page.tsx, layout.tsx 제외)
- props 타입은 인터페이스 대신 `type` 사용

---

## API Route 컨벤션

### 경로 구조
```
/api/{resource}           GET(목록), POST(생성)
/api/{resource}/[id]      GET(상세), PATCH(수정), DELETE(삭제)
```

### 응답 형식

**성공**
```json
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "limit": 10 }
}
```

**에러**
```json
{
  "error": "에러 메시지",
  "code": "UNAUTHORIZED"
}
```

### HTTP 상태 코드
| 상황 | 코드 |
|------|------|
| 성공 (조회/수정) | 200 |
| 생성 성공 | 201 |
| 인증 없음 | 401 |
| 권한 없음 | 403 |
| 리소스 없음 | 404 |
| 서버 에러 | 500 |

### 권한 검사 패턴
```ts
// 모든 API Route에서 동일한 패턴 사용
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: '로그인이 필요합니다' }, { status: 401 })
  if (session.user.status !== 'ADMIN') return Response.json({ error: '권한이 없습니다' }, { status: 403 })
  // ...
}
```

---

## 데이터 패칭 패턴

### 서버 컴포넌트에서 직접 fetch
```ts
// app/(public)/notices/page.tsx
import { prisma } from '@/lib/prisma'

export default async function NoticesPage() {
  const notices = await prisma.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
  return <NoticeList notices={notices} />
}
```

### 클라이언트에서 API 호출
```ts
// 검색/필터처럼 클라이언트 인터랙션이 필요한 경우
const res = await fetch(`/api/alumni?name=${name}&year=${year}`)
const { data } = await res.json()
```

---

## 페이지네이션 패턴 (Offset 기반)

```ts
// API: ?page=1&limit=10
const page = Number(searchParams.get('page') ?? 1)
const limit = Number(searchParams.get('limit') ?? 10)
const skip = (page - 1) * limit

const [items, total] = await prisma.$transaction([
  prisma.notice.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
  prisma.notice.count(),
])

return Response.json({
  data: items,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
})
```

---

## 에러 처리

- API Route에서 try/catch로 감싸고 500 응답 반환
- 클라이언트에서는 에러 시 shadcn/ui `toast`로 메시지 표시
- 삭제 액션 전 shadcn/ui `AlertDialog`로 확인

---

## 환경변수 네이밍

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `NEXTAUTH_SECRET` | NextAuth 시크릿 |
| `NEXTAUTH_URL` | 사이트 URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `KAKAO_CLIENT_ID` / `KAKAO_CLIENT_SECRET` | Kakao OAuth |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | Naver OAuth |
| `R2_ACCOUNT_ID` | Cloudflare 계정 ID |
| `R2_ACCESS_KEY_ID` | R2 액세스 키 |
| `R2_SECRET_ACCESS_KEY` | R2 시크릿 키 |
| `R2_BUCKET_NAME` | R2 버킷명 |
| `R2_PUBLIC_URL` | R2 퍼블릭 도메인 |

---

## 금지 패턴

- `any` 타입 사용 금지 — `unknown` + 타입 가드 사용
- 클라이언트에서 DB 직접 접근 금지 — 반드시 API Route 경유
- `console.log` 커밋 금지 — 디버깅 후 제거
- 이미지를 서버 메모리로 처리 금지 — R2 presigned URL 방식 사용
- `export default` 컴포넌트 금지 (page.tsx, layout.tsx 예외)
