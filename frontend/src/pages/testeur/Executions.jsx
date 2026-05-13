import { useEffect, useState } from 'react';
import { PlayCircle, Camera, Edit2, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { PageLoader, EmptyState, Spinner } from '../../components/Loaders';
import { executionAPI, projetAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import {
  getErrorMessage, formatDateTime, getExecutionStatusColor, formatExecStatus,
} from '../../utils/helpers';

export default function Executions() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExec, setLoadingExec] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: 'PENDING', commentaire: '' });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (!selectedProjet) { setExecutions([]); return; }
    setLoadingExec(true);
    executionAPI.getByProjet(selectedProjet)
      .then(({ data }) => setExecutions(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingExec(false));
  }, [selectedProjet]);

  const reload = async () => {
    if (!selectedProjet) return;
    const { data } = await executionAPI.getByProjet(selectedProjet);
    setExecutions(data);
  };

  const openEdit = (e) => {
    setSelected(e);
    setForm({ status: e.status || 'PENDING', commentaire: e.commentaire || '' });
    setEditOpen(true);
  };

  const handleUpdate = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    try {
      await executionAPI.mettreAJour(selected.id, form);
      toast.success('Exécution mise à jour');
      setEditOpen(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadCapture = async (executionId, file) => {
    if (!file) return;
    setUploading(true);
    try {
      await executionAPI.joindreCapture(executionId, file);
      toast.success('Capture jointe');
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exécutions de test"
        subtitle="Suivez les exécutions de cas de test"
      />

      <div className="card p-4">
        <label className="form-label">Projet</label>
        <select
          value={selectedProjet}
          onChange={(e) => setSelectedProjet(e.target.value)}
          className="form-input md:max-w-md"
        >
          {projets.length === 0 && <option value="">Aucun projet</option>}
          {projets.map((p) => (
            <option key={p.id} value={p.id}>{p.nom}</option>
          ))}
        </select>
      </div>

      {loadingExec ? (
        <div className="card p-8"><Spinner /></div>
      ) : executions.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={PlayCircle}
            title="Aucune exécution"
            description="Aucune exécution de test pour ce projet pour l'instant."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cas de test</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capture</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {executions.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">EXE-{e.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {e.casDeTest?.titre || e.casDeTest?.nom || `CT-${e.casDeTest?.id || '-'}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge border ${getExecutionStatusColor(e.status)}`}>
                        {formatExecStatus(e.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(e.dateExecution || e.dateCreation)}
                    </td>
                    <td className="px-6 py-4">
                      {e.urlCapture ? (
                        <a href={e.urlCapture} target="_blank" rel="noreferrer" className="text-primary-500 hover:text-primary-700">
                          <ImageIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <label className="cursor-pointer btn-icon" title="Joindre une capture">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file" accept="image/*" hidden
                            onChange={(ev) => handleUploadCapture(e.id, ev.target.files[0])}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(e)} className="btn-icon" title="Mettre à jour">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Mettre à jour l'exécution">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="form-label">Statut</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="form-input"
            >
              <option value="PENDING">En attente</option>
              <option value="SUCCESS">Succès</option>
              <option value="FAILED">Échec</option>
              <option value="BLOCKED">Bloqué</option>
            </select>
          </div>
          <div>
            <label className="form-label">Commentaire</label>
            <textarea
              value={form.commentaire}
              onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
              className="form-input min-h-[100px]"
              placeholder="Observations..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary" disabled={submitting}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner size="sm" />} Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
