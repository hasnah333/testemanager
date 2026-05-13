import { useEffect, useState } from 'react';
import {
  Users, FolderKanban, Bug, FileText, CheckCircle,
  XCircle, TrendingUp, ClipboardList,
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { PageLoader } from '../../components/Loaders';
import { dashboardAPI, userAPI, projetAPI } from '../../api/services';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [usersCount, setUsersCount] = useState(0);
  const [testeursCount, setTesteursCount] = useState(0);
  const [projetsCount, setProjetsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, testeursRes, projetsRes] = await Promise.all([
          userAPI.getAll().catch(() => ({ data: [] })),
          userAPI.getTesteurs().catch(() => ({ data: [] })),
          projetAPI.getAll().catch(() => ({ data: [] })),
        ]);
        setUsersCount(usersRes.data?.length || 0);
        setTesteursCount(testeursRes.data?.length || 0);
        setProjetsCount(projetsRes.data?.length || 0);
        setProjets(projetsRes.data || []);
        if (projetsRes.data?.length > 0) {
          setSelectedProjet(String(projetsRes.data[0].id));
        }
      } catch (err) {
        toast.error(getErrorMessage(err, 'Impossible de charger les statistiques'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedProjet) return;

    const fetchProjetStats = async () => {
      setLoadingStats(true);
      try {
        const { data } = await dashboardAPI.getByProjet(parseInt(selectedProjet, 10));
        setStats(data);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Impossible de charger les statistiques du projet'));
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProjetStats();
  }, [selectedProjet]);

  if (loading) return <PageLoader message="Chargement du tableau de bord..." />;

  const tauxReussite = stats?.tauxReussite || 0;

  // Données pour le pie chart (résultats des tests)
  const pieData = [
    { name: 'Réussis', value: stats?.testsReussis || 0, color: '#10b981' },
    { name: 'Échoués', value: stats?.testsEchoues || 0, color: '#ef4444' },
    {
      name: 'Autres',
      value: Math.max(0, (stats?.totalExecutions || 0) - (stats?.testsReussis || 0) - (stats?.testsEchoues || 0)),
      color: '#94a3b8',
    },
  ].filter((d) => d.value > 0);

  // Données pour le bar chart
  const barData = [
    { name: 'Modules', total: stats?.totalModules || 0 },
    { name: 'Scénarios', total: stats?.totalScenarios || 0 },
    { name: 'Exécutions', total: stats?.totalExecutions || 0 },
    { name: 'Anomalies', total: stats?.totalAnomalies || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={selectedProjet
          ? `Statistiques du projet « ${projets.find((p) => String(p.id) === selectedProjet)?.nom || ''} »`
          : 'Vue d\'ensemble de la plateforme'
        }
      />

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="form-label">Sélectionner un projet</label>
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
              className="form-input"
            >
              {projets.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {selectedProjet
              ? 'Les statistiques ci-dessous correspondent au projet sélectionné.'
              : 'Aucun projet sélectionné.'
            }
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={usersCount}
          trend={`${testeursCount} testeur${testeursCount > 1 ? 's' : ''}`}
          color="primary"
        />
        <StatCard
          icon={FolderKanban}
          label="Projets"
          value={projetsCount}
          trend="Total des projets"
          color="purple"
        />
        <StatCard
          icon={Bug}
          label="Anomalies"
          value={stats?.totalAnomalies || 0}
          trend="Toutes anomalies"
          color="red"
        />
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Tests réussis"
          value={stats?.testsReussis || 0}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Tests échoués"
          value={stats?.testsEchoues || 0}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="Taux de réussite"
          value={`${tauxReussite.toFixed(1)}%`}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Résultats des exécutions
          </h3>
          {pieData.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
              Aucune donnée d'exécution
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Activité globale
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: '6px', fontSize: '12px',
                }}
              />
              <Bar dataKey="total" fill="#4a90e2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bandeau infos */}
      <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              Centre de rapports
            </h3>
            <p className="text-sm text-white/90">
              Téléchargez les rapports de tests et d'anomalies depuis la section dédiée
            </p>
          </div>
          <a
            href="/admin/rapports"
            className="px-4 py-2 bg-white text-primary-600 rounded-md text-sm font-medium hover:bg-gray-50 transition"
          >
            Accéder
          </a>
        </div>
      </div>
    </div>
  );
}
