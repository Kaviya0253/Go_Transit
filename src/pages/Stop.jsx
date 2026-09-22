import { useCallback, useEffect, useRef } from "react";
import { formatDistance } from "../utils/tripMath";
import "../styles/Stop.css";

// Space kept above the current stop so the bus icon on the line stays visible
const SCROLL_OFFSET = 56;

const Stop = ({ stops, statuses, activeIndex, distancesKm, onSelect }) => {
  const listRef = useRef(null);
  const hasScrolled = useRef(false);

  // The stop the bus is at or heading to next (not the stop a passenger picked to track)
  const busStopIndex = (() => {
    const found = (statuses || []).findIndex((status) => status === "at" || status === "upcoming");
    return found === -1 ? Math.max((stops?.length || 1) - 1, 0) : found;
  })();

  // Bring the bus's stop to the top of the list
  const scrollToBus = useCallback(
    (behavior = "smooth") => {
      const list = listRef.current;
      const row = list?.children[busStopIndex];
      if (!list || !row) return;
      list.scrollTo({ top: Math.max(row.offsetTop - SCROLL_OFFSET, 0), behavior });
    },
    [busStopIndex]
  );

  // On first load and each time the bus moves on to the next stop.
  // Tapping a stop to track it does not move the list.
  useEffect(() => {
    scrollToBus(hasScrolled.current ? "smooth" : "auto");
    hasScrolled.current = true;
  }, [scrollToBus]);

  if (!stops || stops.length === 0) {
    return (
      <section className="trip-card stops-card">
        <h2 className="stops-title">Stops</h2>
        <p className="stops-empty">No stops available for this route.</p>
      </section>
    );
  }

  const lastCrossed = statuses.lastIndexOf("crossed");

  return (
    <section className="trip-card stops-card">
      <div className="stops-head">
        <h2 className="stops-title">Stops</h2>
        <span className="stops-count">{stops.length} stops · tap one to track it</span>
        <button type="button" className="stops-jump" onClick={() => scrollToBus()}>
          📍 Bus position
        </button>
      </div>
      <p className="stops-hint">👆 Tap any upcoming stop to track when the bus will reach it</p>

      <ol className="stop-timeline" ref={listRef}>
        {stops.map((stop, index) => {
          const status = statuses[index] || "upcoming";
          const isActive = index === activeIndex;
          const distance = distancesKm[index];

          let meta = "";
          if (status === "crossed") meta = "Passed";
          else if (status === "at") meta = "Bus is here";
          else if (distance != null) meta = `${formatDistance(distance)} away`;

          // The bus sits on the line between the last passed stop and the next one
          const busOnLine = index === lastCrossed && statuses[index + 1] === "upcoming";

          const classes = [
            "stop-row",
            `is-${status}`,
            isActive ? "is-active" : "",
            index === stops.length - 1 ? "is-last" : "",
            busOnLine ? "has-bus" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={index} className={classes}>
              <button
                type="button"
                className="stop-button"
                onClick={() => onSelect(index)}
                disabled={status === "crossed"}
                title={status === "crossed" ? "The bus has already passed this stop" : undefined}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="stop-marker" aria-hidden="true" />
                <span className="stop-info">
                  <span className="stop-name">{stop.name || `Stop ${index + 1}`}</span>
                  {meta && <span className="stop-meta">{meta}</span>}
                </span>
                {isActive ? (
                  <span className="stop-badge">Tracking</span>
                ) : (
                  status !== "crossed" && <span className="stop-track-hint">Track</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default Stop;
