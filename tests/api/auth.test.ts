import { describe, it, expect } from "vitest";

const BASE = "http://localhost:3000";

describe("POST /api/auth/register", () => {
  it("rejects missing fields", async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("VALIDATION_ERROR");
  });

  it("rejects short username", async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "ab", email: "test@test.com", password: "12345678" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "validuser", email: "test@test.com", password: "123" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email", async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", email: "test@example.com", password: "password123" }),
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/auth/login", () => {
  it("rejects wrong password", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects non-existent email", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "noone@nowhere.com", password: "12345678" }),
    });
    expect(res.status).toBe(401);
  });
});
