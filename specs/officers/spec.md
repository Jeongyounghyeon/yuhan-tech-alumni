# Spec: 임원진 (/officers)

## 개요
현 임원진을 카드 레이아웃으로 소개하는 정적 성격의 페이지.  
전체 공개. 관리자가 /admin에서 CRUD.

---

## 권한

| 역할 | 조회 | 수정 |
|------|------|------|
| 비로그인 | O | X |
| 로그인 동문 | O | X |
| 관리자 | O | /admin에서 CRUD |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/officers` | 임원진 목록 (카드 그리드) |

---

## 기능

### 목록 (`/officers`)
- 카드 그리드 (4열 / 모바일 2열)
- 카드 구성: 프로필 사진, 이름, 직책, 졸업년도(선택)
- 직책 순서 기반 정렬 (order 필드)

---

## 데이터 모델

```prisma
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
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/officers` | 전체 목록 (order 기준 정렬) |
| POST | `/api/officers` | 등록 (관리자) |
| PATCH | `/api/officers/[id]` | 수정 (관리자) |
| DELETE | `/api/officers/[id]` | 삭제 (관리자) |

---

## 수용 기준

- [ ] 임원진이 order 순서대로 표시된다
- [ ] 프로필 사진이 없으면 기본 아바타(이니셜)로 대체된다
- [ ] 모바일 2열 그리드로 표시된다
- [ ] SSR로 렌더링된다 (SEO 대응)
