import { Link } from "react-router-dom";  // Import Link for navigation
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faClock, faBus } from "@fortawesome/free-solid-svg-icons";
import "../../styles/MainImage.css";
import Mainimage from "../../assets/Main_img.png";

function MainImage() {
  return (
    <div className="main-container justify-content-center">
      <div className="hero-art">
        <div className="Image_container">
          <img src={Mainimage} alt="Main Image" />
        </div>
        {/* Decorative icon badges floating around the picture */}
        <span className="hero-badge is-pin" aria-hidden="true"><FontAwesomeIcon icon={faLocationDot} /></span>
        <span className="hero-badge is-clock" aria-hidden="true"><FontAwesomeIcon icon={faClock} /></span>
        <span className="hero-badge is-bus" aria-hidden="true"><FontAwesomeIcon icon={faBus} /></span>
      </div>
      <div className="Text_container">
        <h5 className="main-text">No More Waiting, Only Perfect Timing</h5>
        <h2 className="slogon">Stop Guessing, Start Tracking</h2>
        <p>
          Track your everyday bus in real-time. Know exactly when it will arrive, so you can plan your journey without the hassle.
          No more guessing when to leave or standing at the bus stop for too long. With
          live updates, you&apos;ll always be on time.
        </p>
        <div className="hero-actions">
          {/* Button to navigate to MainPage */}
          <Link to="/mainpage">
            <button className="try-transit-button">Try Transit</button>
          </Link>
          <a className="hero-secondary" href="#how-it-works">See how it works</a>
        </div>
      </div>
    </div>
  );
}

export default MainImage;
