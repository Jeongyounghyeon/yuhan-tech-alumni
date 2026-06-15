# Spec: 공지사항 (/notices)

## 개요
관리자만 작성 가능한 공식 공지 게시판.  
읽기는 비로그인 포함 전체 공개.

---

## 권한

| 역할 | 목록/상세 | 작성/수정/삭제 |
|------|----------|--------------|
| 비로그인 | O | X |
| 로그인 동문 | O | X |
| 관리자 | O | O |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/notices` | 목록 |
| `/notices/[id]` | 상세 |
| `/notices/new` | 작성 (관리자) |
| `/notices/[id]/edit` | 수정 (관리자) |

---

## 기능

### 목록 (`/notices`)
- 제목, 작성일 표시
- 최신순 정렬
- Offset 기반 페이지네이션 (페이지당 10개)
- 인기글 뱃지 (조회수 N 이상)

### 상세 (`/notices/[id]`)
- 제목, 작성일, 조회수, 본문
- 이전/다음 글 이동
- 관리자: 수정 / 삭제 버튼 노출

### 작성 · 수정
- 제목 (필수)
- 내용 (textarea, 필수)
- 저장 / 취소

---

## 데이터 모델

```prisma
model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/notices` | 목록 (`?page=1&limit=10`) |
| GET | `/api/notices/[id]` | 상세 + 조회수 +1 |
| POST | `/api/notices` | 작성 (관리자) |
| PATCH | `/api/notices/[id]` | 수정 (관리자) |
| DELETE | `/api/notices/[id]` | 삭제 (관리자) |

---

## 수용 기준

- [ ] 비로그인 사용자가 목록·상세를 볼 수 있다
- [ ] 비로그인/동문이 작성 페이지 접근 시 403 또는 리다이렉트
- [ ] 상세 접근 시 조회수가 1 증가한다
- [ ] 페이지네이션이 정상 동작한다
- [ ] 관리자만 작성/수정/삭제 버튼이 노출된다
