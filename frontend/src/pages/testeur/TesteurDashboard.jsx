import { useEffect, useState } from 'react';
import {
  FolderKanban, Bug, CheckCircle, XCircle, ClipboardList,
  PlayCircle, TrendingUp, AlertCircle,
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

export default function TesteurDashboard() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('global');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  // Charger les projets du testeur
  useEffect(() => {
    if (!user?.userId) return;
    (async () => {
      try {
        const { data } = await projetAPI.getByTesteur(user.userId);
        if (data.length > 0) {
          setProjets(data);
          setSelectedProjet('global');
        } else {
          setProjets([]);
          setSelectedProjet(null);
        }
      } catch (err) {
        setProjets([]);
        setSelectedProjet(null);
        toast.error(getErrorMessage(err, 'Impossible de charger les projets'));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Charger les stats du projet sélectionné ou agréger
  useEffect(() => {
    if (!selectedProjet) {
      setStats(null);
      return;
    }
    setLoadingStats(true);
    if (selectedProjet === 'global') {
      Promise.all(projets.map(p => dashboardAPI.getByProjet(p.id)))
        .then((results) => {
          const aggregated = results.reduce((acc, { data }) => {
            return {
              totalModules: acc.totalModules + (data.totalModules || 0),
              totalScenarios: acc.totalScenarios + (data.totalScenarios || 0),
              totalCasDeTest: acc.totalCasDeTest + (data.totalCasDeTest || 0),
              totalExecutions: acc.totalExecutions + (data.totalExecutions || 0),
              testsReussis: acc.testsReussis + (data.testsReussis || 0),
              testsEchoues: acc.testsEchoues + (data.testsEchoues || 0),
              totalAnomalies: acc.totalAnomalies + (data.totalAnomalies || 0),
              anomaliesCritiques: acc.anomaliesCritiques + (data.anomaliesCritiques || 0)
            };
          }, {
            totalModules: 0,
            totalScenarios: 0,
            totalCasDeTest: 0,
            totalExecutions: 0,
            testsReussis: 0,
            testsEchoues: 0,
            totalAnomalies: 0,
            anomaliesCritiques: 0
          });
          aggregated.tauxReussite = aggregated.totalExecutions === 0 ? 0 : (aggregated.testsReussis * 100.0) / aggregated.totalExecutions;
          setStats(aggregated);
        })
        .catch((err) => {
          setStats(null);
          toast.error(getErrorMessage(err, 'Stats indisponibles'));
        })
        .finally(() => setLoadingStats(false));
    } else {
      dashboardAPI.getByProjet(selectedProjet.id)
        .then(({ data }) => setStats(data))
        .catch((err) => {
          setStats(null);
          toast.error(getErrorMessage(err, 'Stats indisponibles'));
        })
        .finally(() => setLoadingStats(false));
    }
  }, [selectedProjet, projets]);

  if (loading) return <PageLoader />;

  if (projets.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Bonjour, ${user?.username}`}
          subtitle="Tableau de bord testeur"
        />
        <div className="card">
          <EmptyState
            icon={AlertCircle}
            title="Aucun projet assigné"
            description="Vous n'êtes assigné à aucun projet pour le moment. Contactez votre administrateur."
          />
        </div>
      </div>
    );
  }

  const pieData = stats ? [
    { name: 'Réussis', value: stats.testsReussis || 0, color: '#10b981' },
    { name: 'Échoués', value: stats.testsEchoues || 0, color: '#ef4444' },
    {
      name: 'Autres',
      value: Math.max(0, (stats.totalExecutions || 0) - (stats.testsReussis || 0) - (stats.testsEchoues || 0)),
      color: '#94a3b8',
    },
  ].filter((d) => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user?.username}`}
        subtitle={selectedProjet === 'global'
          ? "Voici l'état global de vos projets de test"
          : `Statistiques du projet « ${selectedProjet.nom} »`
        }
      />

      {/* Sélecteur de projet */}
      {(projets.length > 0) && (
        <div className="card p-4">
          <label className="form-label">Projet sélectionné</label>
          <select
            value={selectedProjet === 'global' ? 'global' : selectedProjet?.id || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'global') setSelectedProjet('global');
              else setSelectedProjet(projets.find((p) => p.id === parseInt(val)));
            }}
            className="form-input md:max-w-md"
          >
            <option value="global">Tous les projets</option>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      )}

      {/* Projet info */}
      {selectedProjet === 'global' ? (
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Tous les projets</h2>
              <p className="text-sm text-white/90 mt-1">
                Visualisez l'état d'avancement et les statistiques consolidées de l'ensemble de vos projets assignés.
              </p>
            </div>
          </div>
        </div>
      ) : selectedProjet && (
        <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{selectedProjet.nom}</h2>
              <p className="text-sm text-white/90 mt-1">
                {selectedProjet.description || 'Pas de description'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {loadingStats ? (
        <PageLoader message="Chargement des statistiques..." />
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={ClipboardList}
              label="Cas de test"
              value={stats.totalCasDeTest || 0}
              color="primary"
            />
            <StatCard
              icon={PlayCircle}
              label="Exécutions"
              value={stats.totalExecutions || 0}
              color="purple"
            />
            <StatCard
              icon={Bug}
              label="Anomalies"
              value={stats.totalAnomalies || 0}
              color="red"
            />
            <StatCard
              icon={TrendingUp}
              label="Taux de réussite"
              value={`${(stats.tauxReussite || 0).toFixed(1)}%`}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatCard
              icon={CheckCircle}
              label="Tests réussis"
              value={stats.testsReussis || 0}
              color="green"
            />
            <StatCard
              icon={XCircle}
              label="Tests échoués"
              value={stats.testsEchoues || 0}
              color="red"
            />
            <StatCard
              icon={ClipboardList}
              label="Modules / Scénarios"
              value={`${stats.totalModules || 0} / ${stats.totalScenarios || 0}`}
              color="primary"
            />
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="card p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                Répartition des résultats de tests
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <EmptyState
            icon={AlertCircle}
            title="Aucune donnée"
            description="Aucune statistique disponible pour ce projet."
          />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/testeur/sessions" className="card p-5 hover:shadow-card-hover transition flex items-center gap-4">
          <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Sessions de test</h4>
            <p className="text-xs text-gray-500">Gérer les sessions</p>
          </div>
        </Link>
        <Link to="/testeur/executions" className="card p-5 hover:shadow-card-hover transition flex items-center gap-4">
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Exécutions</h4>
            <p className="text-xs text-gray-500">Lancer des tests</p>
          </div>
        </Link>
        <Link to="/testeur/anomalies" className="card p-5 hover:shadow-card-hover transition flex items-center gap-4">
          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Anomalies</h4>
            <p className="text-xs text-gray-500">Déclarer une anomalie</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
