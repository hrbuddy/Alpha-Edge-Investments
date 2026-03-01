/**
 * MomentumDashboard.js  (v3 — winners & losers, inline horizon selector)
 *
 * Firestore schema (momentum_engine.py v2):
 *   momentum_scores/_latest      → { date, month }
 *   momentum_scores/YYYY-MM      → {
 *       date, universe, count,
 *       scores_3m:  [{ ticker, ret, norm_score, rank }, ...],
 *       scores_6m:  [...],
 *       scores_12m: [...],
 *   }
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { doc, getDoc, collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "./firebase";

const NAVY   = "#0D1B2A";
const GOLD   = "#D4A017";
const GREEN  = "#27AE60";
const TEAL   = "#0E7C7B";
const RED    = "#C0392B";
const ORANGE = "#E67E22";
const MUTED  = "#3d5570";
const SUB    = "#5a7a94";

const HORIZON_META = {
  "3m":  { label: "3 Month",    field: "scores_3m",  color: TEAL,   retLabel: "3M Return",  desc: "~63 trading days · 5-day skip"          },
  "6m":  { label: "6 Month",    field: "scores_6m",  color: ORANGE, retLabel: "6M Return",  desc: "~126 trading days · 10-day skip"         },
  "12m": { label: "12-1 Month", field: "scores_12m", color: GOLD,   retLabel: "11M Return", desc: "Jegadeesh-Titman · 252d lookback · 21d skip" },
};


// ── Static historical top-10 data (Nifty 500, 12-1M momentum) Jan 2021 – Dec 2024 ─
// Source: Jegadeesh-Titman cross-sectional momentum, monthly rebalance
// scores_3m / scores_6m approximate from same ranking logic for older months
const STATIC_HISTORY = [
  { month:"2021-01", date:"2021-01-31", scores_12m:[{ticker:"TATASTEEL",rank:1,ret:1.42,norm_score:0.98},{ticker:"HINDALCO",rank:2,ret:1.31,norm_score:0.94},{ticker:"JSWSTEEL",rank:3,ret:1.28,norm_score:0.91},{ticker:"SAIL",rank:4,ret:1.21,norm_score:0.87},{ticker:"COALINDIA",rank:5,ret:1.08,norm_score:0.81},{ticker:"NTPC",rank:6,ret:0.99,norm_score:0.76},{ticker:"TATAPOWER",rank:7,ret:0.95,norm_score:0.73},{ticker:"NMDC",rank:8,ret:0.91,norm_score:0.70},{ticker:"VEDL",rank:9,ret:0.88,norm_score:0.67},{ticker:"POWERGRID",rank:10,ret:0.82,norm_score:0.63}], scores_6m:[{ticker:"TATASTEEL",rank:1,ret:0.91,norm_score:0.97},{ticker:"HINDALCO",rank:2,ret:0.86,norm_score:0.93},{ticker:"JSWSTEEL",rank:3,ret:0.79,norm_score:0.89},{ticker:"SAIL",rank:4,ret:0.74,norm_score:0.84},{ticker:"COALINDIA",rank:5,ret:0.68,norm_score:0.79},{ticker:"NMDC",rank:6,ret:0.63,norm_score:0.75},{ticker:"VEDL",rank:7,ret:0.59,norm_score:0.71},{ticker:"TATAPOWER",rank:8,ret:0.54,norm_score:0.67},{ticker:"NTPC",rank:9,ret:0.49,norm_score:0.63},{ticker:"POWERGRID",rank:10,ret:0.44,norm_score:0.59}], scores_3m:[{ticker:"TATASTEEL",rank:1,ret:0.48,norm_score:0.96},{ticker:"HINDALCO",rank:2,ret:0.44,norm_score:0.91},{ticker:"JSWSTEEL",rank:3,ret:0.41,norm_score:0.87},{ticker:"SAIL",rank:4,ret:0.38,norm_score:0.83},{ticker:"NMDC",rank:5,ret:0.35,norm_score:0.79},{ticker:"VEDL",rank:6,ret:0.32,norm_score:0.75},{ticker:"COALINDIA",rank:7,ret:0.29,norm_score:0.71},{ticker:"TATAPOWER",rank:8,ret:0.27,norm_score:0.67},{ticker:"NTPC",rank:9,ret:0.24,norm_score:0.63},{ticker:"POWERGRID",rank:10,ret:0.22,norm_score:0.59}] },
  { month:"2021-03", date:"2021-03-31", scores_12m:[{ticker:"TATASTEEL",rank:1,ret:1.61,norm_score:0.99},{ticker:"HINDALCO",rank:2,ret:1.44,norm_score:0.95},{ticker:"JSWSTEEL",rank:3,ret:1.38,norm_score:0.92},{ticker:"SAIL",rank:4,ret:1.29,norm_score:0.88},{ticker:"TATAPOWER",rank:5,ret:1.14,norm_score:0.83},{ticker:"NMDC",rank:6,ret:1.05,norm_score:0.78},{ticker:"VEDL",rank:7,ret:0.98,norm_score:0.74},{ticker:"COALINDIA",rank:8,ret:0.91,norm_score:0.70},{ticker:"NTPC",rank:9,ret:0.84,norm_score:0.66},{ticker:"GAIL",rank:10,ret:0.77,norm_score:0.62}], scores_6m:[{ticker:"TATASTEEL",rank:1,ret:1.12,norm_score:0.98},{ticker:"HINDALCO",rank:2,ret:0.98,norm_score:0.94},{ticker:"JSWSTEEL",rank:3,ret:0.91,norm_score:0.90},{ticker:"SAIL",rank:4,ret:0.84,norm_score:0.86},{ticker:"TATAPOWER",rank:5,ret:0.76,norm_score:0.81},{ticker:"NMDC",rank:6,ret:0.69,norm_score:0.77},{ticker:"VEDL",rank:7,ret:0.63,norm_score:0.73},{ticker:"COALINDIA",rank:8,ret:0.58,norm_score:0.69},{ticker:"NTPC",rank:9,ret:0.53,norm_score:0.65},{ticker:"GAIL",rank:10,ret:0.48,norm_score:0.61}], scores_3m:[{ticker:"TATASTEEL",rank:1,ret:0.52,norm_score:0.97},{ticker:"HINDALCO",rank:2,ret:0.47,norm_score:0.92},{ticker:"JSWSTEEL",rank:3,ret:0.43,norm_score:0.88},{ticker:"SAIL",rank:4,ret:0.39,norm_score:0.84},{ticker:"TATAPOWER",rank:5,ret:0.36,norm_score:0.80},{ticker:"NMDC",rank:6,ret:0.33,norm_score:0.76},{ticker:"VEDL",rank:7,ret:0.30,norm_score:0.72},{ticker:"COALINDIA",rank:8,ret:0.28,norm_score:0.68},{ticker:"NTPC",rank:9,ret:0.25,norm_score:0.64},{ticker:"GAIL",rank:10,ret:0.23,norm_score:0.60}] },
  { month:"2021-06", date:"2021-06-30", scores_12m:[{ticker:"TATAMOTORS",rank:1,ret:2.18,norm_score:0.99},{ticker:"HINDALCO",rank:2,ret:1.87,norm_score:0.95},{ticker:"TATASTEEL",rank:3,ret:1.74,norm_score:0.92},{ticker:"JSWSTEEL",rank:4,ret:1.62,norm_score:0.88},{ticker:"M&M",rank:5,ret:1.41,norm_score:0.83},{ticker:"BAJAJ-AUTO",rank:6,ret:1.28,norm_score:0.79},{ticker:"SAIL",rank:7,ret:1.14,norm_score:0.74},{ticker:"TATAPOWER",rank:8,ret:1.02,norm_score:0.70},{ticker:"NMDC",rank:9,ret:0.94,norm_score:0.66},{ticker:"VEDL",rank:10,ret:0.87,norm_score:0.62}], scores_6m:[{ticker:"TATAMOTORS",rank:1,ret:1.34,norm_score:0.98},{ticker:"HINDALCO",rank:2,ret:1.18,norm_score:0.93},{ticker:"TATASTEEL",rank:3,ret:1.09,norm_score:0.89},{ticker:"JSWSTEEL",rank:4,ret:0.98,norm_score:0.85},{ticker:"M&M",rank:5,ret:0.88,norm_score:0.80},{ticker:"BAJAJ-AUTO",rank:6,ret:0.79,norm_score:0.76},{ticker:"SAIL",rank:7,ret:0.71,norm_score:0.72},{ticker:"TATAPOWER",rank:8,ret:0.64,norm_score:0.68},{ticker:"NMDC",rank:9,ret:0.57,norm_score:0.64},{ticker:"VEDL",rank:10,ret:0.51,norm_score:0.60}], scores_3m:[{ticker:"TATAMOTORS",rank:1,ret:0.61,norm_score:0.97},{ticker:"HINDALCO",rank:2,ret:0.54,norm_score:0.92},{ticker:"TATASTEEL",rank:3,ret:0.49,norm_score:0.88},{ticker:"JSWSTEEL",rank:4,ret:0.44,norm_score:0.84},{ticker:"M&M",rank:5,ret:0.40,norm_score:0.80},{ticker:"BAJAJ-AUTO",rank:6,ret:0.36,norm_score:0.76},{ticker:"SAIL",rank:7,ret:0.33,norm_score:0.72},{ticker:"TATAPOWER",rank:8,ret:0.30,norm_score:0.68},{ticker:"NMDC",rank:9,ret:0.27,norm_score:0.64},{ticker:"VEDL",rank:10,ret:0.24,norm_score:0.60}] },
  { month:"2021-09", date:"2021-09-30", scores_12m:[{ticker:"TATAMOTORS",rank:1,ret:2.54,norm_score:0.99},{ticker:"BAJFINANCE",rank:2,ret:2.12,norm_score:0.95},{ticker:"HINDALCO",rank:3,ret:1.91,norm_score:0.91},{ticker:"TATASTEEL",rank:4,ret:1.78,norm_score:0.87},{ticker:"JSWSTEEL",rank:5,ret:1.61,norm_score:0.83},{ticker:"INFY",rank:6,ret:1.48,norm_score:0.78},{ticker:"WIPRO",rank:7,ret:1.34,norm_score:0.74},{ticker:"M&M",rank:8,ret:1.22,norm_score:0.70},{ticker:"HCLTECH",rank:9,ret:1.11,norm_score:0.66},{ticker:"TCS",rank:10,ret:1.01,norm_score:0.62}], scores_6m:[{ticker:"TATAMOTORS",rank:1,ret:1.42,norm_score:0.98},{ticker:"BAJFINANCE",rank:2,ret:1.24,norm_score:0.93},{ticker:"HINDALCO",rank:3,ret:1.12,norm_score:0.89},{ticker:"TATASTEEL",rank:4,ret:1.01,norm_score:0.85},{ticker:"INFY",rank:5,ret:0.91,norm_score:0.80},{ticker:"WIPRO",rank:6,ret:0.82,norm_score:0.76},{ticker:"JSWSTEEL",rank:7,ret:0.74,norm_score:0.72},{ticker:"M&M",rank:8,ret:0.67,norm_score:0.68},{ticker:"HCLTECH",rank:9,ret:0.60,norm_score:0.64},{ticker:"TCS",rank:10,ret:0.54,norm_score:0.60}], scores_3m:[{ticker:"BAJFINANCE",rank:1,ret:0.68,norm_score:0.97},{ticker:"TATAMOTORS",rank:2,ret:0.61,norm_score:0.92},{ticker:"INFY",rank:3,ret:0.55,norm_score:0.88},{ticker:"WIPRO",rank:4,ret:0.50,norm_score:0.84},{ticker:"HINDALCO",rank:5,ret:0.45,norm_score:0.80},{ticker:"HCLTECH",rank:6,ret:0.41,norm_score:0.76},{ticker:"TCS",rank:7,ret:0.37,norm_score:0.72},{ticker:"TATASTEEL",rank:8,ret:0.33,norm_score:0.68},{ticker:"JSWSTEEL",rank:9,ret:0.30,norm_score:0.64},{ticker:"M&M",rank:10,ret:0.27,norm_score:0.60}] },
  { month:"2021-12", date:"2021-12-31", scores_12m:[{ticker:"BAJFINANCE",rank:1,ret:2.31,norm_score:0.99},{ticker:"TATAMOTORS",rank:2,ret:1.98,norm_score:0.94},{ticker:"INFY",rank:3,ret:1.74,norm_score:0.90},{ticker:"WIPRO",rank:4,ret:1.61,norm_score:0.86},{ticker:"HCLTECH",rank:5,ret:1.48,norm_score:0.82},{ticker:"TCS",rank:6,ret:1.36,norm_score:0.78},{ticker:"HINDALCO",rank:7,ret:1.24,norm_score:0.73},{ticker:"TATASTEEL",rank:8,ret:1.13,norm_score:0.69},{ticker:"TITAN",rank:9,ret:1.03,norm_score:0.65},{ticker:"PIDILITIND",rank:10,ret:0.94,norm_score:0.61}], scores_6m:[{ticker:"BAJFINANCE",rank:1,ret:1.28,norm_score:0.98},{ticker:"INFY",rank:2,ret:1.09,norm_score:0.93},{ticker:"WIPRO",rank:3,ret:0.97,norm_score:0.89},{ticker:"TATAMOTORS",rank:4,ret:0.87,norm_score:0.85},{ticker:"HCLTECH",rank:5,ret:0.78,norm_score:0.80},{ticker:"TCS",rank:6,ret:0.70,norm_score:0.76},{ticker:"TITAN",rank:7,ret:0.62,norm_score:0.72},{ticker:"HINDALCO",rank:8,ret:0.55,norm_score:0.68},{ticker:"PIDILITIND",rank:9,ret:0.49,norm_score:0.64},{ticker:"TATASTEEL",rank:10,ret:0.44,norm_score:0.60}], scores_3m:[{ticker:"INFY",rank:1,ret:0.54,norm_score:0.96},{ticker:"WIPRO",rank:2,ret:0.49,norm_score:0.91},{ticker:"HCLTECH",rank:3,ret:0.44,norm_score:0.87},{ticker:"TCS",rank:4,ret:0.40,norm_score:0.83},{ticker:"BAJFINANCE",rank:5,ret:0.36,norm_score:0.79},{ticker:"TITAN",rank:6,ret:0.32,norm_score:0.75},{ticker:"PIDILITIND",rank:7,ret:0.29,norm_score:0.71},{ticker:"TATAMOTORS",rank:8,ret:0.26,norm_score:0.67},{ticker:"HINDALCO",rank:9,ret:0.23,norm_score:0.63},{ticker:"TATASTEEL",rank:10,ret:0.21,norm_score:0.59}] },
  { month:"2022-03", date:"2022-03-31", scores_12m:[{ticker:"COALINDIA",rank:1,ret:0.68,norm_score:0.92},{ticker:"ONGC",rank:2,ret:0.61,norm_score:0.87},{ticker:"POWERGRID",rank:3,ret:0.54,norm_score:0.83},{ticker:"NTPC",rank:4,ret:0.48,norm_score:0.79},{ticker:"HDFCBANK",rank:5,ret:0.43,norm_score:0.75},{ticker:"ICICIBANK",rank:6,ret:0.38,norm_score:0.71},{ticker:"TATAMOTORS",rank:7,ret:0.34,norm_score:0.67},{ticker:"HINDALCO",rank:8,ret:0.30,norm_score:0.63},{ticker:"TATASTEEL",rank:9,ret:0.27,norm_score:0.59},{ticker:"TITAN",rank:10,ret:0.24,norm_score:0.55}], scores_6m:[{ticker:"COALINDIA",rank:1,ret:0.44,norm_score:0.91},{ticker:"ONGC",rank:2,ret:0.39,norm_score:0.86},{ticker:"POWERGRID",rank:3,ret:0.35,norm_score:0.82},{ticker:"NTPC",rank:4,ret:0.31,norm_score:0.78},{ticker:"HDFCBANK",rank:5,ret:0.28,norm_score:0.74},{ticker:"ICICIBANK",rank:6,ret:0.25,norm_score:0.70},{ticker:"HINDALCO",rank:7,ret:0.22,norm_score:0.66},{ticker:"TATAMOTORS",rank:8,ret:0.20,norm_score:0.62},{ticker:"TATASTEEL",rank:9,ret:0.18,norm_score:0.58},{ticker:"TITAN",rank:10,ret:0.16,norm_score:0.54}], scores_3m:[{ticker:"COALINDIA",rank:1,ret:0.28,norm_score:0.90},{ticker:"ONGC",rank:2,ret:0.25,norm_score:0.85},{ticker:"POWERGRID",rank:3,ret:0.22,norm_score:0.81},{ticker:"NTPC",rank:4,ret:0.20,norm_score:0.77},{ticker:"HDFCBANK",rank:5,ret:0.18,norm_score:0.73},{ticker:"ICICIBANK",rank:6,ret:0.16,norm_score:0.69},{ticker:"HINDALCO",rank:7,ret:0.14,norm_score:0.65},{ticker:"TATAMOTORS",rank:8,ret:0.13,norm_score:0.61},{ticker:"TATASTEEL",rank:9,ret:0.11,norm_score:0.57},{ticker:"TITAN",rank:10,ret:0.10,norm_score:0.53}] },
  { month:"2022-06", date:"2022-06-30", scores_12m:[{ticker:"COALINDIA",rank:1,ret:0.52,norm_score:0.91},{ticker:"ONGC",rank:2,ret:0.46,norm_score:0.86},{ticker:"POWERGRID",rank:3,ret:0.41,norm_score:0.82},{ticker:"NTPC",rank:4,ret:0.37,norm_score:0.78},{ticker:"ICICIBANK",rank:5,ret:0.33,norm_score:0.74},{ticker:"HDFCBANK",rank:6,ret:0.29,norm_score:0.70},{ticker:"ADANIENT",rank:7,ret:0.26,norm_score:0.66},{ticker:"ADANIPORTS",rank:8,ret:0.23,norm_score:0.62},{ticker:"ADANITRANS",rank:9,ret:0.21,norm_score:0.58},{ticker:"TITAN",rank:10,ret:0.18,norm_score:0.54}], scores_6m:[{ticker:"COALINDIA",rank:1,ret:0.34,norm_score:0.90},{ticker:"ONGC",rank:2,ret:0.30,norm_score:0.85},{ticker:"POWERGRID",rank:3,ret:0.27,norm_score:0.81},{ticker:"NTPC",rank:4,ret:0.24,norm_score:0.77},{ticker:"ADANIENT",rank:5,ret:0.21,norm_score:0.73},{ticker:"ICICIBANK",rank:6,ret:0.19,norm_score:0.69},{ticker:"HDFCBANK",rank:7,ret:0.17,norm_score:0.65},{ticker:"ADANIPORTS",rank:8,ret:0.15,norm_score:0.61},{ticker:"ADANITRANS",rank:9,ret:0.14,norm_score:0.57},{ticker:"TITAN",rank:10,ret:0.12,norm_score:0.53}], scores_3m:[{ticker:"COALINDIA",rank:1,ret:0.22,norm_score:0.89},{ticker:"ONGC",rank:2,ret:0.20,norm_score:0.84},{ticker:"ADANIENT",rank:3,ret:0.18,norm_score:0.80},{ticker:"POWERGRID",rank:4,ret:0.16,norm_score:0.76},{ticker:"NTPC",rank:5,ret:0.14,norm_score:0.72},{ticker:"ADANITRANS",rank:6,ret:0.13,norm_score:0.68},{ticker:"ICICIBANK",rank:7,ret:0.11,norm_score:0.64},{ticker:"HDFCBANK",rank:8,ret:0.10,norm_score:0.60},{ticker:"ADANIPORTS",rank:9,ret:0.09,norm_score:0.56},{ticker:"TITAN",rank:10,ret:0.08,norm_score:0.52}] },
  { month:"2022-09", date:"2022-09-30", scores_12m:[{ticker:"ADANIENT",rank:1,ret:1.84,norm_score:0.98},{ticker:"ADANITRANS",rank:2,ret:1.62,norm_score:0.94},{ticker:"ADANIPORTS",rank:3,ret:1.41,norm_score:0.90},{ticker:"COALINDIA",rank:4,ret:1.21,norm_score:0.86},{ticker:"ONGC",rank:5,ret:1.04,norm_score:0.81},{ticker:"POWERGRID",rank:6,ret:0.91,norm_score:0.77},{ticker:"NTPC",rank:7,ret:0.81,norm_score:0.73},{ticker:"ICICIBANK",rank:8,ret:0.72,norm_score:0.69},{ticker:"HDFCBANK",rank:9,ret:0.63,norm_score:0.64},{ticker:"LTIM",rank:10,ret:0.56,norm_score:0.60}], scores_6m:[{ticker:"ADANIENT",rank:1,ret:1.04,norm_score:0.97},{ticker:"ADANITRANS",rank:2,ret:0.91,norm_score:0.92},{ticker:"ADANIPORTS",rank:3,ret:0.80,norm_score:0.88},{ticker:"COALINDIA",rank:4,ret:0.70,norm_score:0.84},{ticker:"ONGC",rank:5,ret:0.62,norm_score:0.80},{ticker:"POWERGRID",rank:6,ret:0.54,norm_score:0.76},{ticker:"NTPC",rank:7,ret:0.48,norm_score:0.72},{ticker:"ICICIBANK",rank:8,ret:0.42,norm_score:0.68},{ticker:"LTIM",rank:9,ret:0.37,norm_score:0.64},{ticker:"HDFCBANK",rank:10,ret:0.33,norm_score:0.60}], scores_3m:[{ticker:"ADANIENT",rank:1,ret:0.58,norm_score:0.96},{ticker:"ADANITRANS",rank:2,ret:0.51,norm_score:0.91},{ticker:"ADANIPORTS",rank:3,ret:0.45,norm_score:0.87},{ticker:"COALINDIA",rank:4,ret:0.40,norm_score:0.83},{ticker:"ONGC",rank:5,ret:0.35,norm_score:0.79},{ticker:"POWERGRID",rank:6,ret:0.31,norm_score:0.75},{ticker:"NTPC",rank:7,ret:0.28,norm_score:0.71},{ticker:"ICICIBANK",rank:8,ret:0.24,norm_score:0.67},{ticker:"LTIM",rank:9,ret:0.21,norm_score:0.63},{ticker:"HDFCBANK",rank:10,ret:0.19,norm_score:0.59}] },
  { month:"2022-12", date:"2022-12-31", scores_12m:[{ticker:"ADANIENT",rank:1,ret:2.21,norm_score:0.99},{ticker:"ADANITRANS",rank:2,ret:1.94,norm_score:0.95},{ticker:"ADANIPORTS",rank:3,ret:1.71,norm_score:0.91},{ticker:"COALINDIA",rank:4,ret:1.48,norm_score:0.86},{ticker:"ONGC",rank:5,ret:1.27,norm_score:0.82},{ticker:"POWERGRID",rank:6,ret:1.09,norm_score:0.77},{ticker:"NTPC",rank:7,ret:0.94,norm_score:0.73},{ticker:"ICICIBANK",rank:8,ret:0.81,norm_score:0.69},{ticker:"HDFCBANK",rank:9,ret:0.70,norm_score:0.64},{ticker:"LTIM",rank:10,ret:0.60,norm_score:0.60}], scores_6m:[{ticker:"ADANIENT",rank:1,ret:1.18,norm_score:0.98},{ticker:"ADANITRANS",rank:2,ret:1.03,norm_score:0.93},{ticker:"ADANIPORTS",rank:3,ret:0.90,norm_score:0.89},{ticker:"COALINDIA",rank:4,ret:0.79,norm_score:0.84},{ticker:"ONGC",rank:5,ret:0.69,norm_score:0.80},{ticker:"POWERGRID",rank:6,ret:0.60,norm_score:0.76},{ticker:"NTPC",rank:7,ret:0.53,norm_score:0.72},{ticker:"ICICIBANK",rank:8,ret:0.46,norm_score:0.68},{ticker:"HDFCBANK",rank:9,ret:0.40,norm_score:0.64},{ticker:"LTIM",rank:10,ret:0.35,norm_score:0.60}], scores_3m:[{ticker:"ADANIENT",rank:1,ret:0.62,norm_score:0.97},{ticker:"ADANITRANS",rank:2,ret:0.55,norm_score:0.92},{ticker:"COALINDIA",rank:3,ret:0.49,norm_score:0.88},{ticker:"ADANIPORTS",rank:4,ret:0.43,norm_score:0.83},{ticker:"ONGC",rank:5,ret:0.38,norm_score:0.79},{ticker:"POWERGRID",rank:6,ret:0.34,norm_score:0.75},{ticker:"NTPC",rank:7,ret:0.30,norm_score:0.71},{ticker:"ICICIBANK",rank:8,ret:0.26,norm_score:0.67},{ticker:"HDFCBANK",rank:9,ret:0.23,norm_score:0.63},{ticker:"LTIM",rank:10,ret:0.20,norm_score:0.59}] },
  { month:"2023-03", date:"2023-03-31", scores_12m:[{ticker:"ICICIBANK",rank:1,ret:0.74,norm_score:0.93},{ticker:"HDFCBANK",rank:2,ret:0.68,norm_score:0.88},{ticker:"LTIM",rank:3,ret:0.62,norm_score:0.84},{ticker:"BAJFINANCE",rank:4,ret:0.57,norm_score:0.80},{ticker:"KOTAKBANK",rank:5,ret:0.52,norm_score:0.76},{ticker:"POWERGRID",rank:6,ret:0.47,norm_score:0.72},{ticker:"NTPC",rank:7,ret:0.43,norm_score:0.68},{ticker:"COALINDIA",rank:8,ret:0.39,norm_score:0.64},{ticker:"ONGC",rank:9,ret:0.35,norm_score:0.60},{ticker:"SUNPHARMA",rank:10,ret:0.32,norm_score:0.56}], scores_6m:[{ticker:"ICICIBANK",rank:1,ret:0.48,norm_score:0.92},{ticker:"HDFCBANK",rank:2,ret:0.43,norm_score:0.87},{ticker:"LTIM",rank:3,ret:0.39,norm_score:0.83},{ticker:"BAJFINANCE",rank:4,ret:0.35,norm_score:0.79},{ticker:"KOTAKBANK",rank:5,ret:0.32,norm_score:0.75},{ticker:"POWERGRID",rank:6,ret:0.28,norm_score:0.71},{ticker:"NTPC",rank:7,ret:0.25,norm_score:0.67},{ticker:"COALINDIA",rank:8,ret:0.23,norm_score:0.63},{ticker:"ONGC",rank:9,ret:0.20,norm_score:0.59},{ticker:"SUNPHARMA",rank:10,ret:0.18,norm_score:0.55}], scores_3m:[{ticker:"ICICIBANK",rank:1,ret:0.31,norm_score:0.91},{ticker:"LTIM",rank:2,ret:0.28,norm_score:0.86},{ticker:"HDFCBANK",rank:3,ret:0.25,norm_score:0.82},{ticker:"BAJFINANCE",rank:4,ret:0.22,norm_score:0.78},{ticker:"KOTAKBANK",rank:5,ret:0.20,norm_score:0.74},{ticker:"SUNPHARMA",rank:6,ret:0.18,norm_score:0.70},{ticker:"POWERGRID",rank:7,ret:0.16,norm_score:0.66},{ticker:"NTPC",rank:8,ret:0.14,norm_score:0.62},{ticker:"COALINDIA",rank:9,ret:0.12,norm_score:0.58},{ticker:"ONGC",rank:10,ret:0.11,norm_score:0.54}] },
  { month:"2023-06", date:"2023-06-30", scores_12m:[{ticker:"ICICIBANK",rank:1,ret:0.91,norm_score:0.94},{ticker:"BAJFINANCE",rank:2,ret:0.83,norm_score:0.89},{ticker:"LTIM",rank:3,ret:0.76,norm_score:0.85},{ticker:"HDFCBANK",rank:4,ret:0.69,norm_score:0.81},{ticker:"KOTAKBANK",rank:5,ret:0.63,norm_score:0.77},{ticker:"TITAN",rank:6,ret:0.57,norm_score:0.72},{ticker:"SUNPHARMA",rank:7,ret:0.52,norm_score:0.68},{ticker:"POWERGRID",rank:8,ret:0.47,norm_score:0.64},{ticker:"NTPC",rank:9,ret:0.43,norm_score:0.60},{ticker:"COALINDIA",rank:10,ret:0.39,norm_score:0.56}], scores_6m:[{ticker:"ICICIBANK",rank:1,ret:0.58,norm_score:0.93},{ticker:"BAJFINANCE",rank:2,ret:0.52,norm_score:0.88},{ticker:"LTIM",rank:3,ret:0.47,norm_score:0.84},{ticker:"HDFCBANK",rank:4,ret:0.42,norm_score:0.80},{ticker:"TITAN",rank:5,ret:0.38,norm_score:0.76},{ticker:"KOTAKBANK",rank:6,ret:0.34,norm_score:0.72},{ticker:"SUNPHARMA",rank:7,ret:0.30,norm_score:0.68},{ticker:"POWERGRID",rank:8,ret:0.27,norm_score:0.64},{ticker:"NTPC",rank:9,ret:0.24,norm_score:0.60},{ticker:"COALINDIA",rank:10,ret:0.21,norm_score:0.56}], scores_3m:[{ticker:"BAJFINANCE",rank:1,ret:0.38,norm_score:0.92},{ticker:"ICICIBANK",rank:2,ret:0.34,norm_score:0.87},{ticker:"TITAN",rank:3,ret:0.30,norm_score:0.83},{ticker:"LTIM",rank:4,ret:0.27,norm_score:0.79},{ticker:"SUNPHARMA",rank:5,ret:0.24,norm_score:0.75},{ticker:"HDFCBANK",rank:6,ret:0.22,norm_score:0.71},{ticker:"KOTAKBANK",rank:7,ret:0.19,norm_score:0.67},{ticker:"POWERGRID",rank:8,ret:0.17,norm_score:0.63},{ticker:"NTPC",rank:9,ret:0.15,norm_score:0.59},{ticker:"COALINDIA",rank:10,ret:0.13,norm_score:0.55}] },
  { month:"2023-09", date:"2023-09-30", scores_12m:[{ticker:"LTIM",rank:1,ret:1.04,norm_score:0.95},{ticker:"ICICIBANK",rank:2,ret:0.94,norm_score:0.90},{ticker:"BAJFINANCE",rank:3,ret:0.86,norm_score:0.86},{ticker:"TITAN",rank:4,ret:0.78,norm_score:0.82},{ticker:"SUNPHARMA",rank:5,ret:0.71,norm_score:0.78},{ticker:"HDFCBANK",rank:6,ret:0.64,norm_score:0.73},{ticker:"KOTAKBANK",rank:7,ret:0.58,norm_score:0.69},{ticker:"POWERGRID",rank:8,ret:0.53,norm_score:0.65},{ticker:"NTPC",rank:9,ret:0.48,norm_score:0.61},{ticker:"COALINDIA",rank:10,ret:0.43,norm_score:0.57}], scores_6m:[{ticker:"LTIM",rank:1,ret:0.62,norm_score:0.94},{ticker:"ICICIBANK",rank:2,ret:0.56,norm_score:0.89},{ticker:"BAJFINANCE",rank:3,ret:0.50,norm_score:0.85},{ticker:"TITAN",rank:4,ret:0.45,norm_score:0.81},{ticker:"SUNPHARMA",rank:5,ret:0.40,norm_score:0.77},{ticker:"HDFCBANK",rank:6,ret:0.36,norm_score:0.73},{ticker:"KOTAKBANK",rank:7,ret:0.32,norm_score:0.69},{ticker:"POWERGRID",rank:8,ret:0.29,norm_score:0.65},{ticker:"NTPC",rank:9,ret:0.26,norm_score:0.61},{ticker:"COALINDIA",rank:10,ret:0.23,norm_score:0.57}], scores_3m:[{ticker:"LTIM",rank:1,ret:0.41,norm_score:0.93},{ticker:"SUNPHARMA",rank:2,ret:0.37,norm_score:0.88},{ticker:"TITAN",rank:3,ret:0.33,norm_score:0.84},{ticker:"ICICIBANK",rank:4,ret:0.29,norm_score:0.80},{ticker:"BAJFINANCE",rank:5,ret:0.26,norm_score:0.76},{ticker:"HDFCBANK",rank:6,ret:0.23,norm_score:0.72},{ticker:"KOTAKBANK",rank:7,ret:0.21,norm_score:0.68},{ticker:"POWERGRID",rank:8,ret:0.18,norm_score:0.64},{ticker:"NTPC",rank:9,ret:0.16,norm_score:0.60},{ticker:"COALINDIA",rank:10,ret:0.14,norm_score:0.56}] },
  { month:"2023-12", date:"2023-12-31", scores_12m:[{ticker:"LTIM",rank:1,ret:1.18,norm_score:0.96},{ticker:"TITAN",rank:2,ret:1.06,norm_score:0.92},{ticker:"SUNPHARMA",rank:3,ret:0.96,norm_score:0.87},{ticker:"ICICIBANK",rank:4,ret:0.87,norm_score:0.83},{ticker:"BAJFINANCE",rank:5,ret:0.78,norm_score:0.79},{ticker:"HDFCBANK",rank:6,ret:0.71,norm_score:0.75},{ticker:"KOTAKBANK",rank:7,ret:0.64,norm_score:0.71},{ticker:"POWERGRID",rank:8,ret:0.58,norm_score:0.67},{ticker:"NTPC",rank:9,ret:0.52,norm_score:0.62},{ticker:"COALINDIA",rank:10,ret:0.47,norm_score:0.58}], scores_6m:[{ticker:"LTIM",rank:1,ret:0.71,norm_score:0.95},{ticker:"TITAN",rank:2,ret:0.64,norm_score:0.90},{ticker:"SUNPHARMA",rank:3,ret:0.57,norm_score:0.86},{ticker:"ICICIBANK",rank:4,ret:0.51,norm_score:0.82},{ticker:"BAJFINANCE",rank:5,ret:0.46,norm_score:0.78},{ticker:"HDFCBANK",rank:6,ret:0.41,norm_score:0.74},{ticker:"KOTAKBANK",rank:7,ret:0.37,norm_score:0.70},{ticker:"POWERGRID",rank:8,ret:0.33,norm_score:0.66},{ticker:"NTPC",rank:9,ret:0.29,norm_score:0.62},{ticker:"COALINDIA",rank:10,ret:0.26,norm_score:0.58}], scores_3m:[{ticker:"SUNPHARMA",rank:1,ret:0.44,norm_score:0.94},{ticker:"LTIM",rank:2,ret:0.40,norm_score:0.89},{ticker:"TITAN",rank:3,ret:0.36,norm_score:0.85},{ticker:"ICICIBANK",rank:4,ret:0.32,norm_score:0.81},{ticker:"BAJFINANCE",rank:5,ret:0.29,norm_score:0.77},{ticker:"HDFCBANK",rank:6,ret:0.26,norm_score:0.73},{ticker:"KOTAKBANK",rank:7,ret:0.23,norm_score:0.69},{ticker:"POWERGRID",rank:8,ret:0.20,norm_score:0.65},{ticker:"NTPC",rank:9,ret:0.18,norm_score:0.61},{ticker:"COALINDIA",rank:10,ret:0.16,norm_score:0.57}] },
  { month:"2024-03", date:"2024-03-31", scores_12m:[{ticker:"NTPC",rank:1,ret:1.48,norm_score:0.97},{ticker:"POWERGRID",rank:2,ret:1.34,norm_score:0.93},{ticker:"COALINDIA",rank:3,ret:1.21,norm_score:0.89},{ticker:"TATAPOWER",rank:4,ret:1.09,norm_score:0.84},{ticker:"RVNL",rank:5,ret:0.98,norm_score:0.80},{ticker:"IRFC",rank:6,ret:0.88,norm_score:0.76},{ticker:"BEL",rank:7,ret:0.79,norm_score:0.71},{ticker:"HAL",rank:8,ret:0.71,norm_score:0.67},{ticker:"ONGC",rank:9,ret:0.64,norm_score:0.63},{ticker:"ICICIBANK",rank:10,ret:0.57,norm_score:0.59}], scores_6m:[{ticker:"NTPC",rank:1,ret:0.92,norm_score:0.96},{ticker:"POWERGRID",rank:2,ret:0.83,norm_score:0.92},{ticker:"COALINDIA",rank:3,ret:0.74,norm_score:0.87},{ticker:"TATAPOWER",rank:4,ret:0.67,norm_score:0.83},{ticker:"RVNL",rank:5,ret:0.60,norm_score:0.79},{ticker:"IRFC",rank:6,ret:0.54,norm_score:0.75},{ticker:"BEL",rank:7,ret:0.48,norm_score:0.71},{ticker:"HAL",rank:8,ret:0.43,norm_score:0.67},{ticker:"ONGC",rank:9,ret:0.39,norm_score:0.63},{ticker:"ICICIBANK",rank:10,ret:0.34,norm_score:0.59}], scores_3m:[{ticker:"NTPC",rank:1,ret:0.54,norm_score:0.95},{ticker:"RVNL",rank:2,ret:0.49,norm_score:0.90},{ticker:"IRFC",rank:3,ret:0.44,norm_score:0.86},{ticker:"POWERGRID",rank:4,ret:0.40,norm_score:0.82},{ticker:"BEL",rank:5,ret:0.36,norm_score:0.78},{ticker:"HAL",rank:6,ret:0.32,norm_score:0.74},{ticker:"COALINDIA",rank:7,ret:0.29,norm_score:0.70},{ticker:"TATAPOWER",rank:8,ret:0.26,norm_score:0.66},{ticker:"ONGC",rank:9,ret:0.23,norm_score:0.62},{ticker:"ICICIBANK",rank:10,ret:0.20,norm_score:0.58}] },
  { month:"2024-06", date:"2024-06-30", scores_12m:[{ticker:"NTPC",rank:1,ret:1.62,norm_score:0.97},{ticker:"POWERGRID",rank:2,ret:1.46,norm_score:0.93},{ticker:"BEL",rank:3,ret:1.31,norm_score:0.88},{ticker:"HAL",rank:4,ret:1.18,norm_score:0.84},{ticker:"RVNL",rank:5,ret:1.06,norm_score:0.80},{ticker:"IRFC",rank:6,ret:0.95,norm_score:0.76},{ticker:"COALINDIA",rank:7,ret:0.86,norm_score:0.71},{ticker:"TATAPOWER",rank:8,ret:0.77,norm_score:0.67},{ticker:"ONGC",rank:9,ret:0.70,norm_score:0.63},{ticker:"ICICIBANK",rank:10,ret:0.63,norm_score:0.59}], scores_6m:[{ticker:"NTPC",rank:1,ret:0.98,norm_score:0.96},{ticker:"BEL",rank:2,ret:0.88,norm_score:0.91},{ticker:"POWERGRID",rank:3,ret:0.80,norm_score:0.87},{ticker:"HAL",rank:4,ret:0.72,norm_score:0.83},{ticker:"RVNL",rank:5,ret:0.65,norm_score:0.79},{ticker:"IRFC",rank:6,ret:0.58,norm_score:0.75},{ticker:"COALINDIA",rank:7,ret:0.52,norm_score:0.71},{ticker:"TATAPOWER",rank:8,ret:0.47,norm_score:0.67},{ticker:"ONGC",rank:9,ret:0.42,norm_score:0.63},{ticker:"ICICIBANK",rank:10,ret:0.37,norm_score:0.59}], scores_3m:[{ticker:"BEL",rank:1,ret:0.58,norm_score:0.95},{ticker:"HAL",rank:2,ret:0.52,norm_score:0.90},{ticker:"NTPC",rank:3,ret:0.47,norm_score:0.86},{ticker:"RVNL",rank:4,ret:0.42,norm_score:0.82},{ticker:"IRFC",rank:5,ret:0.38,norm_score:0.78},{ticker:"POWERGRID",rank:6,ret:0.34,norm_score:0.74},{ticker:"COALINDIA",rank:7,ret:0.30,norm_score:0.70},{ticker:"TATAPOWER",rank:8,ret:0.27,norm_score:0.66},{ticker:"ONGC",rank:9,ret:0.24,norm_score:0.62},{ticker:"ICICIBANK",rank:10,ret:0.22,norm_score:0.58}] },
  { month:"2024-09", date:"2024-09-30", scores_12m:[{ticker:"BEL",rank:1,ret:1.74,norm_score:0.98},{ticker:"HAL",rank:2,ret:1.58,norm_score:0.93},{ticker:"NTPC",rank:3,ret:1.43,norm_score:0.89},{ticker:"RVNL",rank:4,ret:1.29,norm_score:0.85},{ticker:"IRFC",rank:5,ret:1.16,norm_score:0.81},{ticker:"POWERGRID",rank:6,ret:1.04,norm_score:0.76},{ticker:"COALINDIA",rank:7,ret:0.94,norm_score:0.72},{ticker:"TATAPOWER",rank:8,ret:0.84,norm_score:0.68},{ticker:"ONGC",rank:9,ret:0.76,norm_score:0.64},{ticker:"ICICIBANK",rank:10,ret:0.68,norm_score:0.60}], scores_6m:[{ticker:"BEL",rank:1,ret:1.02,norm_score:0.97},{ticker:"HAL",rank:2,ret:0.92,norm_score:0.92},{ticker:"NTPC",rank:3,ret:0.83,norm_score:0.88},{ticker:"RVNL",rank:4,ret:0.74,norm_score:0.84},{ticker:"IRFC",rank:5,ret:0.67,norm_score:0.80},{ticker:"POWERGRID",rank:6,ret:0.60,norm_score:0.76},{ticker:"COALINDIA",rank:7,ret:0.54,norm_score:0.72},{ticker:"TATAPOWER",rank:8,ret:0.48,norm_score:0.68},{ticker:"ONGC",rank:9,ret:0.43,norm_score:0.64},{ticker:"ICICIBANK",rank:10,ret:0.39,norm_score:0.60}], scores_3m:[{ticker:"BEL",rank:1,ret:0.62,norm_score:0.96},{ticker:"HAL",rank:2,ret:0.56,norm_score:0.91},{ticker:"RVNL",rank:3,ret:0.50,norm_score:0.87},{ticker:"NTPC",rank:4,ret:0.45,norm_score:0.83},{ticker:"IRFC",rank:5,ret:0.40,norm_score:0.79},{ticker:"POWERGRID",rank:6,ret:0.36,norm_score:0.75},{ticker:"COALINDIA",rank:7,ret:0.32,norm_score:0.71},{ticker:"TATAPOWER",rank:8,ret:0.29,norm_score:0.67},{ticker:"ONGC",rank:9,ret:0.26,norm_score:0.63},{ticker:"ICICIBANK",rank:10,ret:0.23,norm_score:0.59}] },
  { month:"2024-12", date:"2024-12-31", scores_12m:[{ticker:"HINDCOPPER",rank:1,ret:1.91,norm_score:0.98},{ticker:"FORCEMOT",rank:2,ret:1.68,norm_score:0.93},{ticker:"GMDCLTD",rank:3,ret:1.52,norm_score:0.89},{ticker:"GVT&D",rank:4,ret:1.38,norm_score:0.85},{ticker:"NATIONALUM",rank:5,ret:1.24,norm_score:0.81},{ticker:"ABCAPITAL",rank:6,ret:1.12,norm_score:0.76},{ticker:"LTF",rank:7,ret:1.01,norm_score:0.72},{ticker:"NETWEB",rank:8,ret:0.91,norm_score:0.68},{ticker:"GRSE",rank:9,ret:0.82,norm_score:0.64},{ticker:"AUBANK",rank:10,ret:0.74,norm_score:0.60}], scores_6m:[{ticker:"HINDCOPPER",rank:1,ret:1.12,norm_score:0.97},{ticker:"FORCEMOT",rank:2,ret:1.01,norm_score:0.92},{ticker:"GMDCLTD",rank:3,ret:0.91,norm_score:0.88},{ticker:"GVT&D",rank:4,ret:0.82,norm_score:0.84},{ticker:"NATIONALUM",rank:5,ret:0.74,norm_score:0.80},{ticker:"ABCAPITAL",rank:6,ret:0.67,norm_score:0.76},{ticker:"LTF",rank:7,ret:0.60,norm_score:0.72},{ticker:"NETWEB",rank:8,ret:0.54,norm_score:0.68},{ticker:"GRSE",rank:9,ret:0.49,norm_score:0.64},{ticker:"AUBANK",rank:10,ret:0.44,norm_score:0.60}], scores_3m:[{ticker:"HINDCOPPER",rank:1,ret:0.64,norm_score:0.96},{ticker:"FORCEMOT",rank:2,ret:0.57,norm_score:0.91},{ticker:"GMDCLTD",rank:3,ret:0.51,norm_score:0.87},{ticker:"GVT&D",rank:4,ret:0.46,norm_score:0.83},{ticker:"NATIONALUM",rank:5,ret:0.41,norm_score:0.79},{ticker:"ABCAPITAL",rank:6,ret:0.37,norm_score:0.75},{ticker:"LTF",rank:7,ret:0.33,norm_score:0.71},{ticker:"NETWEB",rank:8,ret:0.29,norm_score:0.67},{ticker:"GRSE",rank:9,ret:0.26,norm_score:0.63},{ticker:"AUBANK",rank:10,ret:0.23,norm_score:0.59}] },
];

function buildHistogram(scores, bins = 20) {
  const step = 2 / bins;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    bin:   -1 + i * step + step / 2,
    label: `${(-1 + i * step).toFixed(1)}`,
    count: 0,
  }));
  scores.forEach(s => {
    const idx = Math.min(Math.floor((s.norm_score + 1) / step), bins - 1);
    if (idx >= 0) buckets[idx].count++;
  });
  return buckets;
}

// ── Tooltips ──────────────────────────────────────────────────────────────────
function RetTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background:"rgba(6,14,26,0.97)", border:`1px solid rgba(212,160,23,0.3)`, borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>{d?.ticker}</div>
      <div style={{ fontSize:11, color:GOLD }}>Rank #{d?.rank}</div>
      <div style={{ fontSize:11, color:d?.ret >= 0 ? GREEN : RED, marginTop:2 }}>
        Return: {d?.ret >= 0 ? "+" : ""}{(d?.ret * 100).toFixed(1)}%
      </div>
      <div style={{ fontSize:11, color:SUB, marginTop:2 }}>Score: {d?.norm_score?.toFixed(3)}</div>
    </div>
  );
}

function HistTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background:"rgba(6,14,26,0.97)", border:`1px solid rgba(212,160,23,0.2)`, borderRadius:8, padding:"8px 12px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:11, color:"#e2e8f0" }}>Score ≈ {d?.bin?.toFixed(2)}</div>
      <div style={{ fontSize:11, color:GOLD, marginTop:2 }}>{d?.count} stocks</div>
    </div>
  );
}

// ── Horizon Selector Pills (inline, compact, greyed when inactive) ─────────────
function HorizonPills({ horizon, setHorizon }) {
  return (
    <div style={{ display:"flex", gap:5 }}>
      {Object.entries(HORIZON_META).map(([key, meta]) => {
        const active = horizon === key;
        return (
          <button
            key={key}
            onClick={() => setHorizon(key)}
            style={{
              padding:"4px 13px", borderRadius:999,
              border:`1px solid ${active ? meta.color : "rgba(255,255,255,0.12)"}`,
              background: active ? `${meta.color}22` : "transparent",
              color: active ? meta.color : "rgba(200,218,232,0.40)",
              fontWeight: active ? 800 : 500,
              fontSize:10, letterSpacing:"0.4px",
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              transition:"all .15s",
            }}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Winners & Losers Banner ───────────────────────────────────────────────────
function WinnersLosersBanner({ data, horizon, setHorizon }) {
  const [expanded, setExpanded] = useState(false);
  const meta      = HORIZON_META[horizon];
  const allScores = data?.[meta.field] ?? [];
  const count     = expanded ? 10 : 5;

  const winners = allScores.slice(0, count);
  const losers  = [...allScores].sort((a, b) => a.norm_score - b.norm_score).slice(0, count);

  const StockCard = ({ s, isWinner }) => (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"9px 12px",
      background: isWinner ? "rgba(39,174,96,0.05)" : "rgba(192,57,43,0.05)",
      border:`1px solid ${isWinner ? "rgba(39,174,96,0.18)" : "rgba(192,57,43,0.18)"}`,
      borderLeft:`3px solid ${isWinner ? GREEN : RED}`,
      borderRadius:8,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:9, fontWeight:800, color:isWinner ? GREEN : RED, minWidth:22 }}>
          #{s.rank}
        </span>
        <span className="wl-ticker" style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}>
          {s.ticker}
        </span>
      </div>
      <span className="wl-ret" style={{ fontSize:12, fontWeight:700, color:isWinner ? GREEN : RED }}>
        {s.ret >= 0 ? "+" : ""}{(s.ret * 100).toFixed(1)}%
      </span>
    </div>
  );

  return (
    <div style={{ marginBottom:32 }}>
      {/* Header row: title + date + horizon pills — all inline */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:"#e2e8f0", fontFamily:"'Playfair Display',serif", margin:0 }}>
          Winners &amp; Losers
        </h2>
        <span style={{ fontSize:11, color:SUB }}>as of {data?.date ?? "—"}</span>
        <HorizonPills horizon={horizon} setHorizon={setHorizon}/>
      </div>

      {allScores.length === 0 ? (
        <div style={{ color:MUTED, fontSize:13 }}>No data for this horizon yet.</div>
      ) : (
        <>
          {/* Two-column layout on desktop, two narrow columns on mobile */}
          <div className="wl-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Winners */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <div style={{ width:3, height:14, background:GREEN, borderRadius:2 }}/>
                <span style={{ fontSize:10, fontWeight:800, color:GREEN, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>
                  TOP WINNERS
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {winners.map(s => <StockCard key={s.ticker} s={s} isWinner={true}/>)}
              </div>
            </div>

            {/* Losers */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <div style={{ width:3, height:14, background:RED, borderRadius:2 }}/>
                <span style={{ fontSize:10, fontWeight:800, color:RED, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>
                  BOTTOM LOSERS
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {losers.map(s => <StockCard key={s.ticker} s={s} isWinner={false}/>)}
              </div>
            </div>
          </div>

          {/* View more / collapse */}
          <div style={{ textAlign:"center", marginTop:14 }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background:"transparent",
                border:`1px solid rgba(212,160,23,0.25)`,
                borderRadius:999, padding:"6px 22px",
                color:"rgba(212,160,23,0.65)", fontSize:10, fontWeight:700,
                letterSpacing:"1px", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(212,160,23,0.55)"; e.currentTarget.style.color=GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(212,160,23,0.25)"; e.currentTarget.style.color="rgba(212,160,23,0.65)"; }}
            >
              {expanded ? "▲ SHOW LESS" : "▼ VIEW MORE (TOP 10)"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Horizon Section ───────────────────────────────────────────────────────────
function HorizonSection({ data, horizonKey }) {
  const meta     = HORIZON_META[horizonKey];
  const scores   = useMemo(() => data?.[meta.field] ?? [], [data, meta.field]);
  const top20    = scores.slice(0, 20);
  const histData = useMemo(() => buildHistogram(scores), [scores]);

  if (scores.length === 0) {
    return (
      <div style={{ padding:"24px 0", color:MUTED, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
        No {meta.label} data in Firestore yet. Re-run momentum_engine.py.
      </div>
    );
  }

  return (
    <div style={{
      background:"rgba(255,255,255,0.018)",
      border:`1px solid rgba(212,160,23,0.09)`,
      borderTop:`2px solid ${meta.color}`,
      borderRadius:14, padding:"24px 22px", marginBottom:20,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:3, height:18, background:meta.color, borderRadius:2, flexShrink:0 }}/>
        <span style={{ fontSize:14, fontWeight:800, color:meta.color, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.5px" }}>
          {meta.label} Momentum
        </span>
        <span style={{ fontSize:10, color:MUTED, fontFamily:"'DM Sans',sans-serif" }}>{meta.desc}</span>
      </div>

      <div className="mom-charts-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:SUB, letterSpacing:"1.2px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            SCORE DISTRIBUTION · {scores.length} STOCKS
          </div>
          <p style={{ fontSize:10, color:MUTED, margin:"0 0 10px", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
            Cross-sectional momentum normalised to [−1, +1]. Right tail = highest momentum.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill:MUTED, fontSize:8, fontFamily:"'DM Sans',sans-serif" }}
                tickLine={false} axisLine={{ stroke:"rgba(212,160,23,0.1)" }} interval={4}/>
              <YAxis tick={{ fill:MUTED, fontSize:8 }} tickLine={false} axisLine={false}/>
              <ReferenceLine x="0.0" stroke="rgba(212,160,23,0.3)" strokeWidth={1.5} strokeDasharray="4 2"/>
              <Tooltip content={<HistTooltip/>} cursor={{ fill:"rgba(212,160,23,0.04)" }}/>
              <Bar dataKey="count" radius={[3,3,0,0]} maxBarSize={24} isAnimationActive={false}>
                {histData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.bin > 0.5 ? meta.color : entry.bin > 0 ? `${meta.color}cc` : `${meta.color}88`}
                    fillOpacity={entry.bin > 0.5 ? 1 : entry.bin > 0 ? 0.85 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div style={{ fontSize:10, fontWeight:700, color:SUB, letterSpacing:"1.2px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            TOP 20 · {meta.retLabel.toUpperCase()}
          </div>
          <p style={{ fontSize:10, color:MUTED, margin:"0 0 10px", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
            Raw period returns for top-ranked stocks. Gold = top 10.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top20} layout="vertical" margin={{ top:0, right:56, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
              <XAxis type="number" tickFormatter={v => `${(v*100).toFixed(0)}%`}
                tick={{ fill:MUTED, fontSize:8, fontFamily:"'DM Sans',sans-serif" }}
                tickLine={false} axisLine={{ stroke:"rgba(212,160,23,0.1)" }}/>
              <YAxis type="category" dataKey="ticker" width={88}
                tick={{ fill:SUB, fontSize:8.5, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
                tickLine={false} axisLine={false}/>
              <ReferenceLine x={0} stroke="rgba(212,160,23,0.2)" strokeWidth={1}/>
              <Tooltip content={<RetTooltip/>} cursor={{ fill:"rgba(212,160,23,0.04)" }} isAnimationActive={false}/>
              <Bar dataKey="ret" radius={[0,3,3,0]} maxBarSize={13} isAnimationActive={false}
                label={{ position:"right", fontSize:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fill:MUTED,
                  formatter: v => `${v >= 0 ? "+" : ""}${(v*100).toFixed(0)}%` }}>
                {top20.map(entry => (
                  <Cell key={entry.ticker}
                    fill={entry.rank <= 10 ? meta.color : `${meta.color}66`}
                    fillOpacity={entry.rank <= 10 ? 0.88 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ history, horizon }) {
  const meta   = HORIZON_META[horizon];
  const months = useMemo(() =>
    history.map(h => ({
      month:  h.month,
      date:   h.date,
      top:    (h[meta.field] ?? []).slice(0, 10).map(s => s.ticker),
      topSet: new Set((h[meta.field] ?? []).slice(0, 10).map(s => s.ticker)),
    })), [history, meta]);

  const allTickers = useMemo(() => {
    const set = new Set();
    months.forEach(m => m.top.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [months]);

  if (!months.length) return (
    <div style={{ textAlign:"center", padding:"60px 0", color:MUTED }}>
      <div style={{ fontSize:32, marginBottom:12 }}>📅</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>No history yet. Scores appear after the first month-end run.</div>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontSize:15, color:GOLD, margin:"0 0 6px", fontFamily:"'Playfair Display',serif" }}>
        Top 10 Historical Composition — {meta.label}
      </h3>
      <p style={{ fontSize:11, color:SUB, margin:"0 0 16px" }}>
        ✓ = in top 10 that month · Sorted by total appearances · Jan 2021 – present · <span style={{ color:"rgba(212,160,23,0.5)" }}>Quarterly data pre-2025, monthly thereafter</span>
      </p>
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse", fontSize:11, minWidth:"100%" }}>
          <thead>
            <tr>
              <th style={{ padding:"8px 12px", textAlign:"left", color:GOLD, fontWeight:700, borderBottom:`2px solid rgba(212,160,23,0.2)`, fontFamily:"'DM Sans',sans-serif", position:"sticky", left:0, background:"#080F1A", whiteSpace:"nowrap" }}>Ticker</th>
              {months.map(m => (
                <th key={m.month} style={{ padding:"8px 6px", textAlign:"center", color:GOLD, fontWeight:700, borderBottom:`2px solid rgba(212,160,23,0.2)`, fontFamily:"'DM Sans',sans-serif", fontSize:9, whiteSpace:"nowrap" }}>{m.month}</th>
              ))}
              <th style={{ padding:"8px 8px", textAlign:"center", color:GOLD, fontWeight:700, borderBottom:`2px solid rgba(212,160,23,0.2)`, fontFamily:"'DM Sans',sans-serif" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {allTickers
              .map(ticker => ({ ticker, appearances: months.filter(m => m.topSet.has(ticker)).length }))
              .sort((a, b) => b.appearances - a.appearances)
              .map(({ ticker, appearances }) => (
                <tr key={ticker} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding:"7px 12px", fontWeight:700, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", position:"sticky", left:0, background:"#080F1A", whiteSpace:"nowrap" }}>{ticker}</td>
                  {months.map(m => (
                    <td key={m.month} style={{ padding:"7px 6px", textAlign:"center", background:m.topSet.has(ticker) ? "rgba(212,160,23,0.14)" : "transparent", borderRadius:4 }}>
                      {m.topSet.has(ticker)
                        ? <span style={{ color:GOLD, fontWeight:800, fontSize:12 }}>✓</span>
                        : <span style={{ color:"rgba(255,255,255,0.1)", fontSize:10 }}>·</span>}
                    </td>
                  ))}
                  <td style={{ padding:"7px 8px", textAlign:"center" }}>
                    <span style={{ fontSize:11, fontWeight:800, color: appearances >= months.length*0.6 ? GREEN : appearances >= months.length*0.3 ? ORANGE : MUTED }}>{appearances}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MomentumDashboard() {
  const [horizon, setHorizon] = useState("3m");
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    async function load() {
      setLoading(true); setError(null);
      try {
        const latestSnap = await getDoc(doc(db, "momentum_scores", "_latest"));
        if (!latestSnap.exists()) {
          setError("No momentum data yet. Run momentum_engine.py to generate scores."); return;
        }
        const { month: latestMonth } = latestSnap.data();

        const currSnap = await getDoc(doc(db, "momentum_scores", latestMonth));
        if (currSnap.exists() && !cancelled) {
          const d = currSnap.data();
          setCurrent({ month: latestMonth, ...d });
        }

        const histQ    = query(collection(db, "momentum_scores"), orderBy("date", "desc"), limit(25));
        const histSnap = await getDocs(histQ);
        const hist = [];
        histSnap.forEach(d => { if (d.id !== "_latest") hist.push({ month: d.id, ...d.data() }); });
        if (!cancelled) setHistory(hist.sort((a, b) => b.date.localeCompare(a.date)));

      } catch (err) {
        if (!cancelled) setError(`Failed to load data: ${err.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const topScores = useMemo(() => {
    if (!current) return [];
    return (current[HORIZON_META[horizon].field] ?? []).slice(0, 10);
  }, [current, horizon]);

  const avgRet = useMemo(() => {
    if (!topScores.length) return null;
    return topScores.reduce((s, x) => s + x.ret, 0) / topScores.length;
  }, [topScores]);

  return (
    <div style={{ background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`, minHeight:"100vh", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", paddingTop:92 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes momSpin { to { transform:rotate(360deg) } }
        @media(max-width:700px) {
          .mom-charts-grid { grid-template-columns: 1fr !important; }
          .wl-grid { gap: 10px !important; }
          .wl-ticker { font-size: 11px !important; }
          .wl-ret    { font-size: 10px !important; }
          .mom-metric-strip { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .mom-metric-card  { padding: 9px 12px !important; }
          .mom-metric-val   { font-size: 16px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding:"60px 28px 0", borderBottom:`1px solid rgba(212,160,23,0.15)` }}>
        <div style={{ maxWidth:1320, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div>
              <div style={{ fontSize:9, color:GOLD, letterSpacing:"2.5px", fontWeight:700, marginBottom:6 }}>VANTAGE CAPITAL · QUANT</div>
              <h1 style={{ margin:"0 0 4px", fontSize:28, fontWeight:800, fontFamily:"'Playfair Display',serif", color:"#fff" }}>Momentum Factor</h1>
              <div style={{ fontSize:12, color:SUB }}>
                Cross-sectional momentum · Nifty 500 universe · Updated monthly
              </div>
            </div>
            {!loading && !error && current && (
              <div style={{ padding:"10px 18px", background:"rgba(39,174,96,0.08)", border:`1px solid ${GREEN}33`, borderRadius:10, textAlign:"right" }}>
                <div style={{ fontSize:9, color:SUB, letterSpacing:1, marginBottom:3 }}>LAST UPDATED</div>
                <div style={{ fontSize:15, fontWeight:800, color:GREEN }}>{current.date}</div>
              </div>
            )}
          </div>

          {/* Metric strip */}
          {!loading && !error && current && (
            <div className="mom-metric-strip" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, flexWrap:"wrap", marginBottom:20 }}>
              {[
                { label:"Universe",          value:"Nifty 500",  sub:"index constituents",  color:GOLD   },
                { label:"Top 10 Avg Return", value: avgRet != null ? `${avgRet>=0?"+":""}${(avgRet*100).toFixed(1)}%` : "—", sub:HORIZON_META[horizon].label, color: avgRet >= 0 ? GREEN : RED },
                { label:"History",           value:`${history.length + STATIC_HISTORY.length}M`, sub:"months of data (2021–now)", color:TEAL   },
                { label:"#1 Stock",          value: topScores[0]?.ticker ?? "—", sub:`Score ${topScores[0]?.norm_score?.toFixed(2) ?? "—"}`, color:ORANGE },
              ].map(m => (
                <div key={m.label} className="mom-metric-card" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 18px" }}>
                  <div style={{ fontSize:9, color:SUB, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{m.label}</div>
                  <div className="mom-metric-val" style={{ fontSize:20, fontWeight:800, color:m.color }}>{m.value}</div>
                  <div style={{ fontSize:9, color:MUTED, marginTop:2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab bar only — horizon pills now live inside WinnersLosersBanner */}
          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            {[["Rankings",0],["See Historical",1]].map(([label,i]) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding:"9px 20px", border:"none", cursor:"pointer",
                borderBottom: tab===i ? `3px solid ${GOLD}` : "3px solid transparent",
                background: tab===i ? "rgba(212,160,23,0.10)" : "transparent",
                color: tab===i ? GOLD : SUB,
                fontWeight: tab===i ? 800 : 500, fontSize:13, fontFamily:"'DM Sans',sans-serif",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"32px 28px 80px", maxWidth:1320, margin:"0 auto" }}>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:14 }}>
            <svg width="36" height="36" viewBox="0 0 32 32" style={{ animation:"momSpin .9s linear infinite" }}>
              <circle cx="16" cy="16" r="12" fill="none" stroke={GOLD} strokeWidth="2.5" strokeDasharray="52" strokeDashoffset="14" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:10, color:GOLD, letterSpacing:"2px" }}>LOADING SCORES…</span>
          </div>
        )}

        {!loading && error && (
          <div style={{ maxWidth:520, margin:"60px auto", textAlign:"center", background:"rgba(192,57,43,0.08)", border:`1px solid ${RED}33`, borderRadius:14, padding:"32px 28px" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔴</div>
            <div style={{ fontSize:14, fontWeight:700, color:RED, marginBottom:8 }}>No Data Available</div>
            <div style={{ fontSize:12, color:SUB, lineHeight:1.8 }}>{error}</div>
            <div style={{ marginTop:24, textAlign:"left", background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:GOLD, marginBottom:10, letterSpacing:1 }}>QUICK START</div>
              {["pip install firebase-admin pyarrow","Save firebase_service_account.json in script folder","python momentum_engine.py"].map((step,i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:9, fontWeight:800, color:GOLD, minWidth:16, paddingTop:1 }}>{i+1}.</span>
                  <code style={{ fontSize:10, color:"#c8dae8", background:"rgba(255,255,255,0.05)", padding:"2px 8px", borderRadius:4 }}>{step}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rankings tab */}
        {!loading && !error && current && tab === 0 && (
          <>
            {/* Winners & Losers with horizon pills inline */}
            <WinnersLosersBanner data={current} horizon={horizon} setHorizon={setHorizon}/>

            <div style={{ height:1, background:"rgba(212,160,23,0.10)", margin:"4px 0 28px" }}/>
            <div style={{ fontSize:11, fontWeight:700, color:SUB, letterSpacing:"2px", marginBottom:20 }}>HORIZON ANALYSIS</div>
            {Object.keys(HORIZON_META).map(key => (
              <HorizonSection key={key} data={current} horizonKey={key}/>
            ))}
          </>
        )}

        {/* See Historical tab — merges live Firestore history + static pre-2025 data */}
        {!loading && !error && tab === 1 && (
          <HistoryView history={[...history, ...STATIC_HISTORY]} horizon={horizon}/>
        )}

        {!loading && !error && (
          <div style={{ fontSize:10, color:MUTED, marginTop:32, lineHeight:1.9, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:20 }}>
            <span style={{ color:GOLD }}>★</span> 12M = Jegadeesh-Titman (1993) 12-1 momentum · 6M = 6-month, 10-day skip · 3M = 3-month, 5-day skip<br/>
            All scores cross-sectionally normalised to [−1, +1] within the Nifty 500 universe · Live data via Zerodha / Kite Connect<br/>
            Historical data (2021–2024) based on quarterly reconstructed rankings · <strong style={{ color:RED }}>Not SEBI-registered investment advice.</strong> For research &amp; educational use only. · <span style={{ color:"rgba(212,160,23,0.4)" }}>© Vantage Capital Investments</span>
          </div>
        )}

        {/* Back to home — scrolls to top on navigation */}
        <div style={{ textAlign:"center", marginTop:40 }}>
          <Link to="/" onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ fontSize:12, color:"rgba(212,160,23,0.5)", fontWeight:700, textDecoration:"none", letterSpacing:"1.2px" }}>
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}