# Career Optics Computer Academy ERP deployment

## Prerequisites

- Docker Engine 25+ with Compose v2
- A DNS record for the ERP host
- TLS termination through the hosting platform or a reverse proxy

## First deployment

1. Copy `.env.deploy.example` to `.env`.
2. Generate unique database, access-token, refresh-token and bootstrap secrets.
3. Run `docker compose up -d --build`.
4. Confirm `GET /api/../health/live` returns `ok` and `/health/ready` returns `ready` through the API service.
5. Initialize the first organisation once:

```bash
curl -X POST https://erp.example.com/api/v1/auth/bootstrap \
  -H 'Content-Type: application/json' \
  -H 'x-bootstrap-token: YOUR_ONE_TIME_TOKEN' \
  -d '{"organizationName":"Career Optics Computer Academy","adminName":"Administrator","email":"admin@example.com","phone":"9999999999","password":"CHANGE-THIS-PASSWORD","branchName":"Main Branch","city":"Your City","state":"Your State","pincode":"000000"}'
```

6. Remove `BOOTSTRAP_TOKEN` from the deployment environment and restart the API.
7. Sign in with the administrator email and password.

## Required production controls

- Terminate HTTPS before the web container; never expose plain HTTP publicly.
- Back up the PostgreSQL volume daily and test restoration quarterly.
- Store secrets in the hosting provider's secret manager, not in source control.
- Restrict database access to the API network.
- Monitor `/health/ready`, HTTP 5xx rates and storage capacity.
- Run `npm test`, frontend tests and both production builds before each release.

## Database migration policy

The API container runs `prisma migrate deploy` before starting. Migrations must be reviewed and backed up before production execution. Never use `prisma db push` against production.

## Current release boundary

The deployable core covers authentication, tenant-scoped enquiries, students, courses, fee invoices/payments, attendance and audit events. Other visible modules remain UI previews until their APIs are implemented; do not use them as systems of record.
