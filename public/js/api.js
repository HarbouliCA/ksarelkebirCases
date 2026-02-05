// API Helper Functions
const API_BASE = ''; // Relative to current domain

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
}

export const authAPI = {
  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  register: (email, password, name) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  }),

  getStatus: () => apiCall('/auth/status')
};

export const casesAPI = {
  getAll: () => apiCall('/cases', { method: 'GET' }),

  getOne: (id) => apiCall(`/cases/${id}`, { method: 'GET' }),

  create: (person_id, description, urgency, contact_method, aid_type_ids) => apiCall('/cases', {
    method: 'POST',
    body: JSON.stringify({ person_id, description, urgency, contact_method, aid_type_ids })
  }),

  update: (id, updates) => apiCall(`/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  delete: (id) => apiCall(`/cases/${id}`, { method: 'DELETE' })
};

export const peopleAPI = {
  getAll: () => apiCall('/people', { method: 'GET' }),

  getOne: (id) => apiCall(`/people/${id}`, { method: 'GET' }),

  create: (full_name, phone, city, number_of_people) => apiCall('/people', {
    method: 'POST',
    body: JSON.stringify({ full_name, phone, city, number_of_people })
  }),

  update: (id, updates) => apiCall(`/people/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  delete: (id) => apiCall(`/people/${id}`, { method: 'DELETE' })
};

export const aidTypesAPI = {
  getAll: () => apiCall('/aid-types', { method: 'GET' }),

  getOne: (id) => apiCall(`/aid-types/${id}`, { method: 'GET' })
};

export const usersAPI = {
  getProfile: () => apiCall('/users/profile', { method: 'GET' }),

  getAll: () => apiCall('/users', { method: 'GET' }),

  getOne: (id) => apiCall(`/users/${id}`, { method: 'GET' }),

  update: (id, updates) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' })
};
