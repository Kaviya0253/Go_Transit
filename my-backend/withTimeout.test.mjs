import { describe, it, expect } from "vitest";
import { withTimeout, TimeoutError } from "./withTimeout.js";

describe("withTimeout", () => {
  it("gives the result when the database answers in time", async () => {
    await expect(withTimeout(Promise.resolve("ok"), 200)).resolves.toBe("ok");
  });

  it("rejects with a TimeoutError when the database never answers", async () => {
    const never = new Promise(() => {});
    await expect(withTimeout(never, 30)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("passes on the database's own error unchanged", async () => {
    await expect(withTimeout(Promise.reject(new Error("permission denied")), 200)).rejects.toThrow(
      "permission denied"
    );
  });
});
