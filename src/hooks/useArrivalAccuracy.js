import { useEffect, useState } from "react";

/**
 * Compares the first ETA shown for a stop with when the bus actually reached it.
 * Returns [{ index, name, predictedAt, actualAt }] (times in ms) sorted by stop order.
 */
export const useArrivalAccuracy = ({ stops, statuses, activeIndex, etaSeconds }) => {
  const [records, setRecords] = useState({});

  // Remember the first prediction made for each stop
  useEffect(() => {
    if (activeIndex == null || etaSeconds == null) return;

    setRecords((current) =>
      current[activeIndex]
        ? current
        : { ...current, [activeIndex]: { predictedAt: Date.now() + etaSeconds * 1000, actualAt: null } }
    );
  }, [activeIndex, etaSeconds]);

  // Stamp the actual arrival the first time the bus is at / past a predicted stop
  useEffect(() => {
    setRecords((current) => {
      let changed = false;
      const next = { ...current };

      Object.keys(current).forEach((key) => {
        if (!current[key].actualAt && statuses[key] && statuses[key] !== "upcoming") {
          next[key] = { ...current[key], actualAt: Date.now() };
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [statuses]);

  return Object.keys(records)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index) => ({ index, name: stops[index]?.name || `Stop ${index + 1}`, ...records[index] }));
};
