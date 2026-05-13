import { useEffect, useState } from 'react';
import { Archive, RotateCcw, Search, FolderKanban, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { projetAPI } from '../../api/services';
import { getErrorMessage, formatDate } from '../../utils/helpers';

export default function Archives() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await projetAPI.getAll();
      setProjets(data.filter(p => p.archived));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRestore = async (p) => {
    try {
      const payload = {
        nom: p.nom,
        description: p.description,
        archived: false
      };
      await projetAPI.update(p.id, payload);
      toast.success('Projet restauré');
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filtered = projets.filter((p) =>
    !search || p.nom?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archives des projets"
        subtitle={`${projets.length} projet${projets.length > 1 ? 's' : ''} archivé${projets.length > 1 ? 's' : ''}`}
      />

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les archives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Grille de projets archivés */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Archive}
            title="Aucune archive"
            description="Vous n'avez aucun projet archivé pour le moment."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card p-5 opacity-80 hover:opacity-100 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center">
                  <Archive className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleRestore(p)} 
                    className="btn-icon text-primary-600 hover:bg-primary-50" 
                    title="Restaurer le projet"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{p.nom}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {p.description || 'Aucune description'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <Calendar className="w-3.5 h-3.5" />
                Archivé (Créé le {formatDate(p.dateCreation)})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
