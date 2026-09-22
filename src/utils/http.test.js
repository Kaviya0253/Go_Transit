import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchWithTimeout, isTimeout } from "./http";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchWithTimeout", () => {
  it("gives up with a TimeoutError when the server is too slow", async () => {
    // a server that never answers: only an abort ends the request
    vi.stubGlobal(
      "fetch",
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        })
    );

    const error = await fetchWithTimeout("/slow", { timeoutMs: 20 }).catch((e) => e);
    expect(isTimeout(error)).toBe(true);
  });

  it("returns the response when the server answers in time", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve({ ok: true, status: 200 }));

    const response = await fetchWithTimeout("/fast", { timeoutMs: 1000 });
    expect(response.ok).toBe(true);
  });

  it("lets the caller cancel, and that is not reported as a timeout", async () => {
    vi.stubGlobal(
      "fetch",
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        })
    );

    const caller = new AbortController();
    const pending = fetchWithTimeout("/x", { timeoutMs: 1000, signal: caller.signal }).catch((e) => e);
    caller.abort(new DOMException("cancelled", "AbortError"));

    const error = await pending;
    expect(error.name).toBe("AbortError");
    expect(isTimeout(error)).toBe(false);
  });
});
