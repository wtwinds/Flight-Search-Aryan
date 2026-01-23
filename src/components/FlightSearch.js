import React, { useState, useEffect } from "react";
import flights from "../data/flights.json";
import "./FlightSearch.css";

function FlightSearch() {
  const [step, setStep] = useState("home");

  const [flightNumber, setFlightNumber] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // ⏸ pause state

  const resetAll = () => {
    setResults([]);
    setSearched(false);
    setFlightNumber("");
    setSource("");
    setDestination("");
    setCurrentIndex(0);
    setIsPaused(false);
  };

  const handleSearch = () => {
    let found = [];

    // 🔢 Search by Flight Number
    if (step === "number") {
      if (!flightNumber.trim()) return;

      const match = flights.find(
        (f) =>
          f["Flight Number"].toLowerCase() === flightNumber.toLowerCase()
      );

      if (match) found = [match];
    }

    // 🛣️ Search by Route (multiple possible)
    if (step === "route") {
      if (!source.trim() || !destination.trim()) return;

      found = flights.filter(
        (f) =>
          f["Source"].toLowerCase() === source.toLowerCase() &&
          f["Destination"].toLowerCase() === destination.toLowerCase()
      );
    }

    setResults(found);
    setCurrentIndex(0);
    setSearched(true);
  };

  // 🔁 AUTO FADE SLIDE (pause-aware)
  useEffect(() => {
    if (results.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [results, isPaused]);

  const handleEnter = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const getStatusClass = (status) => {
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
      <p><b>Departure:</b> {flight["Departure Time"]}</p>
      <p><b>Arrival:</b> {flight["Arrival Time"]}</p>

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
      <h2 className="title">Flight Search</h2>

      {/* 🏠 HOME */}
      {step === "home" && (
        <div className="home-buttons">
          <button onClick={() => setStep("number")}>
            Search by Flight Number
          </button>
          <button onClick={() => setStep("route")}>
            Search by Route
          </button>
        </div>
      )}

      {/* 🔢 FLIGHT NUMBER */}
      {step === "number" && (
        <>
          <div className="search-box">
            <input
              type="text"
              placeholder="Enter Flight Number (eg: AI-702)"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              onKeyDown={handleEnter}
            />
            <button onClick={handleSearch}>Search</button>
          </div>

          <button
            className="back-btn"
            onClick={() => {
              resetAll();
              setStep("home");
            }}
          >
            ← Back
          </button>
        </>
      )}

      {/* 🛣️ ROUTE */}
      {step === "route" && (
        <>
          <div className="search-box route-box">
            <input
              type="text"
              placeholder="Source (eg: Delhi)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              onKeyDown={handleEnter}
            />

            <input
              type="text"
              placeholder="Destination (eg: Ahmedabad)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={handleEnter}
            />

            <button onClick={handleSearch}>Search</button>
          </div>

          <button
            className="back-btn"
            onClick={() => {
              resetAll();
              setStep("home");
            }}
          >
            ← Back
          </button>
        </>
      )}

      {/* ❌ NO RESULTS */}
      {searched && results.length === 0 && (
        <p className="error">❌ No flights found</p>
      )}

      {/* ✅ SINGLE RESULT */}
      {results.length === 1 && (
        <div className="result-card fade">
          {renderFlight(results[0])}
        </div>
      )}

      {/* ✨ MULTIPLE RESULTS (FADE + PAUSE ON HOVER) */}
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
