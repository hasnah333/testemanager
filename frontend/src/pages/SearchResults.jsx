import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, FolderKanban, ClipboardList, Bug, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { PageLoader } from '../components/Loaders';
import { searchAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, formatGravite, formatStatut } from '../utils/helpers';

export default function SearchResults() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const basePath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'MANAGER' ? '/manager' : '/testeur';
  const testsPath = user?.role === 'TESTEUR' ? '/testeur/cas-de-tests' : `${basePath}/projets`;
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ projets: [], tests: [], anomalies: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data } = await searchAPI.global(query, user?.userId, user?.role);
        setResults(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [query, user]);

  if (loading) return <PageLoader />;

  const hasResults = results.projets.length > 0 || results.tests.length > 0 || results.anomalies.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Résultats pour "${query}"`}
        subtitle={`${results.projets.length + results.tests.length + results.anomalies.length} résultat(s) trouvé(s)`}
      />

      {!hasResults && !loading && (
        <div className="card p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
          <p className="text-gray-500">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* PROJETS */}
        {results.projets.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4" /> Projets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.projets.map((p) => (
                <Link key={p.id} to={`${basePath}/projets`} className="card p-4 hover:border-primary-300 transition group">
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition">{p.nom}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{p.description || 'Pas de description'}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TESTS */}
        {results.tests.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Cas de Test
            </h2>
            <div className="card divide-y divide-gray-100">
              {results.tests.map((t) => (
                <Link key={t.id} to={testsPath} className="flex items-center justify-between p-4 hover:bg-gray-50 transition group">
                  <div>
                    <h3 className="font-medium text-gray-800 group-hover:text-primary-600 transition">{t.titre}</h3>
                    <p className="text-[10px] font-bold text-gray-400">CT-{t.id}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ANOMALIES */}
        {results.anomalies.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Bug className="w-4 h-4" /> Anomalies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.anomalies.map((a) => (
                <Link key={a.id} to={`${basePath}/anomalies`} className="card p-4 hover:border-red-200 transition group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition">{a.titre}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-100 uppercase">
                      {formatGravite(a.gravite)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{a.description}</p>
                  <div className="mt-2 text-[10px] text-gray-400">Statut: {formatStatut(a.statut)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
