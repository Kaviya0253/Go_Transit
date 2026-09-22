import Logo from '../components/LandingPage/Logo';
import SearchBox from '../pages/SearchBox';
import "../styles/MainBackground.css";

function MainPage() {
  return (
    <div className="main-page">
      <Logo />
      <SearchBox />
    </div>
  );
}

export default MainPage;