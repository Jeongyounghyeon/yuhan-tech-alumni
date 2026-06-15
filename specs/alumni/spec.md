# Spec: 동문 명부 (/alumni)

## 개요
승인된 동문 목록을 이름·졸업년도·학과 기준으로 검색/필터할 수 있는 페이지.  
로그인한 동문(APPROVED)만 접근 가능.

---

## 권한

| 역할 | 접근 |
|------|------|
| 비로그인 | X → 로그인 페이지 리다이렉트 |
| PENDING 동문 | X → 승인 대기 안내 페이지 |
| APPROVED 동문 | O |
| 관리자 | O |

---

## 라우트

| 경로 | 설명 |
|------|------|
| `/alumni` | 동문 명부 목록 |

---

## 기능

### 검색 · 필터
- 이름 텍스트 검색 (실시간 or 폼 제출)
- 졸업년도 셀렉트 필터
- 학과 셀렉트 필터
- 필터 초기화 버튼

### 목록
- 12컬럼 그리드 테이블 형태
- 표시 항목: 이름, 졸업년도, 학과, 전화번호
- Offset 기반 페이지네이션 (페이지당 20개)

---

## 데이터 모델

동문 정보는 `User` 모델 + `AlumniProfile` 분리 구조.

```prisma
model AlumniProfile {
  id             Int    @id @default(autoincrement())
  userId         Int    @unique
  user           User   @relation(fields: [userId], references: [id])
  graduationYear Int
  department     String
  phone          String
  bio            String? @db.VarChar(500)
}
```

---

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/alumni` | 목록 (`?name=&year=&dept=&page=1`) |

---

## 수용 기준

- [ ] 비로그인 접근 시 로그인 페이지로 리다이렉트
- [ ] PENDING 동문 접근 시 승인 대기 안내 표시
- [ ] 이름 검색이 부분 일치(ILIKE)로 동작한다
- [ ] 졸업년도 / 학과 필터 복합 적용이 가능하다
- [ ] 전화번호는 동문에게만 노출 (비로그인 API 호출 차단)
