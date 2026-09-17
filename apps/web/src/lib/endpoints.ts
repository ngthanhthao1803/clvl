const fallbackApiBaseUrl = "http://localhost:5002/api/v1";

function isBrowserLocalhost(url: string) {
  try {
    const parsedUrl = new URL(url);
    return ["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

function getBrowserApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiBaseUrl;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl || isBrowserLocalhost(configuredUrl)) {
    return `${window.location.protocol}//${window.location.hostname}:5002/api/v1`;
  }

  return configuredUrl;
}

export function getApiBaseUrl() {
  return getBrowserApiBaseUrl();
}

export function getSocketUrl() {
  const apiBaseUrl = getBrowserApiBaseUrl();

  try {
    const parsedUrl = new URL(apiBaseUrl);
    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch {
    return apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  }
}
