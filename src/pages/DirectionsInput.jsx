import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faArrowsUpDown,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import { API_URL, DEMO_BUS_NUMBERS } from "../config";
import { fetchWithTimeout, isTimeout, TIMEOUT_MESSAGE } from "../utils/http";
import "../styles/DirectionsInput.css";

const libraries = ["places"];

// True while the Google suggestion list is open with an item highlighted,
// so Enter picks that suggestion instead of starting a search
const isSuggestionHighlighted = () => {
  const item = document.querySelector(".pac-container .pac-item-selected");
  return Boolean(item && item.closest(".pac-container").style.display !== "none");
};

const DirectionInput = ({ onClose }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [swapTurns, setSwapTurns] = useState(0);
  const [focused, setFocused] = useState(false);
  const [demoRoutes, setDemoRoutes] = useState([]); // [{ busNumber, from, to }] for the demo buses
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  // Each demo bus runs one fixed route. Read the first and last stop of each from the backend,
  // so the note shows real names that the route search will match.
  useEffect(() => {
    const controller = new AbortController();

    Promise.all(
      DEMO_BUS_NUMBERS.map((busNumber) =>
        fetchWithTimeout(`${API_URL}/search?busNumber=${encodeURIComponent(busNumber)}`, {
          signal: controller.signal,
          timeoutMs: 8000,
        })
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => {
            const stops = data?.routeDetails?.stops;
            if (!Array.isArray(stops) || stops.length < 2) return null;
            const first = stops[0]?.name;
            const last = stops[stops.length - 1]?.name;
            return first && last ? { busNumber, from: first, to: last } : null;
          })
          // backend not running or slow: that bus just isn't suggested
          .catch(() => null)
      )
    ).then((routes) => setDemoRoutes(routes.filter(Boolean)));

    return () => controller.abort();
  }, []);

  const sameText = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const demoFilled = demoRoutes.some((r) => sameText(from, r.from) && sameText(to, r.to));
  // Like the bus number box: show the note once someone starts typing, hide it after a demo route is in
  const showDemoNote = (focused || from !== "" || to !== "") && !demoFilled;

  const fillDemoRoute = (route) => {
    setFrom(route.from);
    setTo(route.to);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setSwapTurns((turns) => turns + 1);
  };

  const sameStop = from.trim() !== "" && from.trim().toLowerCase() === to.trim().toLowerCase();
  const canSearch = from.trim() !== "" && to.trim() !== "" && !sameStop && !loading;

  const fetchRouteDetails = async () => {
    if (!canSearch) return;

    setLoading(true);
    try {
      const response = await fetchWithTimeout(`${API_URL}/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      const data = await response.json();

      if (response.ok) {
        // The trip page shows one bus: take the first bus running on a matching route
        // With several buses on the route, take the one that has not passed the From stop yet
        // and is closest to it; otherwise the first one
        const candidates = (data.routes || []).flatMap((route) =>
          (route.buses || []).map((b) => ({ ...b, fromStopIndex: route.fromStopIndex }))
        );
        const notPassed = candidates
          .filter((b) => b.busNumber != null && b.stopIndex != null && b.stopIndex <= b.fromStopIndex)
          .sort((a, b) => b.stopIndex - a.stopIndex);
        const bus = notPassed[0] || candidates.find((b) => b.busNumber != null);
        if (!bus) {
          navigate("/result", { state: { from, to, error: "No bus is running on this route right now." } });
        } else {
          const busResponse = await fetchWithTimeout(`${API_URL}/search?busNumber=${encodeURIComponent(bus.busNumber)}`);
          const routeData = await busResponse.json();
          navigate("/result", { state: { from, to, routeData, busNumber: String(bus.busNumber) } });
        }
      } else {
        navigate("/result", { state: { from, to, error: data.message } });
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
      navigate("/result", { state: { from, to, error: isTimeout(error) ? TIMEOUT_MESSAGE : "Error fetching data" } });
    }
    setLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !isSuggestionHighlighted()) {
      fetchRouteDetails();
    }
  };

  if (!isLoaded) {
    return (
      <div className="plan-card plan-loading" role="status">
        <span className="plan-spinner" aria-hidden="true" /> Loading maps…
      </div>
    );
  }

  return (
    <div className="plan-card">
      <header className="plan-header">
        <button type="button" className="plan-back" onClick={onClose} aria-label="Back to bus number search">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <h2 className="plan-title">Plan your trip</h2>
          <p className="plan-subtitle">Where are you starting, and where to?</p>
        </div>
      </header>

      <div className="plan-fields">
        <div className="plan-rail" aria-hidden="true">
          <span className="plan-dot is-from" />
          <span className="plan-line" />
          <span className="plan-dot is-to" />
        </div>

        <div
          className="plan-inputs"
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            // moving from one box to the other is not "leaving"
            if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
          }}
        >
          <Autocomplete
            onLoad={(autocomplete) => (window.fromAutocomplete = autocomplete)}
            onPlaceChanged={() => {
              const place = window.fromAutocomplete.getPlace();
              if (place && place.geometry) {
                setFrom(place.formatted_address);
              }
            }}
          >
            <input
              type="text"
              placeholder="Starting location"
              aria-label="Starting location"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onKeyDown={handleKeyPress}
              className="plan-input"
            />
          </Autocomplete>

          <Autocomplete
            onLoad={(autocomplete) => (window.toAutocomplete = autocomplete)}
            onPlaceChanged={() => {
              const place = window.toAutocomplete.getPlace();
              if (place && place.geometry) {
                setTo(place.formatted_address);
              }
            }}
          >
            <input
              type="text"
              placeholder="Destination"
              aria-label="Destination"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyDown={handleKeyPress}
              className="plan-input"
            />
          </Autocomplete>
        </div>

        <button type="button" className="plan-swap" onClick={handleSwap} aria-label="Swap start and destination">
          <FontAwesomeIcon icon={faArrowsUpDown} style={{ transform: `rotate(${swapTurns * 180}deg)` }} />
        </button>
      </div>

      {sameStop && (
        <p className="plan-hint" role="alert">
          Start and destination are the same. Choose two different places.
        </p>
      )}

      <button
        type="button"
        className="plan-submit"
        onClick={fetchRouteDetails}
        disabled={!canSearch}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="plan-spinner" aria-hidden="true" /> Searching…
          </>
        ) : (
          <>
            Find route <FontAwesomeIcon icon={faArrowRight} />
          </>
        )}
      </button>

      {/* Below the button on purpose: it opens and closes without moving the button */}
      <div className={`plan-demo${showDemoNote ? " is-shown" : ""}`} aria-hidden={!showDemoNote}>
        <div className="plan-demo-inner">
          <div className="plan-demo-box" role="note">
            <FontAwesomeIcon icon={faCircleInfo} className="plan-demo-icon" aria-hidden="true" />
            <div className="plan-demo-body">
              <p>
                <strong>Demo:</strong>{" "}
                {demoRoutes.length > 1
                  ? "these fixed routes are available:"
                  : demoRoutes.length === 1
                    ? "there is one fixed route:"
                    : `only the fixed routes of the demo buses (${DEMO_BUS_NUMBERS.join(", ")}) are available.`}
              </p>
              {demoRoutes.map((route) => (
                <div className="plan-demo-route" key={route.busNumber}>
                  <span>
                    <strong>{route.from}</strong> → <strong>{route.to}</strong> <em>bus {route.busNumber}</em>
                  </span>
                  <button
                    type="button"
                    className="plan-demo-btn"
                    tabIndex={showDemoNote ? 0 : -1}
                    onMouseDown={(e) => e.preventDefault()} // keep focus so the note doesn't close mid-click
                    onClick={() => fillDemoRoute(route)}
                  >
                    Use this route
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectionInput;
