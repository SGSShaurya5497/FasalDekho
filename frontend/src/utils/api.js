/**
 * Central API base URL.
 * Set REACT_APP_API_BASE in your .env (local) or .env.production (deployed).
 * Falls back to localhost for development convenience.
 */
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_API_URL?.replace(/\/predict$/, "") ||
  "http://localhost:8000";

export default API_BASE;
