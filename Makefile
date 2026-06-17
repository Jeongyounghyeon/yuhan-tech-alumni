.PHONY: help install setup dev build lint type-check \
        db/up db/down db/push db/migrate db/studio db/reset db/generate db/seed \
        docker/up docker/down docker/build docker/logs

# ───────────────────────────────
# 기본
# ───────────────────────────────

help:
	@grep -E '^[a-zA-Z/_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## 패키지 설치
	pnpm install

setup: install db/generate ## 초기 환경 구성 (install + prisma generate)
	@echo "✅ Setup complete. Copy .env.local and fill in secrets."

# ───────────────────────────────
# 개발
# ───────────────────────────────

dev: ## 개발 서버 실행 (DB는 별도로 make db/up 필요)
	pnpm dev

build: ## 프로덕션 빌드
	pnpm build

lint: ## ESLint 실행
	pnpm lint

type-check: ## TypeScript 타입 체크
	pnpm tsc --noEmit

# ───────────────────────────────
# 데이터베이스 (로컬 PostgreSQL via Docker)
# ───────────────────────────────

db/up: ## 로컬 PostgreSQL 컨테이너 시작
	docker compose up db -d
	@echo "⏳ Waiting for PostgreSQL..."
	@until docker compose exec db pg_isready -U postgres > /dev/null 2>&1; do sleep 1; done
	@echo "✅ PostgreSQL ready."

db/down: ## 로컬 PostgreSQL 컨테이너 중지
	docker compose stop db

db/generate: ## Prisma 클라이언트 생성
	pnpm prisma generate

db/push: ## 스키마를 DB에 바로 반영 (개발용, 마이그레이션 파일 생성 안 함)
	pnpm prisma db push

db/migrate: ## 마이그레이션 파일 생성 및 적용 (스테이징/프로덕션 배포 전)
	pnpm prisma migrate dev

db/studio: ## Prisma Studio (DB GUI) 실행
	pnpm prisma studio

db/seed: ## 시드 데이터 삽입 (테스트 계정 포함)
	pnpm prisma db seed

db/reset: ## DB 초기화 (데이터 전체 삭제 후 스키마 재적용)
	@echo "⚠️  This will delete all data. Press Ctrl+C to cancel."
	@sleep 3
	pnpm prisma migrate reset --force

# ───────────────────────────────
# Docker (전체 스택)
# ───────────────────────────────

docker/build: ## Docker 이미지 빌드
	docker compose build

docker/up: ## 전체 스택 실행 (app + db)
	docker compose up -d

docker/down: ## 전체 스택 중지 및 제거
	docker compose down

docker/logs: ## 앱 로그 스트림
	docker compose logs -f app
