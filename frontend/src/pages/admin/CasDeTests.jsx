import { useEffect, useState } from 'react';
import { Search, FolderKanban } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { casDeTestAPI, projetAPI } from '../../api/services';
import { getErrorMessage, formatDateTime } from '../../utils/helpers';

export default function CasDeTests() {
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [casDeTests, setCasDeTests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCases, setLoadingCases] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await projetAPI.getAll();
        setProjets(data);
        if (data.length > 0) setSelectedProjet(String(data[0].id));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjet) {
      setCasDeTests([]);
      return;
    }

    setLoadingCases(true);
    (async () => {
      try {
        const { data } = await casDeTestAPI.getByProjet(selectedProjet);
        setCasDeTests(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
        setCasDeTests([]);
      } finally {
        setLoadingCases(false);
      }
    })();
  }, [selectedProjet]);

  const filtered = casDeTests.filter((c) => {
    const query = search.toLowerCase();
    return (
      !query ||
      c.titre?.toLowerCase().includes(query) ||
      c.nom?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.scenario?.titre?.toLowerCase().includes(query) ||
      c.scenario?.nom?.toLowerCase().includes(query)
    );
  });

  if (loading) return <PageLoader message="Chargement des projets..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cas de test"
        subtitle="Consultez les cas de test par projet"
      />

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
              className="form-input pl-9"
            >
              {projets.map((p) => (
                <option key={p.id} value={String(p.id)}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un cas de test..."
              className="form-input pl-9"
            />
          </div>
        </div>
      </div>

      {loadingCases ? (
        <div className="card p-8 text-center">
          <PageLoader message="Chargement des cas de test..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            title={selectedProjet ? 'Aucun cas de test' : 'Sélectionnez un projet'}
            description={selectedProjet
              ? 'Aucun cas de test n’a été trouvé pour ce projet.'
              : 'Choisissez un projet pour afficher les cas de test.'
            }
          />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Titre</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Scénario</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Créé le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{c.titre || c.nom}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.scenario?.titre || c.scenario?.nom || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xl">
                    {c.description || 'Aucune description'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDateTime(c.dateCreation) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
