// Centralized API helper for the admin panel
// All requests go through the Vite proxy → http://localhost:4000

const BASE = '/api'

async function request(path, options = {}) {
  const stored = localStorage.getItem('admin_session')
  const token = stored ? JSON.parse(stored).token : null

  const headers = { 
    'Content-Type': 'application/json',
    ...options.headers 
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),

  // Dashboard
  getDashboardStats: () => request('/dashboard/stats'),
  getActivity:       () => request('/dashboard/activity'),

  // Merchants
  getMerchants:    ()       => request('/merchants'),
  createMerchant:  (data)   => request('/merchants', { method: 'POST', body: data }),
  updateMerchant:  (id, d)  => request(`/merchants/${id}`, { method: 'PATCH', body: d }),
  deleteMerchant:  (id)     => request(`/merchants/${id}`, { method: 'DELETE' }),
  approveMerchant: (id, by) => request(`/merchants/${id}/approve`, { method: 'POST', body: { reviewed_by: by } }),
  rejectMerchant:  (id, by, note) => request(`/merchants/${id}/reject`, { method: 'POST', body: { reviewed_by: by, rejection_note: note } }),

  // Delivery Partners
  getPartners:    ()        => request('/delivery-partners'),
  createPartner:  (data)    => request('/delivery-partners', { method: 'POST', body: data }),
  updatePartner:  (id, d)   => request(`/delivery-partners/${id}`, { method: 'PATCH', body: d }),
  deletePartner:  (id)      => request(`/delivery-partners/${id}`, { method: 'DELETE' }),
  activatePartner:(id, by)  => request(`/delivery-partners/${id}/activate`, { method: 'POST', body: { reviewed_by: by } }),
  rejectPartner:  (id, by, note) => request(`/delivery-partners/${id}/reject`, { method: 'POST', body: { reviewed_by: by, rejection_note: note } }),

  // Jobs
  getJobs:    ()      => request('/jobs'),
  createJob:  (data)  => request('/jobs', { method: 'POST', body: data }),
  updateJob:  (id, d) => request(`/jobs/${id}`, { method: 'PATCH', body: d }),
  deleteJob:  (id)    => request(`/jobs/${id}`, { method: 'DELETE' }),

  // Contact Inquiries
  getInquiries:   ()           => request('/contact-inquiries'),
  updateInquiry:  (id, status, replied_by) => request(`/contact-inquiries/${id}`, { method: 'PATCH', body: { status, replied_by } }),
  deleteInquiry:  (id)         => request(`/contact-inquiries/${id}`, { method: 'DELETE' }),
}
