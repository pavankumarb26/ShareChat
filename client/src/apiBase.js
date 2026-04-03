/** Backend origin for REST (uploads / downloads). Override with VITE_API_URL in .env */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";
