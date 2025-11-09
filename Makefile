.PHONY: install up down api web prisma-generate prisma-migrate prisma-seed lint test build format

install:
npm install

up:
docker compose up --build

down:
docker compose down -v

api:
nx serve api

web:
nx serve web

prisma-generate:
npx prisma generate

prisma-migrate:
npx prisma migrate deploy

prisma-seed:
npx ts-node --project tsconfig.base.json prisma/seed.ts

lint:
nx format:check

format:
nx format:write

test:
nx test api && nx test web

build:
nx build api && nx build web
