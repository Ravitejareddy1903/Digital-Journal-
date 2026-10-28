// API Client for EverJournal Backend
const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Server error (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      // Fallback to status text
    }
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  // Handle blob responses (exports)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Journals
  getJournals: (params = '') => request(`/journals${params}`),
  getJournalById: (id) => request(`/journals/${id}`),
  createJournal: (data) => request('/journals', { method: 'POST', body: JSON.stringify(data) }),
  updateJournal: (id, data) => request(`/journals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJournal: (id) => request(`/journals/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id) => request(`/journals/${id}/favorite`, { method: 'PATCH' }),
  togglePin: (id) => request(`/journals/${id}/pin`, { method: 'PATCH' }),
  getJournalAnalytics: () => request('/journals/analytics'),
  importJournals: (journals) => request('/journals/import', { method: 'POST', body: JSON.stringify({ journals }) }),
  exportJournalsJson: () => request('/journals/export/json'),
  exportJournalsCsv: () => request('/journals/export/csv'),

  // Mood Check-ins
  getMoods: (params = '') => request(`/moods${params}`),
  createMood: (data) => request('/moods', { method: 'POST', body: JSON.stringify(data) }),
  deleteMood: (id) => request(`/moods/${id}`, { method: 'DELETE' }),

  // User Profile & Settings
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
  checkHealth: async () => {
    try {
      const res = await fetch('/health');
      return res.ok;
    } catch {
      return false;
    }
  }
};
