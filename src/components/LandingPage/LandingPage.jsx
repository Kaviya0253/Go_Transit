import Logo from "./Logo";
import Footer from "./Footer";
import MainImage from "./MainImage";
import Feature from "./Feature";
import Guide from "./Guide";
import { Link } from "react-router-dom";  // Import Link for navigation
import "../../styles/LandingPage.css";
import "../../styles/LandingTheme.css";

function LandingPage() {
  return (
    <div className="landing-container">
      <Logo>
        <nav className="lp-nav" aria-label="Page sections">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/mainpage" className="lp-nav-cta">Try Transit</Link>
        </nav>
      </Logo>
      <MainImage />
      <Feature />
      <Guide />
      <Footer />
    </div>
  );
}

export default LandingPage;
