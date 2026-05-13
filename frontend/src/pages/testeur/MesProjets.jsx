import { useEffect, useState } from 'react';
import { FolderKanban, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { projetAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function MesProjets() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;
    (async () => {
      try {
        const { data } = await projetAPI.getByTesteur(user.userId);
        setProjets(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes projets"
        subtitle={`Vous êtes assigné à ${projets.length} projet${projets.length > 1 ? 's' : ''}`}
      />

      {projets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet"
            description="Vous n'êtes assigné à aucun projet pour le moment."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projets.map((p) => (
            <Link
              key={p.id}
              to={`/testeur/projet/${p.id}`}
              className="card p-5 hover:shadow-card-hover transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{p.nom}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                {p.description || 'Aucune description'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <Calendar className="w-3.5 h-3.5" />
                Créé le {formatDate(p.dateCreation)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
