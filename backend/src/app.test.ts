import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "./app";

describe("production API boundaries",()=>{
  it("reports liveness without exposing implementation details",async()=>{const response=await request(app).get("/health/live");expect(response.status).toBe(200);expect(response.body).toEqual({status:"ok",service:"careeroptics-erp-api"});expect(response.headers["x-powered-by"]).toBeUndefined();});
  it("rejects protected endpoints without a token",async()=>{const response=await request(app).get("/api/v1/core/students");expect(response.status).toBe(401);expect(response.body.success).toBe(false);});
  it("rejects invalid login payloads",async()=>{const response=await request(app).post("/api/v1/auth/login").send({identifier:"x"});expect(response.status).toBe(422);expect(response.body.success).toBe(false);});
  it("sets standard security headers",async()=>{const response=await request(app).get("/health/live");expect(response.headers["x-content-type-options"]).toBe("nosniff");expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");});
});
