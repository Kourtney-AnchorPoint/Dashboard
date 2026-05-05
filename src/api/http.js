const DEFAULT_API_BASE_URL = "http://localhost:8080";

function getApiBaseUrl() {
  const viteUrl = import.meta?.env?.VITE_API_BASE_URL;
  return (viteUrl || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.error || data?.message || `API request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}
