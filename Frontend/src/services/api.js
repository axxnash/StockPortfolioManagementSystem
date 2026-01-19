const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make unauthenticated requests
const fetchWithoutAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    return fetchWithoutAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    const data = await fetchWithoutAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!getToken();
  },
};

// Stocks API
export const stocksAPI = {
  list: async () => {
    return fetchWithAuth('/stocks');
  },
};

// Brokers API
export const brokersAPI = {
  list: async () => {
    return fetchWithAuth('/brokers');
  },
};

// Holdings API
export const holdingsAPI = {
  list: async () => {
    return fetchWithAuth('/holdings');
  },

  add: async (broker_id, stock_id, quantity, invested) => {
    return fetchWithAuth('/holdings', {
      method: 'POST',
      body: JSON.stringify({ broker_id, stock_id, quantity, invested }),
    });
  },

  update: async (id, broker_id, stock_id, quantity, invested) => {
    return fetchWithAuth(`/holdings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ broker_id, stock_id, quantity, invested }),
    });
  },

  remove: async (id) => {
    return fetchWithAuth(`/holdings/${id}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsAPI = {
  dashboard: async () => {
    return fetchWithAuth('/analytics/dashboard');
  },
};
