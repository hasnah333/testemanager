import { useEffect, useState } from 'react';
import { Download, FileText, Bug, ClipboardList, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import { PageLoader, Spinner } from '../../components/Loaders';
import {
  projetAPI, anomalieAPI, executionAPI, dashboardAPI, reportAPI,
} from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import {
  getErrorMessage, formatDateTime, formatGravite,
  formatStatut, formatExecStatus,
} from '../../utils/helpers';

// Utility: download a Blob as file
const downloadFile = (content, filename, type = 'text/csv;charset=utf-8;') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// Convert array of objects to CSV
const toCSV = (rows, headers) => {
  if (!rows.length) return headers.map((h) => h.label).join(',') + '\n';
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const head = headers.map((h) => h.label).join(',');
  const body = rows.map((r) => headers.map((h) => escape(h.get(r))).join(',')).join('\n');
  return '\ufeff' + head + '\n' + body; // BOM pour Excel
};

export default function Rapports() {
  const { user, isAdmin } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // type en cours

  useEffect(() => {
    (async () => {
      try {
        const { data } = isAdmin 
          ? await projetAPI.getAll() 
          : await projetAPI.getByTesteur(user.userId);
        setProjets(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [user, isAdmin]);

  const generateAnomaliesReport = async () => {
    setGenerating('anomalies');
    try {
      const { data } = selectedProjet
        ? await anomalieAPI.getByProjet(selectedProjet)
        : await anomalieAPI.getAll();
      const headers = [
        { label: 'ID', get: (r) => r.id },
        { label: 'Titre', get: (r) => r.titre },
        { label: 'Description', get: (r) => r.description },
        { label: 'Gravité', get: (r) => formatGravite(r.gravite) },
        { label: 'Statut', get: (r) => formatStatut(r.statut) },
        { label: 'Date de création', get: (r) => formatDateTime(r.dateCreation) },
        { label: 'Commentaire', get: (r) => r.commentaire },
      ];
      const csv = toCSV(data, headers);
      const projet = projets.find((p) => p.id === parseInt(selectedProjet));
      const suffix = projet ? `_${projet.nom.replace(/\s+/g, '_')}` : '_global';
      downloadFile(csv, `rapport_anomalies${suffix}_${Date.now()}.csv`);
      toast.success(`${data.length} anomalie(s) exportée(s)`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(null);
    }
  };

  const generateExecutionsReport = async () => {
    if (!selectedProjet) {
      toast.error('Sélectionnez un projet pour générer un rapport d\'exécutions');
      return;
    }
    setGenerating('executions');
    try {
      const { data } = await executionAPI.getByProjet(selectedProjet);
      const headers = [
        { label: 'ID', get: (r) => `EXE-${r.id}` },
        { label: 'Statut', get: (r) => formatExecStatus(r.statut) },
        { label: 'Commentaire', get: (r) => r.commentaire },
        { label: 'Date d\'exécution', get: (r) => formatDateTime(r.dateExecution || r.dateCreation) },
        { label: 'Cas de test', get: (r) => r.casDeTest?.titre || r.casDeTest?.nom || `CT-${r.casDeTest?.id || ''}` },
        { label: 'URL Capture', get: (r) => r.urlCapture },
      ];
      const csv = toCSV(data, headers);
      const projet = projets.find((p) => p.id === parseInt(selectedProjet));
      const suffix = projet ? `_${projet.nom.replace(/\s+/g, '_')}` : '';
      downloadFile(csv, `rapport_executions${suffix}_${Date.now()}.csv`);
      toast.success(`${data.length} exécution(s) exportée(s)`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(null);
    }
  };

  const generateDashboardReport = async () => {
    setGenerating('dashboard');
    try {
      const { data } = selectedProjet
        ? await dashboardAPI.getByProjet(selectedProjet)
        : await dashboardAPI.getGlobal();
      const json = JSON.stringify(data, null, 2);
      const projet = projets.find((p) => p.id === parseInt(selectedProjet));
      const suffix = projet ? `_${projet.nom.replace(/\s+/g, '_')}` : '_global';
      downloadFile(json, `rapport_kpi${suffix}_${Date.now()}.json`, 'application/json');
      toast.success('Rapport KPI téléchargé');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(null);
    }
  };

  const generatePDFReport = async () => {
    if (!selectedProjet) {
      toast.error('Sélectionnez un projet pour le rapport PDF');
      return;
    }
    setGenerating('pdf');
    try {
      const { data } = await reportAPI.downloadProjetReport(selectedProjet);
      const projet = projets.find((p) => p.id === parseInt(selectedProjet));
      const filename = `Rapport_Test_${projet?.nom.replace(/\s+/g, '_')}.pdf`;
      downloadFile(data, filename, 'application/pdf');
      toast.success('Rapport PDF généré');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(null);
    }
  };

  if (loading) return <PageLoader />;

  const cards = [
    {
      key: 'pdf',
      title: 'Rapport PDF Officiel',
      description: 'Document complet formaté avec résumé projet, statistiques et liste détaillée des anomalies',
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      action: generatePDFReport,
      format: 'PDF',
      requireProjet: true,
    },
    {
      key: 'anomalies',
      title: 'Rapport des anomalies',
      description: 'Liste complète des anomalies avec gravité, statut, descriptions et commentaires',
      icon: Bug,
      color: 'bg-red-50 text-red-600',
      action: generateAnomaliesReport,
      format: 'CSV',
      requireProjet: false,
    },
    {
      key: 'executions',
      title: 'Rapport des exécutions',
      description: 'Détail des exécutions de tests avec leurs résultats par projet',
      icon: ClipboardList,
      color: 'bg-blue-50 text-blue-600',
      action: generateExecutionsReport,
      format: 'CSV',
      requireProjet: true,
    },
    {
      key: 'dashboard',
      title: 'Rapport KPI / Synthèse',
      description: 'Statistiques agrégées : taux de réussite, totaux, métriques globales',
      icon: FileText,
      color: 'bg-purple-50 text-purple-600',
      action: generateDashboardReport,
      format: 'JSON',
      requireProjet: false,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rapports"
        subtitle="Générer et télécharger les rapports de tests et d'anomalies"
      />

      {/* Filtre projet */}
      <div className="card p-5">
        <label className="form-label flex items-center gap-2">
          <FolderKanban className="w-4 h-4" />
          Filtrer par projet (optionnel)
        </label>
        <select
          value={selectedProjet}
          onChange={(e) => setSelectedProjet(e.target.value)}
          className="form-input md:max-w-md"
        >
          <option value="">— Tous les projets (global) —</option>
          {projets.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Certains rapports nécessitent la sélection d'un projet spécifique.
        </p>
      </div>

      {/* Cards rapports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          const disabled = c.requireProjet && !selectedProjet;
          const isLoading = generating === c.key;
          return (
            <div key={c.key} className="card p-6 flex flex-col">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">{c.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {c.format}
                </span>
                <button
                  onClick={c.action}
                  disabled={disabled || isLoading}
                  className="btn-primary text-xs px-3 py-2"
                  title={disabled ? 'Sélectionnez un projet d\'abord' : ''}
                >
                  {isLoading ? <Spinner size="sm" /> : <Download className="w-3.5 h-3.5" />}
                  Télécharger
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="card p-4 bg-blue-50 border-blue-100">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">À propos des rapports</p>
            <p className="text-blue-700">
              Les rapports CSV peuvent être ouverts dans Excel ou tout tableur. Les données reflètent l'état actuel de la base de données au moment de la génération.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
