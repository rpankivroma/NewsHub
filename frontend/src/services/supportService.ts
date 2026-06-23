const DEFAULT_SUPPORT_SERVICE_URL = 'https://newshub-support-service.onrender.com';

const configuredBaseUrl = (import.meta.env.VITE_SUPPORT_SERVICE_URL || '').trim();
const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const SUPPORT_SERVICE_URL = configuredBaseUrl
  ? stripTrailingSlash(configuredBaseUrl)
  : isLocalHost
    ? ''
    : DEFAULT_SUPPORT_SERVICE_URL;

export const supportUrl = (path: string) => `${SUPPORT_SERVICE_URL}${path}`;

export const supportWsUrl = (path: string) => {
  if (SUPPORT_SERVICE_URL) {
    return `${SUPPORT_SERVICE_URL.replace(/^http/i, 'ws')}${path}`;
  }

  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${wsProtocol}://${window.location.host}${path}`;
};

export const getSupportErrorMessage = async (response: Response, fallback: string) => {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const data = JSON.parse(text);
    return data.detail || data.message || fallback;
  } catch {
    return text;
  }
};
