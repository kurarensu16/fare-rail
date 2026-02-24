"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Station {
  id: number;
  name: string;
  transport_type: string;
}

const TRANSPORT_LINES = ["LRT1", "LRT2", "MRT3"];
const PASSENGER_TYPES = [
  { value: "regular", label: "Adult", icon: "person" },
  { value: "student", label: "Student", icon: "school" },
  { value: "senior", label: "PWD/Senior", icon: "accessible" },
];

// SVG Icons
function TrainIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <circle cx="8" cy="15" r="1" />
      <circle cx="16" cy="15" r="1" />
      <path d="M8 19l-2 3" />
      <path d="M16 19l2 3" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" />
    </svg>
  );
}

function StudentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10l-10-5L2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

function AccessibleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v6" />
      <path d="M8 10h8" />
      <path d="M9 18a4 4 0 108 0" />
      <path d="M8 12l-2 8" />
      <path d="M16 12l2 8" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function DestinationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2l7 12H5L12 2z" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="7" y="5" width="10" height="4" rx="1" fill="#0b0f14" />
      <circle cx="8.5" cy="13" r="1" fill="#0b0f14" />
      <circle cx="12" cy="13" r="1" fill="#0b0f14" />
      <circle cx="15.5" cy="13" r="1" fill="#0b0f14" />
      <circle cx="8.5" cy="17" r="1" fill="#0b0f14" />
      <circle cx="12" cy="17" r="1" fill="#0b0f14" />
      <circle cx="15.5" cy="17" r="1" fill="#0b0f14" />
    </svg>
  );
}



function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "0.4rem",
        cursor: "pointer",
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

const passengerIcons: Record<string, React.ReactNode> = {
  person: <PersonIcon />,
  school: <StudentIcon />,
  accessible: <AccessibleIcon />,
};

export default function Home() {
  const [transport, setTransport] = useState("LRT1");
  const [stations, setStations] = useState<Station[]>([]);
  const [originId, setOriginId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [passengerType, setPassengerType] = useState("regular");
  const [ticketType, setTicketType] = useState("svc");
  const [fare, setFare] = useState<number | null>(null);
  const [originalFare, setOriginalFare] = useState<number | null>(null);
  const [discountRate, setDiscountRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState("");

  const fetchStations = useCallback(async (transportType: string) => {
    setLoadingStations(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/stations?transport=${transportType}`);
      if (!res.ok) throw new Error("Failed to load stations");
      const data: Station[] = await res.json();
      setStations(data);
    } catch {
      setError("Could not load stations. Is the backend running?");
      setStations([]);
    } finally {
      setLoadingStations(false);
    }
  }, []);

  useEffect(() => {
    setOriginId("");
    setDestinationId("");
    setFare(null);
    setError("");
    fetchStations(transport);
  }, [transport, fetchStations]);

  const handleSwap = () => {
    setOriginId(destinationId);
    setDestinationId(originId);
    setFare(null);
    setError("");
  };

  const handleCalculate = async () => {
    setError("");
    setFare(null);

    if (!originId || !destinationId) {
      setError("Please select both origin and destination stations.");
      return;
    }
    if (originId === destinationId) {
      setError("Origin and destination cannot be the same station.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/calculate_fare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_station_id: parseInt(originId),
          destination_station_id: parseInt(destinationId),
          passenger_type: passengerType,
          ticket_type: ticketType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to calculate fare");
      }

      const data = await res.json();
      setFare(data.fare);
      setOriginalFare(data.original_fare);
      setDiscountRate(data.discount_rate);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDiscounted = passengerType !== "regular";
  const originName = stations.find((s) => s.id === parseInt(originId))?.name;
  const destName = stations.find((s) => s.id === parseInt(destinationId))?.name;

  return (
    <>
      {/* Header */}
      <header className="site-header">
        <div className="header-logo">
          <div className="header-logo-icon">
            <TrainIcon size={18} />
          </div>
          <span className="header-logo-text">FareRail</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/fare-matrix"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Fare Matrix
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: "56px" }}>
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            padding: "1.5rem 1.25rem",
          }}
          className="animate-fade-in-up"
        >
          {/* Hero */}
          <div style={{ marginBottom: "1.75rem" }}>
            <h1 className="hero-heading">Plan Your Journey</h1>
            <p className="hero-sub">
              Calculate train fares across Metro Manila&apos;s rail network
              instantly.
            </p>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Transport Line */}
            <div>
              <label className="section-label">Select Line</label>
              <div className="transport-tabs">
                {TRANSPORT_LINES.map((line) => (
                  <button
                    key={line}
                    onClick={() => setTransport(line)}
                    className={`transport-tab ${transport === line ? "active" : ""}`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            {/* Station Selector Card */}
            <div>
              <label className="section-label">Origin</label>
              <div className="station-selector">
                {/* Origin */}
                <div className="station-row">
                  <div className="station-icon origin">
                    <LocationIcon />
                  </div>
                  <select
                    className="station-select"
                    value={originId}
                    onChange={(e) => {
                      setOriginId(e.target.value);
                      setFare(null);
                      setError("");
                    }}
                    disabled={loadingStations}
                  >
                    <option value="">
                      {loadingStations
                        ? "Loading..."
                        : "Select origin station"}
                    </option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <span className="station-chevron">
                    <ChevronDown />
                  </span>
                </div>

                {/* Divider + Swap */}
                <div className="station-divider">
                  <div className="station-divider-line" />
                  <button
                    onClick={handleSwap}
                    className="swap-button"
                    title="Swap stations"
                    disabled={!originId && !destinationId}
                  >
                    <SwapIcon />
                  </button>
                  <div className="station-divider-line" />
                </div>

                {/* Destination */}
                <div className="station-row">
                  <div className="station-icon destination">
                    <DestinationIcon />
                  </div>
                  <select
                    className="station-select"
                    value={destinationId}
                    onChange={(e) => {
                      setDestinationId(e.target.value);
                      setFare(null);
                      setError("");
                    }}
                    disabled={loadingStations}
                  >
                    <option value="">
                      {loadingStations
                        ? "Loading..."
                        : "Select destination station"}
                    </option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <span className="station-chevron">
                    <ChevronDown />
                  </span>
                </div>
              </div>
            </div>

            {/* Passenger Type */}
            <div>
              <label className="section-label">Passenger Type</label>
              <div className="passenger-cards">
                {PASSENGER_TYPES.map((pt) => (
                  <button
                    key={pt.value}
                    onClick={() => {
                      setPassengerType(pt.value);
                      setFare(null);
                      setError("");
                    }}
                    className={`passenger-card ${passengerType === pt.value ? "active" : ""}`}
                  >
                    <div className="passenger-card-icon">
                      {passengerIcons[pt.icon]}
                    </div>
                    <span className="passenger-card-label">{pt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Type */}
            <div>
              <label className="section-label">Ticket Type</label>
              <div className="transport-tabs">
                <button
                  onClick={() => { setTicketType("svc"); setFare(null); setError(""); }}
                  className={`transport-tab ${ticketType === "svc" ? "active" : ""}`}
                >
                  Beep Card
                </button>
                <button
                  onClick={() => { setTicketType("sjt"); setFare(null); setError(""); }}
                  className={`transport-tab ${ticketType === "sjt" ? "active" : ""}`}
                >
                  Single Journey
                </button>
              </div>
            </div>

            {/* Calculate */}
            <button
              onClick={handleCalculate}
              disabled={loading || !originId || !destinationId}
              className="calc-button"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Calculating...
                </>
              ) : (
                <>
                  {/* <CalcIcon /> */}
                  Calculate Fare
                </>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="error-message animate-scale-in">{error}</div>
            )}

            {/* Result */}
            {fare !== null && (
              <div className="fare-result animate-scale-in">
                {originName && destName && (
                  <p className="fare-route">
                    {originName} → {destName}
                  </p>
                )}
                <p className="fare-amount">₱{fare.toFixed(2)}</p>
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  <span className="discount-badge">
                    {ticketType === "svc" ? "Beep Card" : "Single Journey"}
                  </span>
                  {isDiscounted && originalFare !== null && (
                    <span className="discount-badge" style={{ background: "rgba(255,152,0,0.12)", color: "#ff9800", borderColor: "rgba(255,152,0,0.15)" }}>
                      {Math.round(discountRate * 100)}% off — was ₱{originalFare.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

    </>
  );
}
