import { useEffect, useState } from "react";

// Re-renders the caller on an interval so "updated 5s ago" labels stay fresh
export const useNow = (intervalMs = 1000) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
};
