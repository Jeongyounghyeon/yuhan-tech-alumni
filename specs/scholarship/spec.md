# Spec: 장학회 (/scholarship)

## 개요
장학회 소개 및 장학 안내 목록 페이지.  
전체 공개. 관리자가 /admin/scholarships 에서 CRUD.

---

## 권한

| 역할 | 조회 | 수정 |
|------|------|------|
| 비로그인 | O | X |
| 로그인 동문 | O | X |
| 관리자 | O | /admin/scholarships 에서 CRUD |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/scholarship` | 장학회 소개 + 장학 안내 목록 |

---

## 기능

### 장학회 소개 섹션
- 장학회 설립 취지 텍스트 (코드 내 상수로 관리, DB 불필요)

### 장학 안내 목록
- 카드 형태
- 표시 항목: 장학 이름, 지원 금액, 지원 기간, 설명
- `order` 필드 기준 정렬

---

## 데이터 모델

```prisma
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

> 장학회 소개 텍스트는 `ScholarshipInfo` DB 테이블 없이 `scholarship/page.tsx` 내 상수로 하드코딩.

---

## 수용 기준

- [x] 소개 텍스트와 장학 목록이 함께 표시된다
- [x] 장학 목록이 없을 때 빈 상태 메시지를 표시한다
- [x] SSR로 렌더링된다
