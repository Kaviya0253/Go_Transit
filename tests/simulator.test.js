import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// The backend is CommonJS, so load it the CommonJS way
const require = createRequire(import.meta.url);
const { smoothPath, removeDetours } = require("../my-backend/simulator.js");

const point = (latitude, longitude) => ({ latitude, longitude });

// About 111 m per 0.001 degrees of latitude
const straight = Array.from({ length: 20 }, (_, i) => point(11 + i * 0.001, 76.9));

describe("removeDetours", () => {
  it("leaves a straight route alone", () => {
    expect(removeDetours(straight)).toHaveLength(straight.length);
  });

  it("cuts a dead-end side street the bus goes down and back up", () => {
    // Along the road, 300 m down a side street, then back to the same spot and on
    const sideStreet = [point(11.0, 76.9), point(11.0, 76.903), point(11.0, 76.9)];
    const route = [...straight.slice(0, 5), ...sideStreet.slice(1), ...straight.slice(5)];
    const cleaned = removeDetours(route);

    expect(cleaned.length).toBeLessThan(route.length);
    // no point of the side street is left
    expect(cleaned.some((p) => p.longitude > 76.9005)).toBe(false);
  });
});

describe("smoothPath", () => {
  it("keeps the first and last point", () => {
    const zigzag = [point(11, 76.9), point(11.001, 76.9005), point(11.002, 76.9), point(11.003, 76.9005), point(11.004, 76.9)];
    const smooth = smoothPath(zigzag);

    expect(smooth[0]).toEqual(zigzag[0]);
    expect(smooth[smooth.length - 1]).toEqual(zigzag[zigzag.length - 1]);
  });

  it("makes the path smoother: more points and gentler turns", () => {
    const corner = [point(11, 76.9), point(11.002, 76.9), point(11.002, 76.902)];
    const smooth = smoothPath(corner);
    expect(smooth.length).toBeGreaterThan(corner.length);
  });

  it("drops points that are bunched together", () => {
    const bunched = [point(11, 76.9), point(11.00001, 76.9), point(11.00002, 76.9), point(11.005, 76.9)];
    // rounds = 0 shows only the clean-up step
    expect(smoothPath(bunched, 12, 0)).toHaveLength(2);
  });
});
