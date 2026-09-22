import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus } from "@fortawesome/free-solid-svg-icons";
import { formatClock } from "../utils/tripMath";
import "../styles/RouteDetails.css";

const capitalizeFirstWord = (text) => {
  if (text && typeof text === "string" && text.length > 0) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
};

// children: extra chips (e.g. the live status) shown after the bus number
const RouteDetails = ({ from, to, route, busNumber, startTime, tripStartedAt, children }) => (
  <header className="route-details">
    <h1 className="route-title">
      <span>{capitalizeFirstWord(from)}</span>
      <span className="route-arrow" aria-hidden="true">→</span>
      <span className="sr-only"> to </span>
      <span>{capitalizeFirstWord(to)}</span>
    </h1>

    {route && <p className="route-via">Via {route}</p>}

    <div className="route-chips">
      {busNumber && (
        <span className="trip-chip is-bus">
          <FontAwesomeIcon icon={faBus} /> Bus {busNumber}
        </span>
      )}
      {tripStartedAt ? (
        <span className="trip-chip">Started {formatClock(tripStartedAt)}</span>
      ) : (
        startTime && <span className="trip-chip">Starts {startTime}</span>
      )}
      {children}
    </div>
  </header>
);

export default RouteDetails;
