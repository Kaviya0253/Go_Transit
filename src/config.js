// Address of the backend API. Set VITE_API_URL when deploying (see .env.example).
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// The buses the backend simulator drives (my-backend/simulator.js). Only these have a moving
// position, so the search boxes suggest them. Keep this list in step with the simulator.
export const DEMO_BUS_NUMBERS = ["101"];
