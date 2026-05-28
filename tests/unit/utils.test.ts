import { describe, it, expect, vi, afterEach } from "vitest";
import { formatNumber, timeAgo } from "@/lib/utils";

describe("formatNumber", () => {
  it("returns string for small numbers", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });

  it("formats thousands with k", () => {
    expect(formatNumber(1000)).toBe("1.0k");
    expect(formatNumber(1500)).toBe("1.5k");
    expect(formatNumber(9999)).toBe("10.0k");
  });

  it("formats ten-thousands with 万", () => {
    expect(formatNumber(10000)).toBe("1.0万");
    expect(formatNumber(12345)).toBe("1.2万");
    expect(formatNumber(100000)).toBe("10.0万");
  });
});

describe("timeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "刚刚" for less than 60 seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(timeAgo(new Date("2026-01-01T11:59:30Z"))).toBe("刚刚");
  });

  it("returns minutes ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(timeAgo(new Date("2026-01-01T11:55:00Z"))).toBe("5分钟前");
  });

  it("returns hours ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
    expect(timeAgo(new Date("2026-01-01T09:00:00Z"))).toBe("3小时前");
  });

  it("returns days ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-05T12:00:00Z"));
    expect(timeAgo(new Date("2026-01-01T12:00:00Z"))).toBe("4天前");
  });

  it("returns locale date for over 30 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
    const date = new Date("2026-01-01T12:00:00Z");
    expect(timeAgo(date)).toBe(date.toLocaleDateString("zh-CN"));
  });
});
