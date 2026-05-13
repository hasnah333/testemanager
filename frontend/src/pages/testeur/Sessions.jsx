import { useEffect, useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import ConfirmDialog from '../../components/ConfirmDialog';
import ProjectSelector from '../../components/ProjectSelector';
import SessionCard from '../../components/SessionCard';
import SessionFormModal from '../../components/SessionFormModal';
import { PageLoader, EmptyState, Spinner } from '../../components/Loaders';
import { sessionAPI, projetAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

export default function Sessions() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', description: '', projetId: null, testeurId: user?.userId });
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Charger projets du testeur
  useEffect(() => {
    if (!user?.userId) return;
    (async () => {
      try {
        const { data } = await projetAPI.getByTesteur(user.userId);
        setProjets(data);
        if (data.length > 0) setSelectedProjet(String(data[0].id));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Charger sessions du projet
  useEffect(() => {
    if (!selectedProjet) { setSessions([]); return; }
    setLoadingSessions(true);
    sessionAPI.getByProjet(selectedProjet)
      .then(({ data }) => setSessions(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingSessions(false));
  }, [selectedProjet]);

  const reload = async () => {
    if (!selectedProjet) return;
    const { data } = await sessionAPI.getByProjet(selectedProjet);
    setSessions(data);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      nom: '',
      description: '',
      projetId: parseInt(selectedProjet),
      testeurId: user.userId
    });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ nom: s.nom, description: s.description || '', projetId: s.projet?.id || parseInt(selectedProjet) });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await sessionAPI.update(editing.id, form);
        toast.success('Session modifiée');
      } else {
        await sessionAPI.create(form);
        toast.success('Session créée');
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setSubmitting(true);
    try {
      await sessionAPI.delete(confirmDelete.id);
      toast.success('Session supprimée');
      setConfirmDelete(null);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions de test"
        subtitle="Gérez vos sessions de test par projet"
        actions={
          selectedProjet && (
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" />
              Nouvelle session
            </button>
          )
        }
      />

      <ProjectSelector
        projets={projets}
        selectedProjet={selectedProjet}
        onChange={setSelectedProjet}
      />

      {/* Sessions list */}
      {loadingSessions ? (
        <div className="card p-8"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ClipboardList}
            title="Aucune session"
            description="Créez votre première session de test pour ce projet"
            action={selectedProjet && (
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                Créer une session
              </button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onEdit={openEdit}
              onDelete={setConfirmDelete}
            />
          ))}
        </div>
      )}

      <SessionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={!!editing}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

    </div>
  );
}
