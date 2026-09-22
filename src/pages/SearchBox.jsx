import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faDiamondTurnRight,
  faBus,
  faLocationDot,
  faClock,
  faRoute,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import DirectionInput from "../pages/DirectionsInput";
import { API_URL, DEMO_BUS_NUMBERS } from "../config";
import { fetchWithTimeout, isTimeout, TIMEOUT_MESSAGE } from "../utils/http";
import "../styles/SearchBox.css";

const SearchBox = () => {
  const [busNumber, setBusNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDirections, setShowDirections] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // The demo note only appears once someone starts typing (or has typed something),
  // and goes away again as soon as one of the demo buses is in the box
  const typing = focused || busNumber !== "";
  const showDemoNote = typing && !DEMO_BUS_NUMBERS.includes(busNumber.trim());

  // One click fills in a bus that has live tracking
  const fillDemoBus = (number) => {
    setBusNumber(number);
    setError("");
    setHighlight(false);
    inputRef.current?.focus();
  };

  const fetchRouteData = async () => {
    if (isLoading) return;

    if (!busNumber.trim()) {
      setHighlight(true);
      setError("Please enter a valid bus number.");
      return;
    }

    setIsLoading(true);
    setError("");
    setHighlight(false);

    try {
      const response = await fetchWithTimeout(
        `${API_URL}/search?busNumber=${encodeURIComponent(busNumber.trim())}`
      );
      const result = await response.json();

      if (response.ok) {
        navigate("/result", { state: { routeData: result, busNumber: busNumber.trim() } });
      } else {
        setError(result.message || "Bus number not found.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(isTimeout(error) ? TIMEOUT_MESSAGE : "Failed to fetch data. Please try again.");
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div className={`search-wrap${showDirections ? " is-planning" : ""}${error ? " has-error" : ""}`}>
      {!showDirections && (
        <div className="search-hero">
          <h2 className="search-hero-title">Where&apos;s your bus?</h2>
          <p className="search-hero-sub">Enter a bus number to track it live</p>
        </div>
      )}

      <div className={`search-container${showDirections ? " is-planning" : ""}`}>
        {!showDirections ? (
          <>
            <input
              type="text"
              className={`search-box ${highlight ? "highlight" : ""}`}
              placeholder="Enter Bus Number..."
              aria-label="Bus number"
              ref={inputRef}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              value={busNumber}
              onChange={(e) => {
                setBusNumber(e.target.value);
                setHighlight(false);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchRouteData();
              }}
            />
            <FontAwesomeIcon icon={faBus} className="search-lead-icon" aria-hidden="true" />

            <button
              className="icon-btn search-btn"
              onClick={fetchRouteData}
              disabled={isLoading}
              title="Search bus"
              aria-label="Search bus"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>

            <button
              className="icon-btn direction-btn"
              onClick={() => setShowDirections(true)}
              title="Plan a route"
              aria-label="Plan a route"
            >
              <FontAwesomeIcon icon={faDiamondTurnRight} />
            </button>

            {error && <p className="error-message">{error}</p>}
            {isLoading && <p className="loading-text">Searching…</p>}
          </>
        ) : (
          <DirectionInput onClose={() => setShowDirections(false)} />
        )}
      </div>

      {!showDirections && (
        <div className="search-slot">
          <div className={`search-demo${showDemoNote ? " is-shown" : ""}`} role="note" aria-hidden={!showDemoNote}>
            <FontAwesomeIcon icon={faCircleInfo} className="search-demo-icon" aria-hidden="true" />
            <p>
              <strong>Demo:</strong> live tracking is available for{" "}
              {DEMO_BUS_NUMBERS.length > 1 ? "buses" : "bus"}{" "}
              {DEMO_BUS_NUMBERS.map((number, i) => (
                <span key={number}>
                  {i > 0 && (i === DEMO_BUS_NUMBERS.length - 1 ? " and " : ", ")}
                  <strong>{number}</strong>
                </span>
              ))}{" "}
              only (simulated location).
            </p>
            <div className="search-demo-actions">
              {DEMO_BUS_NUMBERS.map((number) => (
                <button
                  key={number}
                  type="button"
                  className="search-demo-btn"
                  tabIndex={showDemoNote ? 0 : -1}
                  onMouseDown={(e) => e.preventDefault()} // keep focus in the box so the note doesn't vanish mid-click
                  onClick={() => fillDemoBus(number)}
                >
                  Use {number}
                </button>
              ))}
            </div>
          </div>

          <ul className={`search-perks${!typing && !error ? " is-shown" : ""}`}>
            <li>
              <FontAwesomeIcon icon={faLocationDot} /> Live location
            </li>
            <li>
              <FontAwesomeIcon icon={faClock} /> Arrival time
            </li>
            <li>
              <FontAwesomeIcon icon={faRoute} /> Stop by stop
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
