// Thin client for the Green Orbit Academy portal API (Cloudflare Worker + D1).
// Set PUBLIC_API_BASE in your .env (see .env.example) — e.g.
//   PUBLIC_API_BASE=https://api.greenorbit.academy

const API_BASE = import.meta.env.PUBLIC_API_BASE || 'http://localhost:8787';
const TOKEN_KEY = 'goa_session_token';
const USER_KEY = 'goa_session_user';

export function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearSession();
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json;
}

export async function login(email, password) {
  const { token, user } = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  setSession(token, user);
  return user;
}

export async function signup(name, email, password) {
  const { token, user } = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  setSession(token, user);
  return user;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}
