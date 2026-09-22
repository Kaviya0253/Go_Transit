import { describe, expect, it } from "vitest";
import {
  formatAgo,
  formatDistance,
  formatDuration,
  formatSpeed,
  getRouteProgress,
  getSignalStatus,
  haversineKm,
  toTimeMs,
} from "./tripMath";

describe("haversineKm", () => {
  it("is 0 for the same point", () => {
    expect(haversineKm(11.0, 76.9, 11.0, 76.9)).toBeCloseTo(0, 6);
  });

  it("measures one degree of latitude as about 111 km", () => {
    expect(haversineKm(11, 76.9, 12, 76.9)).toBeCloseTo(111.2, 0);
  });

  it("returns null when a coordinate is missing", () => {
    expect(haversineKm(11, undefined, 12, 76.9)).toBeNull();
  });
});

describe("toTimeMs", () => {
  it("reads ISO strings and epoch numbers", () => {
    expect(toTimeMs("2026-01-01T00:00:00.000Z")).toBe(Date.UTC(2026, 0, 1));
    expect(toTimeMs(1700000000000)).toBe(1700000000000);
  });

  it("gives null for empty or invalid values", () => {
    expect(toTimeMs(null)).toBeNull();
    expect(toTimeMs("not a date")).toBeNull();
  });
});

describe("getRouteProgress", () => {
  // Three stops about 1.1 km apart, heading north
  const stops = [
    { lat: 11.0, lng: 76.9 },
    { lat: 11.01, lng: 76.9 },
    { lat: 11.02, lng: 76.9 },
  ];

  it("has crossed nothing before the first stop", () => {
    expect(getRouteProgress({ latitude: 10.995, longitude: 76.9 }, stops).crossedCount).toBe(0);
  });

  it("has crossed the first stop when between stops 1 and 2", () => {
    expect(getRouteProgress({ latitude: 11.005, longitude: 76.9 }, stops).crossedCount).toBe(1);
  });

  it("has crossed every stop after the last one", () => {
    expect(getRouteProgress({ latitude: 11.03, longitude: 76.9 }, stops).crossedCount).toBe(3);
  });

  it("knows which stop the bus is at when it is within 100 m", () => {
    expect(getRouteProgress({ latitude: 11.0101, longitude: 76.9 }, stops).atIndex).toBe(1);
  });

  it("handles a missing bus or no stops", () => {
    expect(getRouteProgress(null, stops)).toEqual({ crossedCount: 0, atIndex: null });
    expect(getRouteProgress({ latitude: 11, longitude: 76.9 }, [])).toEqual({ crossedCount: 0, atIndex: null });
  });
});

describe("formatters", () => {
  it("formats durations", () => {
    expect(formatDuration(41)).toBe("41 sec");
    expect(formatDuration(600)).toBe("10 min");
    expect(formatDuration(3900)).toBe("1 hr 5 min");
    expect(formatDuration(NaN)).toBe("—");
  });

  it("formats distances in metres below 1 km", () => {
    expect(formatDistance(0.316)).toBe("316 m");
    expect(formatDistance(2.345)).toBe("2.3 km");
  });

  it("formats speed and time since an update", () => {
    expect(formatSpeed(37.54)).toBe("37.5 km/h");
    expect(formatAgo(2)).toBe("just now");
    expect(formatAgo(30)).toBe("30s ago");
    expect(formatAgo(150)).toBe("2 min ago");
  });
});

describe("getSignalStatus", () => {
  it("is live for fresh data, delayed for older, lost after two minutes", () => {
    expect(getSignalStatus(3).tone).toBe("live");
    expect(getSignalStatus(60).tone).toBe("warn");
    expect(getSignalStatus(300).tone).toBe("lost");
    expect(getSignalStatus(null).tone).toBe("idle");
  });
});
