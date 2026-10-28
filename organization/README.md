# Career Optics Computer Centre ERP web application

Authenticated React and Vite frontend for the Career Optics Computer Centre education ERP.

## Development

```bash
cp .env.example .env
npm ci
npm run dev
```

`VITE_API_URL` must point to the backend `/api/v1` endpoint.

## Verification

```bash
npm test
npm run build
npm audit
```

The production container is defined in `Dockerfile` and serves the compiled SPA through Nginx. See the repository-level `DEPLOYMENT.md` for the complete release procedure.
