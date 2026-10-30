import { describe, expect, it } from "vitest";
import {
  formatEventTime,
  formatTimeBucket,
  parseFixedOffset,
  timeBuckets,
  timeZoneLabel,
} from "../timeZone";
import { formatTimeInput, parseTimeRange } from "../timeline";

describe("specified UTC offset", () => {
  it("accepts only fixed whole-hour offsets in the supported range", () => {
    expect(parseFixedOffset("UTC-12")).toBe(-12);
    expect(parseFixedOffset("UTC+14")).toBe(14);
    expect(parseFixedOffset("UTC+0")).toBe(0);
    for (const value of ["UTC-13", "UTC+15", "UTC+01", "UTC+5:30", "UTC5", "UTC+foo"]) {
      expect(parseFixedOffset(value)).toBeUndefined();
    }
  });

  it("formats event times and facet buckets across date boundaries", () => {
    const instant = "2025-01-01T02:30:00.000Z";
    expect(formatEventTime(instant, "UTC-5")).toContain("21:30:00");
    expect(formatEventTime(instant, "UTC+8")).toContain("10:30:00");
    expect(timeZoneLabel("UTC-5")).toBe("UTC-5");
    const start = Date.parse("2025-01-01T05:00:00Z");
    expect(formatTimeBucket(`${start}/${start + 3_600_000}`, "UTC-5")).toContain("00:00");
  });

  it("aligns calendar buckets to the specified offset, without changing absolute instants", () => {
    const lo = Date.parse("2025-01-01T00:00:00Z");
    const hi = lo + 48 * 3_600_000;
    const buckets = timeBuckets(lo + 30 * 60_000, hi, "UTC-5");
    expect(buckets[0]).toEqual([lo, lo + 3_600_000]);
    const days = timeBuckets(lo, lo + 40 * 24 * 3_600_000, "UTC+8");
    expect(days[0][0]).toBe(Date.parse("2024-12-31T16:00:00Z"));
  });

  it("round-trips custom range inputs, including midnight and invalid dates", () => {
    const instant = new Date("2025-01-01T02:30:00.123Z");
    const input = formatTimeInput(instant, "UTC-5");
    expect(input).toBe("2024-12-31 21:30:00.123");
    expect(parseTimeRange(input, "2024-12-31 22:30", "UTC-5").start).toEqual(instant);
    expect(formatTimeInput(instant, "UTC+8")).toBe("2025-01-01 10:30:00.123");
    expect(() => parseTimeRange("2025-02-30 10:00", "2025-03-01 10:00", "UTC+8")).toThrow();
  });
});
