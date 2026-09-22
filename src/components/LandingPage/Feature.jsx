import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs, faClock, faBell } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Feature.css";

const FEATURES = [
    { icon: faLocationCrosshairs, text: "Track your bus live" },
    { icon: faClock, text: "Get live arrival time of your bus at the bus stop" },
    { icon: faBell, text: "Never miss your bus again" },
];

function Feature() {
    return (
        <div className="feature-container" id="features">
            <h2 className="feature-heading">
                Why Wait At The<br />
                <span className="highlight">Bus Stop Ever Again</span>
            </h2>
            <div className="feature-list">
                {FEATURES.map(({ icon, text }) => (
                    <div className="feature-item" key={text}>
                        <span className="feature-icon" aria-hidden="true">
                            <FontAwesomeIcon icon={icon} />
                        </span>
                        <p>{text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Feature;
