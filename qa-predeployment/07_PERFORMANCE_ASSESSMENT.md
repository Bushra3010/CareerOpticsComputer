# Performance Assessment

Generated: 2026-09-07

## Frontend Performance (Organization)

### Build Output Analysis

```
dist/assets/index-BAS_kNLw.js   1,553.89 kB │ gzip: 402.40 kB  ← MAIN BUNDLE
dist/assets/ui-C8jspy6_.js      288.59 kB │ gzip:  89.68 kB  ← UI COMPONENTS
dist/assets/charts-d5aAsn_X.js  385.49 kB │ gzip: 102.49 kB  ← CHARTS
dist/assets/index.es-BZtt-toy.js 151.44 kB │ gzip:  48.91 kB  ← APP LOGIC
dist/assets/data-CSYuOcug.js     44.02 kB │ gzip:  12.71 kB  ← DATA/TANSTACK
```

### Issues

1. **Oversized main bundle (1.5MB / 400KB gzipped)**
   - Contains all page components, layouts, and business logic
   - First meaningful paint will be slow on 3G/slow connections
   - Recommendation: Implement route-based code splitting. Each page module should be a separate chunk.

2. **Supabase client statically imported despite dynamic imports**
   - Warning: `INEFFECTIVE_DYNAMIC_IMPORT` for `client.ts`
   - Several files dynamically import it, but AuthContext statically imports it
   - Supabase client (network layer) ends up in main bundle
   - Recommendation: Make all imports consistent (either all dynamic or extract to shared chunk)

3. **Chart libraries in main bundle**
   - recharts/d3/victory bundled together in `charts-d5aAsn_X.js`
   - Only loaded on pages with charts
   - Recommendation: Already code-split, verify lazy loading in components

4. **Radix UI components bundled**
   - `ui-C8jspy6_.js` at 288KB
   - Recommendation: Consider tree-shaking unused Radix primitives

### Code Splitting Configuration

The vite config already defines code-splitting groups:
```js
codeSplitting: { groups: [
  { name: "charts", test: /node_modules\/(recharts|d3-|victory-vendor)/ },
  { name: "ui", test: /node_modules\/@radix-ui/ },
  { name: "react", test: /node_modules\/(react|react-dom|react-router)/ },
  { name: "icons", test: /node_modules\/lucide-react/ },
  { name: "data", test: /node_modules\/(@tanstack|date-fns|zod)/ },
] }
```

**Assessment:** Configuration is correct, but the main bundle is still too large because all app source code is bundled together.

### Estimated Performance Impact

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| First Contentful Paint (est.) | ~2.5s (3G) | <1.5s | High |
| Time to Interactive (est.) | ~4s (3G) | <3s | Medium |
| Total JS transferred | ~2.3MB | <1MB | High |
| Gzipped total | ~700KB | <300KB | High |

---

## Backend Performance

### Rate Limiting

- **Current:** 200 requests/minute global, 10 login attempts/15 minutes
- **Assessment:** Reasonable for single-server deployment. In production behind a load balancer, rate limiting should be moved to the edge/proxy layer.

### Database Query Patterns

**Concerns identified from code inspection:**

1. **Dashboard aggregation queries** — Multiple COUNT queries on different tables in a single request:
   - students count
   - enquiries today count
   - outstanding dues sum
   - attendance count
   - payments sum
   - courses count
   - **Risk:** Could be slow with large datasets. Consider materialized views or caching.

2. **Fee payment `$transaction` with FOR UPDATE** — Row-level locking within transaction:
   - **Assessment:** Correct pattern for preventing double-spending
   - **Risk:** Long transactions could cause lock contention under high load

3. **Attendance upsert by compound key** — `upsert` on `[studentId, date]`:
   - **Assessment:** Efficient if unique index exists
   - Schema has `@@unique([studentId, date])` — confirmed

4. **Exam results upsert** — `upsert` on `[examId, studentId]`:
   - Schema has `@@unique([examId, studentId])` — confirmed

### Missing Performance Optimizations

| Area | Current State | Recommendation |
|------|---------------|----------------|
| Query caching | None | Add Redis for dashboard aggregations |
| Connection pooling | Prisma default | Verify pool size for production load |
| Index coverage | Partial | Add composite indexes for common filter queries |
| Response compression | None | Enable gzip/brotli on Express |
| Static assets | None (SPA served by Vite) | Use CDN for frontend in production |

### Database Indexes Present

```prisma
// Users
@@index([userType])

// Organizations
@@index([code])

// Branches
@@index([organizationId])
@@index([code])
@@index([email])

// Students
@@index([branchId])
@@index([courseId])
@@index([batchId])
@@index([enrollmentNo])
@@index([applicationNo])

// Attendance
@@unique([studentId, date])
@@index([studentId])

// Exams
@@index([branchId])

// Exam Results
@@unique([examId, studentId])
@@index([studentId])

// Fee Invoices
@@index([studentId])

// Fee Payments
@@index([invoiceId])
@@index([studentId])

// Visit Enquiries
@@index([branchId])

// Items
@@index([branchId])

// Audit Events
@@index([organizationId, createdAt])
@@index([branchId, createdAt])
@@index([entityType, entityId])

// Batch Timings
@@index([batchId])

// Branch Transactions
@@index([branchId])

// Branch Notices
@@index([branchId])

// Refresh Sessions
@@index([userId])
@@index([expiresAt])
```

**Assessment:** Index coverage is adequate for current feature set. Missing composite indexes for:
- `FeeInvoice(studentId, status, dueDate)` — for due fee collection queries
- `AttendanceRecord(date, status)` — for attendance reports
- `ExamResult(examId, marksObtained)` — for grade management

---

## API Server Performance

### Current State
- No caching
- No query optimization
- Every request hits Supabase directly
- No connection pooling configuration visible

### Assessment
- Acceptable for small deployments (<100 users)
- Will degrade with larger datasets
- No pagination on some list endpoints

---

## Production Deployment Performance

### Docker Configuration
- `DEPLOYMENT.md` specifies Docker Compose
- Backend runs `prisma migrate deploy` on container start
- No health check configuration visible in deployment docs

### Recommended Production Stack
```
[Client] → [CDN/Static Assets] → [Load Balancer] → [API Server]
                                                    ↓
                                              [Redis Cache]
                                                    ↓
                                              [PostgreSQL]
```

**Current gaps:**
- No CDN for frontend assets
- No Redis cache for dashboard aggregations
- No read replicas for reporting queries
- No request queuing for peak loads

## Performance Summary

| Area | Status | Severity |
|------|--------|----------|
| Frontend bundle too large | Degraded UX | P2-HIGH |
| No code splitting for app code | Degraded UX | P2-HIGH |
| No query caching | Scalability risk | P3-MEDIUM |
| Missing composite indexes | Query performance | P3-MEDIUM |
| No response compression | Bandwidth waste | P3-MEDIUM |
| Rate limiting adequate | OK | None |
| Row-level locking correct | OK | None |
| Index coverage mostly adequate | OK | None |
