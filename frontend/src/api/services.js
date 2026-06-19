import api from './axios';

// ============= AUTH =============
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

// ============= USERS =============
export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  getAll: () => api.get('/api/users'),
  getTesteurs: () => api.get('/api/users/testeurs'),
  getEligible: () => api.get('/api/users/eligible-members'),
  getById: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  desactiver: (id) => api.patch(`/api/users/${id}/desactiver`),
  activer: (id) => api.patch(`/api/users/${id}/activer`),
  changePassword: (newPassword) => api.patch('/api/users/change-password', { newPassword }),
};

// ============= PROJETS =============
export const projetAPI = {
  create: (data) => api.post('/api/projets', data),
  getAll: () => api.get('/api/projets'),
  getById: (id) => api.get(`/api/projets/${id}`),
  update: (id, data) => api.put(`/api/projets/${id}`, data),
  delete: (id) => api.delete(`/api/projets/${id}`),
  getByTesteur: (userId) => api.get(`/api/projets/testeur/${userId}`),
  validate: (id) => api.post(`/api/projets/${id}/validate`),
};

// ============= MEMBRES PROJET =============
export const membreAPI = {
  assigner: (userId, projetId) =>
    api.post(`/api/membres/assigner?userId=${userId}&projetId=${projetId}`),
  retirer: (userId, projetId) =>
    api.delete(`/api/membres/retirer?userId=${userId}&projetId=${projetId}`),
  getByProjet: (projetId) => api.get(`/api/membres/projet/${projetId}`),
};

// ============= DASHBOARD / KPIs =============
export const dashboardAPI = {
  getGlobal: () => api.get('/api/dashboard/global'),
  getByProjet: (projetId) => api.get(`/api/dashboard/${projetId}`),
};

export const kpiAPI = {
  getGlobal: () => api.get('/api/kpis/global'),
  getByProjet: (projetId) => api.get(`/api/kpis/projet/${projetId}`),
};

// ============= ANOMALIES =============
export const anomalieAPI = {
  declarer: (data) => api.post('/api/anomalies', data),
  // Aperçu IA : prédit la sévérité sans rien enregistrer
  predictSeverity: (data) => api.post('/api/anomalies/predict-severity', data),
  getAll: () => api.get('/api/anomalies'),
  getByProjet: (projetId) => api.get(`/api/anomalies/projet/${projetId}`),
  getByExecution: (executionId) => api.get(`/api/anomalies/execution/${executionId}`),
  getById: (id) => api.get(`/api/anomalies/${id}`),
  update: (id, data) => api.put(`/api/anomalies/${id}`, data),
  changerStatut: (id, statut) => api.patch(`/api/anomalies/${id}/statut?statut=${statut}`),
  commenter: (id, commentaire) =>
    api.post(`/api/anomalies/${id}/commentaire`, commentaire, {
      headers: { 'Content-Type': 'text/plain' },
    }),
  delete: (id) => api.delete(`/api/anomalies/${id}`),
};

// ============= EXECUTIONS =============
export const executionAPI = {
  lancer: (data) => api.post('/api/executions', data),
  mettreAJour: (id, data) => api.patch(`/api/executions/${id}`, data),
  getByCas: (casDeTestId) => api.get(`/api/executions/cas/${casDeTestId}`),
  getByProjet: (projetId) => api.get(`/api/executions/projet/${projetId}`),
  getBySession: (sessionId) => api.get(`/api/executions/session/${sessionId}`),
  getById: (id) => api.get(`/api/executions/${id}`),
  joindreCapture: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/executions/${id}/capture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============= SESSIONS =============
export const sessionAPI = {
  create: (data) => api.post('/api/sessions', data),
  update: (id, data) => api.put(`/api/sessions/${id}`, data),
  getByProjet: (projetId) => api.get(`/api/sessions/projet/${projetId}`),
  getById: (id) => api.get(`/api/sessions/${id}`),
  delete: (id) => api.delete(`/api/sessions/${id}`),
};

// ============= MODULES =============
export const moduleAPI = {
  create: (data) => api.post('/api/modules', data),
  getByProjet: (projetId) => api.get(`/api/modules/projet/${projetId}`),
  getById: (id) => api.get(`/api/modules/${id}`),
  update: (id, data) => api.put(`/api/modules/${id}`, data),
  delete: (id) => api.delete(`/api/modules/${id}`),
};

// ============= SCENARIOS =============
export const scenarioAPI = {
  create: (data) => api.post('/api/scenarios', data),
  getByModule: (moduleId) => api.get(`/api/scenarios/module/${moduleId}`),
  getByProjet: (projetId) => api.get(`/api/scenarios/projet/${projetId}`),
  getById: (id) => api.get(`/api/scenarios/${id}`),
  update: (id, data) => api.put(`/api/scenarios/${id}`, data),
  delete: (id) => api.delete(`/api/scenarios/${id}`),
};

// ============= CAS DE TEST =============
export const casDeTestAPI = {
  create: (data) => api.post('/api/cas-tests', data),
  getByScenario: (scenarioId) => api.get(`/api/cas-tests/scenario/${scenarioId}`),
  getByProjet: (projetId) => api.get(`/api/cas-tests/projet/${projetId}`),
  getById: (id) => api.get(`/api/cas-tests/${id}`),
  update: (id, data) => api.put(`/api/cas-tests/${id}`, data),
  delete: (id) => api.delete(`/api/cas-tests/${id}`),
  importExcel: (scenarioId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/cas-tests/import/${scenarioId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============= REPORTS =============
export const fileAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const chatAPI = {
  // POST /api/chat  { message } -> { reply }
  send: (message) => api.post('/api/chat', { message }),
};

export const reportAPI = {
  downloadProjetReport: (projetId) =>
    api.get(`/api/reports/projet/${projetId}`, {
      responseType: 'blob',
    }),
  downloadProjetCSV: (projetId) =>
    api.get(`/api/reports/projet/${projetId}/csv`, {
      responseType: 'blob',
    }),
};

export const searchAPI = {
  global: (query, userId, role) => {
    const params = new URLSearchParams({ query });
    if (userId) params.append('userId', userId);
    if (role) params.append('role', role);
    return api.get(`/api/search?${params.toString()}`);
  },
};

// ============= NOTIFICATIONS =============
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  getUnread: () => api.get('/api/notifications/unread'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};
