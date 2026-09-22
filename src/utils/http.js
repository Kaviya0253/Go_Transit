// fetch() that gives up after a while. Without this, a slow or unreachable backend leaves the
// page on "Searching…" forever with no message.

export const fetchWithTimeout = (url, { timeoutMs = 10000, signal, ...options } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("The server took too long to respond", "TimeoutError")),
    timeoutMs
  );
  // a caller (e.g. a component that unmounted) can still cancel the request itself
  signal?.addEventListener("abort", () => controller.abort(signal.reason));

  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
};

export const isTimeout = (error) => error?.name === "TimeoutError";

export const TIMEOUT_MESSAGE = "The server is taking too long to respond. Please try again.";
