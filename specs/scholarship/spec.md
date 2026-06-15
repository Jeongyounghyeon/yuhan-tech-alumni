# Spec: 장학회 (/scholarship)

## 개요
장학회 소개 및 장학 안내 목록 페이지.  
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
| `/scholarship` | 장학회 소개 + 장학 안내 목록 |

---

## 기능

### 장학회 소개 섹션
- 장학회 설립 취지 텍스트 (관리자가 수정 가능한 단일 레코드)

### 장학 안내 목록
- 카드 또는 테이블 형태
- 표시 항목: 장학 이름, 지원 금액, 지원 기간, 설명
- 최신순 정렬

---

## 데이터 모델

```prisma
model ScholarshipInfo {
  id          Int    @id @default(1)
  description String
}

model Scholarship {
  id          Int      @id @default(autoincrement())
  name        String
  amount      String
  period      String
  description String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/scholarship` | 장학 목록 |
| GET | `/api/scholarship/info` | 소개 텍스트 |
| POST | `/api/scholarship` | 등록 (관리자) |
| PATCH | `/api/scholarship/[id]` | 수정 (관리자) |
| DELETE | `/api/scholarship/[id]` | 삭제 (관리자) |
| PATCH | `/api/scholarship/info` | 소개 텍스트 수정 (관리자) |

---

## 수용 기준

- [ ] 소개 텍스트와 장학 목록이 함께 표시된다
- [ ] 장학 목록이 없을 때 빈 상태 메시지를 표시한다
- [ ] 관리자가 /admin에서 소개 텍스트를 수정할 수 있다
- [ ] SSR로 렌더링된다
