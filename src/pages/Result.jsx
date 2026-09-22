import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import MapComponent from "./MapComponent";
import RouteDetails from "./RouteDetails";
import TripSummary from "./TripSummary";
import Stop from "./Stop";
import { useTrip } from "../context/TripContext";
import { useNow } from "../hooks/useNow";
import { getSignalStatus } from "../utils/tripMath";
import "../styles/Result.css";

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, stops, busNumber, busLocation, setSelectedIndex, calc } = useTrip();
  const now = useNow(1000);

  const { routeData } = trip;
  const details = routeData?.routeDetails;

  if (!routeData) {
    return (
      <div className="trip-page trip-page-empty">
        <div className="trip-card trip-empty">
          <h1>No results found</h1>
          <p>{trip.error || "We couldn't find that bus. Try searching again."}</p>
          <button type="button" className="trip-primary-btn" onClick={() => navigate("/mainpage")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to search
          </button>
        </div>
      </div>
    );
  }

  const ageSeconds = busLocation ? Math.max(0, (now - busLocation.timestamp) / 1000) : null;
  const signal = getSignalStatus(ageSeconds);

  return (
    <div className="trip-page">
      <section className="trip-map">
        <button
          type="button"
          className="trip-icon-btn trip-back"
          onClick={() => navigate("/mainpage")}
          aria-label="Back to search"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <MapComponent
          stops={stops}
          path={details?.path}
          busLocations={busLocation ? [busLocation] : []}
          statuses={calc.statuses}
          activeIndex={calc.activeIndex}
        />
      </section>

      <div className="trip-panel">
        <div className="trip-sheet-handle" aria-hidden="true" />

        <RouteDetails
          from={details?.fromLocation || "Unknown"}
          to={details?.toLocation || "Unknown"}
          route={details?.routeName}
          busNumber={busNumber}
          startTime={routeData.startTime}
          tripStartedAt={busLocation?.tripStartedAt}
        >
          <span className={`trip-chip is-${signal.tone}`}>
            <span className="dot" aria-hidden="true" /> {signal.label}
          </span>
        </RouteDetails>

        <TripSummary calc={calc} busLocation={busLocation} hasSignal={Boolean(busLocation)} isSelected={calc.trackingPickedStop} />

        <button
          type="button"
          className="trip-details-link"
          onClick={() => navigate("/result/details", { state: location.state })}
        >
          <span>
            <strong>Calculation details</strong>
            <small>See how distance, speed and ETA are worked out</small>
          </span>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <Stop
          stops={stops}
          statuses={calc.statuses}
          activeIndex={calc.activeIndex}
          distancesKm={calc.stopDistancesKm}
          onSelect={setSelectedIndex}
        />
      </div>
    </div>
  );
};

export default Result;
