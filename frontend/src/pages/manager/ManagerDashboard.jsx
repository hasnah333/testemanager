import { useEffect, useState } from 'react';
import {
  FolderKanban, Bug, CheckCircle, XCircle, ClipboardList,
  TrendingUp, AlertCircle, Sun, Cloud, CloudLightning,
  FileText, History, CheckSquare, MessageCircle, Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { projetAPI, dashboardAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('global');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await projetAPI.getByTesteur(user.userId);
        setProjets(data);
        setSelectedProjet('global');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjet) return;
    setLoadingStats(true);
    if (selectedProjet === 'global') {
      dashboardAPI.getGlobal()
        .then(({ data }) => setStats(data))
        .catch((err) => toast.error(getErrorMessage(err)))
        .finally(() => setLoadingStats(false));
    } else {
      dashboardAPI.getByProjet(selectedProjet.id)
        .then(({ data }) => setStats(data))
        .catch((err) => toast.error(getErrorMessage(err)))
        .finally(() => setLoadingStats(false));
    }
  }, [selectedProjet]);

  const handleValidate = async () => {
    if (!selectedProjet || selectedProjet === 'global') return;
    try {
      const { data } = await projetAPI.validate(selectedProjet.id);
      setSelectedProjet(data);
      setProjets(prev => prev.map(p => p.id === data.id ? data : p));
      toast.success('Phase validée avec succès');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <PageLoader />;

  const getWeather = () => {
    if (!stats) return { icon: Sun, label: 'Inconnu', color: 'text-gray-400' };
    if (stats.anomaliesCritiques > 0) return { icon: CloudLightning, label: 'Orage (Bloquant)', color: 'text-red-600', bg: 'bg-red-50' };
    if (stats.testsEchoues > 5) return { icon: Cloud, label: 'Nuageux (Instable)', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { icon: Sun, label: 'Ensoleillé (Stable)', color: 'text-yellow-500', bg: 'bg-yellow-50' };
  };

  const weather = getWeather();
  const WeatherIcon = weather.icon;

  const pieData = stats ? [
    { name: 'Réussis', value: stats.testsReussis || 0, color: '#10b981' },
    { name: 'Échoués', value: stats.testsEchoues || 0, color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de Pilotage"
        subtitle={`Bienvenue, Manager ${user?.username}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sélecteur et Info Projet */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <label className="form-label">Sélectionner un projet à superviser</label>
            <select
              value={selectedProjet === 'global' ? 'global' : selectedProjet?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'global') setSelectedProjet('global');
                else setSelectedProjet(projets.find(p => p.id === parseInt(val)));
              }}
              className="form-input"
            >
              <option value="global">Tous les projets</option>
              {projets.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>

          {selectedProjet === 'global' ? (
            <div className="card p-6 border-l-4 border-primary-500">
              <h2 className="text-xl font-bold text-gray-800">Tous les projets</h2>
              <p className="text-gray-500 mt-2">
                Supervision globale et statistiques agrégées pour l'ensemble des projets de test de la plateforme.
              </p>
            </div>
          ) : selectedProjet && (
            <div className="card p-6 border-l-4 border-primary-500">
              <h2 className="text-xl font-bold text-gray-800">{selectedProjet.nom}</h2>
              <p className="text-gray-500 mt-2">{selectedProjet.description}</p>
              <div className="flex gap-4 mt-4">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                  Créé le {new Date(selectedProjet.dateCreation).toLocaleDateString()}
                </span>
                {selectedProjet.archived && (
                  <span className="text-xs px-2 py-1 bg-amber-100 rounded text-amber-700 font-medium">
                    Archivé
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  selectedProjet.status === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  Statut : {selectedProjet.status === 'VALIDE' ? 'Validé' : 'En cours'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Météo du Projet */}
        <div className={`card p-6 flex flex-col items-center justify-center text-center ${weather.bg}`}>
          <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Météo du Projet</h3>
          <WeatherIcon className={`w-16 h-16 ${weather.color} mb-3`} />
          <p className={`text-lg font-bold ${weather.color}`}>{weather.label}</p>
          <p className="text-xs text-gray-500 mt-2">
            Basé sur {stats?.anomaliesCritiques || 0} anomalies critiques
          </p>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              label="Taux de Réussite"
              value={`${(stats.tauxReussite || 0).toFixed(1)}%`}
              color="green"
            />
            <StatCard
              icon={Bug}
              label="Anomalies Critiques"
              value={stats.anomaliesCritiques || 0}
              color="red"
            />
            <StatCard
              icon={Play}
              label="Tests Exécutés"
              value={stats.totalExecutions || 0}
              color="purple"
            />
            <StatCard
              icon={CheckSquare}
              label="Validation"
              value={selectedProjet === 'global' ? 'Global' : (selectedProjet?.status === 'VALIDE' ? 'Validé' : 'En attente')}
              color={selectedProjet === 'global' ? 'purple' : (selectedProjet?.status === 'VALIDE' ? 'green' : 'primary')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="card p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Qualité Globale</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="card p-6 space-y-4">
                <h3 className="font-semibold text-gray-800">Actions Rapides</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Link to="/manager/rapports" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Générer Rapport Officiel</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </Link>
                  <Link to="/manager/anomalies" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium">Superviser les Anomalies</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </Link>
                  <button 
                    onClick={handleValidate}
                    disabled={selectedProjet === 'global' || selectedProjet?.status === 'VALIDE'}
                    className={`flex items-center justify-between p-3 rounded-lg transition text-left ${
                      selectedProjet === 'global' || selectedProjet?.status === 'VALIDE' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-primary-50 hover:bg-primary-100 text-primary-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckSquare className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {selectedProjet === 'global' ? 'Sélectionnez un projet pour valider' : (selectedProjet?.status === 'VALIDE' ? 'Phase déjà validée' : 'Valider la Phase Actuelle')}
                      </span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
}
