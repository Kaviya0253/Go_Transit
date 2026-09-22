// Gives up on a promise that takes too long, so a slow or unreachable database can't
// leave a request hanging forever (the app would just show "Searching…" with no answer).

class TimeoutError extends Error {
  constructor(ms) {
    super(`Timed out after ${ms} ms`);
    this.name = "TimeoutError";
  }
}

const withTimeout = (promise, ms = 8000) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

module.exports = { withTimeout, TimeoutError };
