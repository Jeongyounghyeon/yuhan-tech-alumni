# Spec: 행사 일정 (/events)

## 개요
동문회 행사를 월간 캘린더 + 목록으로 확인할 수 있는 페이지.  
전체 공개. 관리자만 등록/수정/삭제 가능.

---

## 권한

| 역할 | 조회 | 등록/수정/삭제 |
|------|------|--------------|
| 비로그인 | O | X |
| 로그인 동문 | O | X |
| 관리자 | O | O |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/events` | 캘린더 + 행사 목록 |

---

## 기능

### 캘린더 뷰
- `@schedule-x/react` 기반 월간 뷰
- 날짜 셀에 행사명 표시
- 행사 클릭 시 상세 정보 팝오버/모달

### 행사 목록
- 캘린더 하단 또는 사이드에 해당 월 행사 리스트
- 날짜, 행사명, 장소 표시

### 행사 등록 모달 (관리자)
- 행사명 (필수)
- 시작일 / 종료일
- 장소
- 설명

---

## 데이터 모델

```prisma
model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  location    String?
  startDate   DateTime
  endDate     DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
}
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/events` | 목록 (`?year=2026&month=6`) |
| POST | `/api/events` | 등록 (관리자) |
| PATCH | `/api/events/[id]` | 수정 (관리자) |
| DELETE | `/api/events/[id]` | 삭제 (관리자) |

---

## 수용 기준

- [ ] 월간 캘린더에 행사가 날짜별로 표시된다
- [ ] 캘린더 월 이동 시 해당 월 데이터를 새로 fetch한다
- [ ] 관리자 외 등록 버튼 미노출
- [ ] 모바일에서 캘린더가 스크롤 없이 표시되거나 리스트 뷰로 폴백된다
