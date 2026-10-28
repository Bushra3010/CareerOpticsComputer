process.env.NODE_ENV="test";
process.env.DATABASE_URL||="postgresql://erp:test@127.0.0.1:5432/erp_test";
process.env.JWT_SECRET||="test-access-secret-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET||="test-refresh-secret-at-least-32-characters";
process.env.CORS_ORIGINS||="http://localhost:8080";
process.env.BOOTSTRAP_TOKEN||="test-bootstrap-token-for-integration-tests-only";
