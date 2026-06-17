# 유한공업고등학교 총동문회

Next.js 16 기반 동문회 커뮤니티 사이트.

## 로컬 실행

**요구사항**: Node.js 20+, pnpm, Docker

```bash
pnpm install
pnpm prisma generate
cp .env.local.example .env.local  # 값 채우기
make db/up
make db/push
make dev
```

→ http://localhost:3000

## 관리자 계정

회원가입 후 `make db/studio` 에서 해당 유저의 `is_admin = true`, `status = APPROVED` 로 변경.

## 참고 문서

| 문서 | 내용 |
|------|------|
| `docs/agent.md` | 기술 스택, 버전별 주의사항 |
| `docs/architecture.md` | 디렉토리 구조, 설계 결정 |
| `specs/` | 기능별 스펙 |

## 주요 명령어

```bash
make help       # 전체 명령어 목록
make db/studio  # DB GUI
make db/migrate # 마이그레이션 파일 생성 (배포 전)
```
