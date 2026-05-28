import { describe, it, expect } from "vitest";

const BASE = "http://localhost:3000";

describe("GET /api/projects", () => {
  it("returns paginated project list", async () => {
    const res = await fetch(`${BASE}/api/projects?page=1&limit=3`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("projects");
    expect(data).toHaveProperty("total");
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("totalPages");
    expect(Array.isArray(data.projects)).toBe(true);
  });

  it("respects limit parameter", async () => {
    const res = await fetch(`${BASE}/api/projects?limit=2`);
    const data = await res.json();
    expect(data.projects.length).toBeLessThanOrEqual(2);
  });

  it("filters by type", async () => {
    const res = await fetch(`${BASE}/api/projects?type=WEBSITE`);
    const data = await res.json();
    for (const p of data.projects) {
      expect(p.type).toBe("WEBSITE");
    }
  });
});

describe("GET /api/projects/[id] (non-existent)", () => {
  it("returns 404 for invalid id", async () => {
    const res = await fetch(`${BASE}/api/projects/nonexistent123`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/leaderboard", () => {
  it("returns ranked list", async () => {
    const res = await fetch(`${BASE}/api/leaderboard?period=all&type=all`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("GET /api/search", () => {
  it("returns empty for blank query", async () => {
    const res = await fetch(`${BASE}/api/search?q=&type=projects`);
    const data = await res.json();
    expect(data.results).toEqual([]);
  });
});
