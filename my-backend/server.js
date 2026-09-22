const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
const { withTimeout, TimeoutError } = require("./withTimeout");

// Load Firebase Service Account Key
// On a host, put the key's JSON in the FIREBASE_SERVICE_ACCOUNT variable; locally the file is used.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://go-transit-48399-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

const app = express();
// FRONTEND_URL: the website's address (several allowed, comma separated). Unset = allow any (local use).
app.use(cors({ origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((u) => u.trim()) : true }));
app.use(express.json());

const port = process.env.PORT || 5000;
const db = admin.database();

// Read one database location, giving up after a few seconds instead of waiting forever
const readOnce = (ref) => withTimeout(ref.once("value"), 8000);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend is running successfully!");
});

// ✅ Fetch Bus Route Data (by Number or From-To Location)
app.get("/search", async (req, res) => {
  const { from, to, busNumber } = req.query;

  try {
    if (busNumber) {
      // Buses are stored under their number, so read that one record directly (much faster than a query).
      const id = String(busNumber).trim();
      if (!/^[A-Za-z0-9_-]+$/.test(id)) {
        return res.status(404).json({ message: "Bus number not found" });
      }

      const busSnapshot = await readOnce(db.ref(`routes/buses/${id}`));
      if (!busSnapshot.exists()) {
        return res.status(404).json({ message: "Bus number not found" });
      }

      const busData = busSnapshot.val();
      const routeSnapshot = await readOnce(db.ref(`routes/${busData.route_id}`));
      const routeData = routeSnapshot.exists() ? routeSnapshot.val() : {};
      const locationData = busData.location || {};

      return res.status(200).json({
        message: "✅ Route found",
        busNumber: busData.bus_number || "Not Available",
        startTime: busData.start_time || "Not Available",
        routeDetails: {
          routeName: routeData.route_name || "Not Available",
          fromLocation: routeData.from_location || "Not Available",
          toLocation: routeData.to_location || "Not Available",
          stops: routeData.stops ? Object.values(routeData.stops) : [],
          path: routeData.path ? Object.values(routeData.path) : [],
        },
        location: {
          latitude: locationData.latitude || "Not Available",
          longitude: locationData.longitude || "Not Available",
          timestamp: locationData.timestamp || "Not Available",
        },
      });
    } else if (from && to) {
      const routesRef = db.ref("routes");
      const snapshot = await readOnce(routesRef);

      if (!snapshot.exists()) {
        return res.status(404).json({ message: "No routes found" });
      }

      const routes = snapshot.val();
      // Place suggestions look like "Gandhipuram, Coimbatore, Tamil Nadu, India": keep the first part,
      // then match a stop by exact name first, or by a partial name ("Saibaba" finds "Saibaba Colony").
      const cleanName = (text) => String(text).split(",")[0].trim().toLowerCase();
      const shownName = (text) => String(text).split(",")[0].trim();
      const findStop = (names, query) => {
        const q = cleanName(query);
        const exact = names.indexOf(q);
        if (exact !== -1 || q.length < 3) return exact;
        // (skip stops with no name: an empty name would otherwise "match" every search)
        return names.findIndex((n) => n && (n.includes(q) || q.includes(n)));
      };
      const wrongWay = []; // routes that have both places but run the other direction

      const foundRoutes = await Promise.all(
        Object.keys(routes)
          .filter(routeId => routeId !== "buses")
          .map(async (routeId) => {
            const route = routes[routeId];
            if (!route.stops) return null;

            const stops = Object.values(route.stops);
            // a stop with a missing name must not crash the whole search
            const stopNames = stops.map((stop) => String(stop?.name ?? "").trim().toLowerCase());
            const fromIndex = findStop(stopNames, from);
            const toIndex = findStop(stopNames, to);

            if (fromIndex !== -1 && toIndex !== -1 && fromIndex > toIndex) {
              wrongWay.push(route.route_name);
            }
            if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) return null;

            const busDetails = await Promise.all(
              Object.keys(routes.buses || {}).map(async (busId) => {
                const bus = routes.buses[busId];
                if (bus.route_id !== routeId) return null;

                const locationRef = db.ref(`routes/buses/${busId}/location`);
                const locationSnapshot = await readOnce(locationRef);
                const locationData = locationSnapshot.exists() ? locationSnapshot.val() : {};

                // Nearest stop to the bus, so the app can pick a bus that has not passed "from" yet
                let stopIndex = null;
                if (Number.isFinite(Number(locationData.latitude)) && Number.isFinite(Number(locationData.longitude))) {
                  let best = Infinity;
                  stops.forEach((stop, i) => {
                    const d = (stop.lat - locationData.latitude) ** 2 + (stop.lng - locationData.longitude) ** 2;
                    if (d < best) {
                      best = d;
                      stopIndex = i;
                    }
                  });
                }

                return {
                  busNumber: bus.bus_number,
                  stopIndex,
                  startTime: bus.start_time,
                  location: {
                    latitude: locationData.latitude || "Not Available",
                    longitude: locationData.longitude || "Not Available",
                    timestamp: locationData.timestamp || "Not Available",
                  },
                };
              })
            );

            return {
              routeId,
              routeName: route.route_name,
              from: route.from_location,
              to: route.to_location,
              stops: stops.slice(fromIndex, toIndex + 1),
              fromStopIndex: fromIndex,
              buses: busDetails.filter(Boolean),
            };
          })
      );

      const validRoutes = foundRoutes.filter(Boolean);
      if (validRoutes.length === 0) {
        if (wrongWay.length > 0) {
          return res.status(404).json({
            message: `No bus runs from ${shownName(from)} to ${shownName(to)}. The ${wrongWay[0]} route runs the other way (${shownName(to)} to ${shownName(from)}).`,
          });
        }
        return res.status(404).json({ message: "No routes found for given locations" });
      }

      return res.status(200).json({ routes: validRoutes });
    } else {
      return res.status(400).json({
        message: "Please provide either a bus number or both 'from' and 'to' locations",
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error instanceof TimeoutError) {
      return res.status(504).json({ message: "The database is taking too long to respond. Please try again in a moment." });
    }
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
  require("./simulator")(db);
});