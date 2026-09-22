import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import LandingPage from "./components/LandingPage/LandingPage";
import MainPage from "./pages/MainPage";
import DirectionInput from "./pages/DirectionsInput";
import SearchBox from "./pages/SearchBox";
import MapComponent from "./pages/MapComponent";
import TripLayout from "./pages/TripLayout";
import Result from "./pages/Result";
import TripDetails from "./pages/TripDetails";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} 
      libraries={["places"]} // Include places library
    >
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/mainpage" element={<MainPage />} />
            <Route path="/directions" element={<DirectionInput />} />
            <Route path="/searchbox" element={<SearchBox />} />
            <Route path="/map" element={<MapComponent />} />
            <Route path="/result" element={<TripLayout />}>
              <Route index element={<Result />} />
              <Route path="details" element={<TripDetails />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </LoadScript>
  );
}

export default App;