import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

// IATA → ICAO map
const airlineMap = {
  AI: "AIC",
  "6E": "IGO",
  UK: "VTI",
  SG: "SEJ",
  G8: "GOW",
  IX: "AXB"
};

app.get("/live/flights", async (req, res) => {
  try {
    let keyword = req.query.keyword?.toUpperCase().trim();
    if (!keyword) return res.json([]);

    if (airlineMap[keyword]) {
      keyword = airlineMap[keyword];
    }

    const response = await axios.get(
      "https://opensky-network.org/api/states/all"
    );

    const states = response.data.states || [];

    const flights = states
      .filter((s) => s[1])
      .filter((s) => s[1].trim().includes(keyword))
      .slice(0, 10)
      .map((s) => ({
        callsign: s[1].trim(),
        country: s[2],
        altitude: s[7],
        velocity: s[9]
      }));

    res.json(flights);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.listen(5000, () =>
  console.log("✅ OpenSky backend running on port 5000")
);
