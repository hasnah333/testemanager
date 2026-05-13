// Format dates from ISO strings
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return '-'; }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '-'; }
};

// Badge style pour Gravité
export const getGraviteColor = (gravite) => {
  switch (gravite) {
    case 'CRITIQUE': return 'bg-red-100 text-red-700 border-red-200';
    case 'MOYENNE': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'FAIBLE': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Badge style pour Statut anomalie
export const getStatutColor = (statut) => {
  switch (statut) {
    case 'OUVERTE': return 'bg-red-100 text-red-700 border-red-200';
    case 'EN_COURS': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'CORRIGEE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'FERMEE': return 'bg-gray-100 text-gray-600 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Badge style pour ExecutionStatus
export const getExecutionStatusColor = (status) => {
  switch (status) {
    case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
    case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'BLOCKED': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Extract API error message
export const getErrorMessage = (err, fallback = 'Une erreur est survenue') => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

// Format role label
export const formatRole = (role) => {
  if (role === 'ADMIN') return 'Administrateur';
  if (role === 'TESTEUR') return 'Testeur';
  return role;
};

// Format statut label (FR)
export const formatStatut = (s) => ({
  OUVERTE: 'Ouverte', EN_COURS: 'En cours',
  CORRIGEE: 'Corrigée', FERMEE: 'Fermée',
}[s] || s);

export const formatExecStatus = (s) => ({
  PENDING: 'En attente', SUCCESS: 'Succès',
  FAILED: 'Échec', BLOCKED: 'Bloqué',
}[s] || s);

export const formatGravite = (g) => ({
  FAIBLE: 'Faible', MOYENNE: 'Moyenne', CRITIQUE: 'Critique',
}[g] || g);
