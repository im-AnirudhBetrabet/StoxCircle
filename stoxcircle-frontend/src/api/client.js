import { supabase } from '../lib/supabase';

const BASE_URL = import.meta.env.VITE_ANALYTICS_SERVER_URL || 'http://localhost:8000/api/v1';

export async function apiFetch(endpoint, options = {}) {
  // 1. Ask Supabase for the current active session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('Error fetching Supabase session:', sessionError.message);
  }

  // 2. Setup Headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 3. Inject JWT Token if session exists
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // 4. Handle URL parameters (e.g., converting { holding_days: 30 } to "?holding_days=30")
  let url = `${BASE_URL}${endpoint}`;
  if (options.params) {
    const query = new URLSearchParams(options.params).toString();
    url += `?${query}`;
  }

  // 5. Execute Native Fetch
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 6. Global 401 Unauthorized Handling
  if (response.status === 401) {
    console.warn('Session expired or unauthorized. Redirecting to login...');
    // supabase.auth.signOut();
    // window.location.href = '/login'; 
  }

  // 7. Error Handling
  if (!response.ok) {
    // Attempt to parse FastAPI's detail error message, fallback to generic
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  // 8. Return parsed JSON
  return response.json();
}