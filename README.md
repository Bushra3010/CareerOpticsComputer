# Career Optics Computer Centre ERP

Education ERP monorepo with a React/Vite frontend, Express API, Prisma and PostgreSQL.

- `organization/` — authenticated web application
- `backend/` — secure REST API and database migrations
- `docker-compose.yml` — reproducible production-style deployment
- `DEPLOYMENT.md` — deployment and operational runbook

## Local verification

```bash
cd backend && npm ci && npm run typecheck && npm test
cd ../organization && npm ci && npm run test && npm run build
```

Copy each `.env.example` before running services locally. See `DEPLOYMENT.md` for the first production initialization.
