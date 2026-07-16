const API_BASE = import.meta.env.PUBLIC_API_BASE || 'https://api.greenorbit.academy';
const TOKEN_KEY = 'goa_session_token';
const USER_KEY = 'goa_session_user';

function isBrowser() {
  return typeof window !== 'undefined';
}

function readTextSafe(value) {
  if (typeof value === 'string') return value;
  return '';
}

export function getToken() {
  return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
}

export function getStoredUser() {
  if (!isBrowser()) return null;
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
  const text = await res.text().catch(() => '');
  return text ? { message: text } : {};
}

function buildHeaders(optionsHeaders, includeJson = true) {
  const headers = new Headers(optionsHeaders || {});
  if (includeJson && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function apiFetch(path, options = {}) {
  if (!API_BASE) {
    throw new Error('PUBLIC_API_BASE is missing');
  }

  const url = `${API_BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: buildHeaders(options.headers, true),
    });
  } catch (err) {
    throw new Error(`Network error: ${err?.message || 'Failed to fetch'}`);
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    if (res.status === 401) clearSession();
    const message =
      data?.error ||
      data?.message ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!data?.token || !data?.user) {
    throw new Error('Login response missing token or user');
  }

  setSession(data.token, data.user);
  return data.user;
}

export async function signup(name, email, password) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (!data?.token || !data?.user) {
    throw new Error('Signup response missing token or user');
  }

  setSession(data.token, data.user);
  return data.user;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}
