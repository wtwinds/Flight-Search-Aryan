import React, { useState, useEffect } from "react";
import "./FlightSearch.css";

function FlightSearch() {
  const [step, setStep] = useState("home");

  const [flightNumber, setFlightNumber] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const resetAll = () => {
    setResults([]);
    setSearched(false);
    setFlightNumber("");
    setSource("");
    setDestination("");
    setCurrentIndex(0);
    setIsPaused(false);
    setStep("home");
  };

  // 🔍 SEARCH HANDLER (FIXED)
  const handleSearch = async () => {
    if (step !== "number") return;
    if (!flightNumber.trim()) return;

    setSearched(false);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/live/flights?keyword=${flightNumber.trim()}`
      );

      if (!response.ok) throw new Error("API fail");

      const data = await response.json();

      const mapped = Array.isArray(data)
        ? data.map((f) => ({
            "Airline": "Live Flight",
            "Flight Number": f.callsign || "N/A",
            "Source": f.country || "Unknown",
            "Destination": f.country || "Unknown",
            "Departure Date": "Live",
            "Departure Time": f.altitude
              ? `${Math.round(f.altitude)} m`
              : "N/A",
            "Arrival Time": f.velocity
              ? `${Math.round(f.velocity)} m/s`
              : "N/A",
            "Flight Status": "Live",
            "Ticket Price (INR)": "N/A"
          }))
        : [];

      setResults(mapped);
    } catch {
      setResults([]);
    }

    setCurrentIndex(0);
    setSearched(true);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // 🔁 AUTO SLIDE
  useEffect(() => {
    if (results.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [results, isPaused]);

  const getStatusClass = (status) => {
    if (status === "Live") return "status ontime";
    if (status === "On Time") return "status ontime";
    if (status === "Delayed") return "status delayed";
    return "status cancelled";
  };

  const renderFlight = (flight) => (
    <>
      <h3>{flight["Airline"]}</h3>

      <p><b>Flight:</b> {flight["Flight Number"]}</p>
      <p><b>Route:</b> {flight["Source"]} → {flight["Destination"]}</p>
      <p><b>Date:</b> {flight["Departure Date"]}</p>
      <p><b>Altitude:</b> {flight["Departure Time"]}</p>
      <p><b>Speed:</b> {flight["Arrival Time"]}</p>

      <p>
        <b>Status:</b>{" "}
        <span className={getStatusClass(flight["Flight Status"])}>
          {flight["Flight Status"]}
        </span>
      </p>

      <p><b>Price:</b> ₹{flight["Ticket Price (INR)"]}</p>
    </>
  );

  return (
    <div className="flight-card">
      <h2 className="title">Flight Analytic</h2>

      {step === "home" && (
        <div className="home-buttons">
          <button onClick={() => setStep("number")}>
            Search by Flight Number
          </button>
        </div>
      )}

      {step === "number" && (
        <>
          <div className="search-box">
            <input
              type="text"
              placeholder="AI / 6E / AIC / IGO"
              value={flightNumber}
              onChange={(e) =>
                setFlightNumber(e.target.value.toUpperCase())
              }
              onKeyDown={handleEnter}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <button className="back-btn" onClick={resetAll}>
            ← Back
          </button>
        </>
      )}

      {searched && results.length === 0 && (
        <p className="error">❌ No flights found</p>
      )}

      {results.length === 1 && (
        <div className="result-card fade">
          {renderFlight(results[0])}
        </div>
      )}

      {results.length > 1 && (
        <div
          className="fade-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div key={currentIndex} className="result-card fade">
            {renderFlight(results[currentIndex])}
          </div>

          <div className="carousel-indicator">
            {currentIndex + 1} of {results.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
