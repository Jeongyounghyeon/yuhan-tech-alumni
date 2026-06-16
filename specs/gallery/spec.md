# Spec: 갤러리 (/gallery)

## 개요
행사 사진을 포함한 게시글 방식의 갤러리.  
제목 + 본문 텍스트 + 다중 이미지 업로드 구조 (연세대 총동문회 방식 참고).  
전체 공개. 관리자만 작성/수정/삭제.

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
| `/gallery` | 갤러리 목록 (카드 그리드) |
| `/gallery/[id]` | 상세 (본문 + 이미지) |
| `/gallery/new` | 작성 (관리자) |
| `/gallery/[id]/edit` | 수정 (관리자) |

---

## 기능

### 목록 (`/gallery`)
- 카드 그리드 (3열 / 모바일 1열)
- 카드: 첫 번째 이미지 썸네일 + 제목 + 날짜
- Offset 기반 페이지네이션 (페이지당 12개)
- 관리자: 우측 상단 `+ 갤러리 등록` 버튼 노출 → `/gallery/new`

### 상세 (`/gallery/[id]`)
- 제목, 작성일, 조회수
- 본문 텍스트
- 이미지 목록 (순차 표시 or 라이트박스)
- 이전/다음 글 이동
- 관리자: 제목 우측 수정 / 삭제 버튼 노출

### 작성 · 수정 (관리자)
- 제목 (필수)
- 본문 (textarea)
- 이미지 다중 업로드 (Cloudflare R2 저장)
  - 업로드 후 미리보기 표시
  - 이미지 순서 변경 가능
  - 개별 이미지 삭제 가능

---

## 이미지 업로드 플로우

```
클라이언트 → POST /api/gallery/upload (presigned URL 요청)
           → Cloudflare R2에 직접 PUT 업로드
           → R2 URL을 GalleryImage 레코드로 저장
```

---

## 데이터 모델

```prisma
model GalleryPost {
  id        Int            @id @default(autoincrement())
  title     String
  content   String?
  viewCount Int            @default(0)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  authorId  Int
  author    User           @relation(fields: [authorId], references: [id])
  images    GalleryImage[]
}

model GalleryImage {
  id        Int         @id @default(autoincrement())
  url       String
  order     Int         @default(0)
  postId    Int
  post      GalleryPost @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/gallery` | 목록 (`?page=1&limit=12`) |
| GET | `/api/gallery/[id]` | 상세 + 조회수 +1 |
| POST | `/api/gallery` | 작성 (관리자) |
| PATCH | `/api/gallery/[id]` | 수정 (관리자) |
| DELETE | `/api/gallery/[id]` | 삭제 (관리자, 이미지 R2 삭제 포함) |
| POST | `/api/gallery/upload` | R2 presigned URL 발급 (관리자) |

---

## 수용 기준

- [x] 목록에서 첫 번째 이미지가 썸네일로 표시된다
- [x] 이미지가 없는 글도 등록 가능하다
- [x] 다중 이미지 업로드가 R2에 정상 저장된다
- [x] 게시글 삭제 시 연결된 R2 이미지도 함께 삭제된다
- [x] 모바일에서 이미지가 반응형으로 표시된다
