"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Station {
    id: number;
    name: string;
    transport_type: string;
}

interface FareEntry {
    id: number;
    origin_station_id: number;
    destination_station_id: number;
    origin_name: string;
    destination_name: string;
    sjt_fare: number;
    svc_fare: number;
}

const TRANSPORT_LINES = ["LRT1", "LRT2", "MRT3"];

function ArrowLeftIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
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

export default function FareMatrixPage() {
    const [transport, setTransport] = useState("LRT1");
    const [fareType, setFareType] = useState<"svc" | "sjt">("svc");
    const [stations, setStations] = useState<Station[]>([]);
    const [fares, setFares] = useState<FareEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchData = useCallback(async (transportType: string) => {
        setLoading(true);
        setError("");
        try {
            const [stationsRes, faresRes] = await Promise.all([
                fetch(`${API_URL}/stations?transport=${transportType}`),
                fetch(`${API_URL}/fare_matrix?transport=${transportType}`),
            ]);

            if (!stationsRes.ok || !faresRes.ok) throw new Error("Failed to load data");

            const stationsData: Station[] = await stationsRes.json();
            const faresData: FareEntry[] = await faresRes.json();

            setStations(stationsData);
            setFares(faresData);
        } catch {
            setError("Could not load fare data. Is the backend running?");
            setStations([]);
            setFares([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(transport);
    }, [transport, fetchData]);

    // Build a lookup: { originId: { destId: fare } }
    const fareMap: Record<number, Record<number, number>> = {};
    fares.forEach((f) => {
        if (!fareMap[f.origin_station_id]) fareMap[f.origin_station_id] = {};
        fareMap[f.origin_station_id][f.destination_station_id] = fareType === "svc" ? f.svc_fare : f.sjt_fare;
    });

    return (
        <>
            {/* Header */}
            <header className="site-header">
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link
                        href="/"
                        style={{
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <ArrowLeftIcon />
                    </Link>
                    <span className="header-logo-text">Fare Matrix</span>
                </div>
                <ThemeToggle />
            </header>

            {/* Main Content */}
            <main style={{ paddingTop: "56px" }}>
                <div
                    style={{
                        maxWidth: "1200px",
                        margin: "0 auto",
                        padding: "1.5rem 1.25rem",
                    }}
                    className="animate-fade-in-up"
                >
                    {/* Hero */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h1 className="hero-heading">Fare Matrix</h1>
                        <p className="hero-sub">
                            Complete station-to-station fare table for each rail line.
                        </p>
                    </div>

                    {/* Transport Tabs */}
                    <div style={{ marginBottom: "1.5rem" }}>
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

                    {/* Fare Type Tabs */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label className="section-label">Ticket Type</label>
                        <div className="transport-tabs">
                            <button
                                onClick={() => setFareType("svc")}
                                className={`transport-tab ${fareType === "svc" ? "active" : ""}`}
                            >
                                Beep Card
                            </button>
                            <button
                                onClick={() => setFareType("sjt")}
                                className={`transport-tab ${fareType === "sjt" ? "active" : ""}`}
                            >
                                Single Journey
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="error-message animate-scale-in">{error}</div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "3rem",
                                color: "var(--text-secondary)",
                            }}
                        >
                            <span className="spinner" style={{ marginRight: "0.5rem" }} />
                            Loading fare data...
                        </div>
                    )}

                    {/* Fare Table */}
                    {!loading && !error && stations.length > 0 && (
                        <div
                            style={{
                                overflowX: "auto",
                                borderRadius: "1rem",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.8125rem",
                                    fontFamily: "var(--font-inter), sans-serif",
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                padding: "0.875rem 1rem",
                                                textAlign: "left",
                                                background: "var(--bg-card)",
                                                color: "var(--accent)",
                                                fontWeight: 700,
                                                fontSize: "0.6875rem",
                                                letterSpacing: "0.1em",
                                                textTransform: "uppercase",
                                                borderBottom: "1px solid var(--border)",
                                                position: "sticky",
                                                left: 0,
                                                zIndex: 2,
                                                minWidth: "120px",
                                            }}
                                        >
                                            From ↓ / To →
                                        </th>
                                        {stations.map((s) => (
                                            <th
                                                key={s.id}
                                                style={{
                                                    padding: "0.875rem 0.625rem",
                                                    textAlign: "center",
                                                    background: "var(--bg-card)",
                                                    color: "var(--text-secondary)",
                                                    fontWeight: 600,
                                                    fontSize: "0.6875rem",
                                                    letterSpacing: "0.03em",
                                                    borderBottom: "1px solid var(--border)",
                                                    whiteSpace: "nowrap",
                                                    minWidth: "80px",
                                                }}
                                            >
                                                {s.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {stations.map((origin, rowIdx) => (
                                        <tr key={origin.id}>
                                            <td
                                                style={{
                                                    padding: "0.75rem 1rem",
                                                    fontWeight: 600,
                                                    color: "var(--text-primary)",
                                                    background:
                                                        rowIdx % 2 === 0
                                                            ? "var(--bg-card)"
                                                            : "var(--bg-elevated)",
                                                    borderBottom: "1px solid var(--border)",
                                                    whiteSpace: "nowrap",
                                                    position: "sticky",
                                                    left: 0,
                                                    zIndex: 1,
                                                }}
                                            >
                                                {origin.name}
                                            </td>
                                            {stations.map((dest) => {
                                                const fare =
                                                    fareMap[origin.id]?.[dest.id];
                                                const isSelf = origin.id === dest.id;
                                                return (
                                                    <td
                                                        key={dest.id}
                                                        style={{
                                                            padding: "0.75rem 0.625rem",
                                                            textAlign: "center",
                                                            background: isSelf
                                                                ? "rgba(0, 232, 123, 0.04)"
                                                                : rowIdx % 2 === 0
                                                                    ? "var(--bg-primary)"
                                                                    : "var(--bg-card)",
                                                            borderBottom: "1px solid var(--border)",
                                                            color: isSelf
                                                                ? "var(--text-muted)"
                                                                : fare !== undefined
                                                                    ? "var(--accent)"
                                                                    : "var(--text-muted)",
                                                            fontWeight: fare !== undefined ? 700 : 400,
                                                            fontVariantNumeric: "tabular-nums",
                                                        }}
                                                    >
                                                        {isSelf ? "—" : fare !== undefined ? `₱${fare.toFixed(2)}` : "—"}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && stations.length === 0 && (
                        <div
                            style={{
                                textAlign: "center",
                                padding: "3rem",
                                color: "var(--text-muted)",
                                fontSize: "0.875rem",
                            }}
                        >
                            No stations found for {transport}.
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
