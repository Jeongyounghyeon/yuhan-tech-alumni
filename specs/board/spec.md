# Spec: 자유게시판 (/board)

## 개요
로그인 동문이라면 누구나 글을 쓸 수 있는 자유 게시판.  
목록/상세 읽기는 비로그인 포함 전체 공개.

---

## 권한

| 역할 | 목록/상세 | 작성 | 수정/삭제 |
|------|----------|------|---------|
| 비로그인 | O | X | X |
| 로그인 동문 (APPROVED) | O | O | 본인 글만 |
| 관리자 | O | O | 전체 |

> PENDING 상태 동문은 읽기만 가능, 작성 불가.

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/board` | 목록 |
| `/board/[id]` | 상세 + 댓글 |
| `/board/new` | 작성 |
| `/board/[id]/edit` | 수정 |

---

## 기능

### 목록 (`/board`)
- 제목, 작성자, 작성일, 댓글 수, 조회수
- 최신순 정렬
- Offset 기반 페이지네이션 (페이지당 10개)

### 상세 (`/board/[id]`)
- 제목, 작성자, 작성일, 조회수, 본문
- 본인 글: 수정 / 삭제 버튼
- 댓글 목록 + 댓글 작성 (로그인 동문)

### 댓글
- 작성: 로그인 동문 (APPROVED)
- 삭제: 본인 + 관리자

### 작성 · 수정
- 제목 (필수)
- 내용 (textarea, 필수)

---

## 데이터 모델

```prisma
model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String
  viewCount Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  postId    Int
  post      Post     @relation(fields: [postId], references: [id])
}
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/posts` | 목록 (`?page=1&limit=10`) |
| GET | `/api/posts/[id]` | 상세 + 조회수 +1 |
| POST | `/api/posts` | 작성 (APPROVED 동문) |
| PATCH | `/api/posts/[id]` | 수정 (본인/관리자) |
| DELETE | `/api/posts/[id]` | 삭제 (본인/관리자) |
| GET | `/api/posts/[id]/comments` | 댓글 목록 |
| POST | `/api/posts/[id]/comments` | 댓글 작성 |
| DELETE | `/api/posts/[id]/comments/[cid]` | 댓글 삭제 |

---

## 수용 기준

- [ ] PENDING 동문이 작성 시도 시 안내 메시지 표시
- [ ] 본인 글 외 수정/삭제 버튼 미노출
- [ ] 댓글 작성 후 목록 즉시 갱신
- [ ] 상세 접근 시 조회수가 1 증가한다
- [ ] 페이지네이션이 정상 동작한다
