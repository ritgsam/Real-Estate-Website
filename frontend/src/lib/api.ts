const API_BASE_URL = 'http://localhost:5000/api';

// Simple in-memory token store for access token
let accessToken: string | null = null;

if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('token');
}

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};

export const getAccessToken = () => accessToken;

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Access Token if available
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // Allow cookies (refresh token)
  };

  let response = await fetch(url, config);

  // Handle Token Expiration (401) by attempting refresh
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry the original request with new token
      headers.set('Authorization', `Bearer ${accessToken}`);
      response = await fetch(url, config);
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Attempt to refresh the JWT Access Token using refresh token in cookie/localStorage
async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}/auth/refresh`;
    const localRefresh = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken: localRefresh }),
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.refreshToken && typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to refresh token', err);
  }
  
  // Refresh failed, clean up auth
  setAccessToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  return false;
}

// API methods
export const api = {
  auth: {
    register: async (data: any) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      return res;
    },
    login: async (data: any) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      return res;
    },
    logout: async () => {
      const localRefresh = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: localRefresh })
        });
      } catch (e) {
        // Continue even if api logout fails
      }
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    },
    getCurrentUser: () => {
      if (typeof window !== 'undefined') {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
      }
      return null;
    }
  },
  properties: {
    list: async (filters: any = {}) => {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/properties${query}`);
    },
    get: async (id: string) => {
      return request(`/properties/${id}`);
    },
    create: async (data: any) => {
      return request('/properties', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: any) => {
      return request(`/properties/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string) => {
      return request(`/properties/${id}`, {
        method: 'DELETE'
      });
    },
    getSimilar: async (id: string) => {
      return request(`/properties/${id}/similar`);
    }
  },
  inquiries: {
    submit: async (data: any) => {
      return request('/inquiries', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    getOwnerLeads: async () => {
      return request('/inquiries/owner');
    }
  }
};
