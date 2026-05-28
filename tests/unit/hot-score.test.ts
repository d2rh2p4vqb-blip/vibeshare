import { describe, it, expect } from "vitest";
import { computeHotScore } from "@/lib/hot-score";

describe("computeHotScore", () => {
  it("returns 0 for no engagement", () => {
    expect(computeHotScore(0, 0, 0, 0)).toBe(0);
  });

  it("weights likes correctly", () => {
    expect(computeHotScore(10, 0, 0, 0)).toBe(20);
  });

  it("weights comments correctly", () => {
    expect(computeHotScore(0, 10, 0, 0)).toBe(30);
  });

  it("weights favorites correctly", () => {
    expect(computeHotScore(0, 0, 10, 0)).toBe(50);
  });

  it("weights views correctly", () => {
    expect(computeHotScore(0, 0, 0, 100)).toBe(10);
  });

  it("combines all factors", () => {
    const score = computeHotScore(5, 3, 2, 50);
    expect(score).toBe(5 * 2 + 3 * 3 + 2 * 5 + 50 * 0.1);
  });
});
