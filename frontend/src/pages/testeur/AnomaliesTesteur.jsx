import { useEffect, useState } from 'react';
import { Bug, Plus, Edit2, MessageSquare, Trash2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PageLoader, EmptyState, Spinner } from '../../components/Loaders';
import { anomalieAPI, projetAPI, executionAPI, fileAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import {
  getErrorMessage, formatDateTime, getGraviteColor,
  getStatutColor, formatGravite, formatStatut,
} from '../../utils/helpers';

export default function AnomaliesTesteur() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [anomalies, setAnomalies] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    titre: '', description: '', gravite: 'MAJEURE', executionId: '',
    priorite: 'Major', typeAnomalie: 'Bug',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Prédiction IA de la sévérité
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

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
    if (!selectedProjet) { setAnomalies([]); setExecutions([]); return; }
    setLoadingList(true);
    Promise.all([
      anomalieAPI.getByProjet(selectedProjet),
      executionAPI.getByProjet(selectedProjet).catch(() => ({ data: [] })),
    ])
      .then(([aRes, eRes]) => {
        setAnomalies(aRes.data);
        setExecutions(eRes.data);
      })
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingList(false));
  }, [selectedProjet]);

  const reload = async () => {
    if (!selectedProjet) return;
    const { data } = await anomalieAPI.getByProjet(selectedProjet);
    setAnomalies(data);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      titre: '', description: '', gravite: 'MAJEURE', executionId: executions[0]?.id || '',
      priorite: 'Major', typeAnomalie: 'Bug',
    });
    setSelectedFile(null);
    setPrediction(null);
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      titre: a.titre,
      description: a.description || '',
      gravite: a.gravite,
      executionId: a.execution?.id || '',
      priorite: 'Major', typeAnomalie: 'Bug',
    });
    setSelectedFile(null);
    setPrediction(null);
    setModalOpen(true);
  };

  // Demande à l'IA une suggestion de sévérité (sans rien enregistrer)
  const handlePredict = async () => {
    if (!form.titre.trim()) {
      toast.error('Saisissez au moins le titre pour la suggestion IA');
      return;
    }
    setPredicting(true);
    try {
      const projetNom = projets.find((p) => String(p.id) === String(selectedProjet))?.nom || '';
      const { data } = await anomalieAPI.predictSeverity({
        titre: form.titre,
        description: form.description,
        priorite: form.priorite,
        type_anomalie: form.typeAnomalie,
        module: projetNom,
      });
      setPrediction(data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Prédiction IA indisponible'));
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.executionId) {
      toast.error('Veuillez sélectionner une exécution');
      return;
    }
    setSubmitting(true);
    try {
      const projetNom = projets.find((p) => String(p.id) === String(selectedProjet))?.nom || '';
      const payload = {
        titre: form.titre,
        description: form.description,
        gravite: form.gravite,
        executionId: parseInt(form.executionId),
        urlCapture: editing?.urlCapture || null,
        // Champs envoyés pour que le serveur recalcule/stocke la sévérité prédite
        priorite: form.priorite,
        typeAnomalie: form.typeAnomalie,
        module: projetNom,
      };

      if (selectedFile) {
        const { data: fileRes } = await fileAPI.upload(selectedFile);
        payload.urlCapture = fileRes.url;
      }
      if (editing) {
        await anomalieAPI.update(editing.id, payload);
        toast.success('Anomalie modifiée');
      } else {
        await anomalieAPI.declarer(payload);
        toast.success('Anomalie déclarée');
      }
      setModalOpen(false);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };


  const openDetail = (a) => {
    setSelected(a);
    setComment('');
    setDetailOpen(true);
  };

  const handleStatutChange = async (statut) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { data } = await anomalieAPI.changerStatut(selected.id, statut);
      toast.success('Statut mis à jour');
      setSelected(data);
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!selected || !comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await anomalieAPI.commenter(selected.id, comment);
      toast.success('Commentaire ajouté');
      setSelected(data);
      setComment('');
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
      await anomalieAPI.delete(confirmDelete.id);
      toast.success('Anomalie supprimée');
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
        title="Anomalies"
        subtitle="Déclarez et suivez les anomalies"
        actions={
          selectedProjet && user?.role !== 'MANAGER' && (
            <button onClick={openCreate} className="btn-primary" disabled={executions.length === 0}>
              <Plus className="w-4 h-4" />
              Déclarer une anomalie
            </button>
          )
        }
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

      {loadingList ? (
        <div className="card p-8"><Spinner /></div>
      ) : anomalies.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bug}
            title="Aucune anomalie"
            description={executions.length === 0
              ? "Vous devez d'abord avoir une exécution avant de déclarer une anomalie"
              : "Aucune anomalie n'a été déclarée pour ce projet"
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {anomalies.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{a.titre}</div>
                      {a.description && (
                        <div className="text-xs text-gray-500 truncate max-w-md mt-0.5">{a.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge border ${getGraviteColor(a.predictedSeverity || a.gravite)}`}>{formatGravite(a.predictedSeverity || a.gravite)}</span>
                        {a.predictedSeverity && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-400" title="Détecté par l'IA">
                            <Sparkles className="w-3 h-3" />
                            {a.predictionConfidence != null ? `${Math.round(a.predictionConfidence * 100)}%` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge border ${getStatutColor(a.statut)}`}>{formatStatut(a.statut)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(a.dateCreation)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(a)} className="btn-icon" title="Détail / commenter">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        {user?.role !== 'MANAGER' && (
                          <>
                            <button onClick={() => openEdit(a)} className="btn-icon" title="Modifier">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete(a)} className="btn-icon text-red-600 hover:bg-red-50" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal create/edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier l\'anomalie' : 'Déclarer une anomalie'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Titre *</label>
            <input
              type="text" required
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="form-input"
              placeholder="ex: Bouton de validation ne répond pas"
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input min-h-[120px]"
              placeholder="Étapes pour reproduire, comportement attendu vs observé..."
            />
          </div>

          {/* Priorité + Type : utilisés par l'IA pour la suggestion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Priorité</label>
              <select
                value={form.priorite}
                onChange={(e) => setForm({ ...form, priorite: e.target.value })}
                className="form-input"
              >
                <option value="Blocker">Blocker</option>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
                <option value="Trivial">Trivial</option>
              </select>
            </div>
            <div>
              <label className="form-label">Type d'anomalie</label>
              <select
                value={form.typeAnomalie}
                onChange={(e) => setForm({ ...form, typeAnomalie: e.target.value })}
                className="form-input"
              >
                <option value="Bug">Bug</option>
                <option value="Improvement">Amélioration</option>
                <option value="Task">Tâche</option>
                <option value="New Feature">Nouvelle fonctionnalité</option>
              </select>
            </div>
          </div>

          {/* Suggestion IA de la sévérité (l'utilisateur reste libre de la modifier) */}
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-700">
                <Sparkles className="w-4 h-4" />
                Sévérité suggérée par l'IA
              </div>
              <button
                type="button"
                onClick={handlePredict}
                disabled={predicting || !form.titre.trim()}
                className="btn-secondary text-xs"
              >
                {predicting && <Spinner size="sm" />}
                {predicting ? 'Analyse...' : 'Suggérer'}
              </button>
            </div>
            {prediction && (
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span className={`badge border ${getGraviteColor(prediction.severity)}`}>
                  {formatGravite(prediction.severity)}
                </span>
                {prediction.confidence != null && (
                  <span className="text-xs text-gray-500">
                    Confiance : {Math.round(prediction.confidence * 100)}%
                  </span>
                )}
                {form.gravite !== prediction.severity ? (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, gravite: prediction.severity })}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Appliquer cette sévérité
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">✓ Appliquée à la gravité</span>
                )}
              </div>
            )}
            <p className="mt-2 text-[11px] text-gray-400">
              Suggestion indicative : vous choisissez la gravité finale ci-dessous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Gravité *</label>
              <select
                value={form.gravite}
                onChange={(e) => setForm({ ...form, gravite: e.target.value })}
                className="form-input"
              >
                <option value="BLOQUANTE">Bloquante</option>
                <option value="MAJEURE">Majeure</option>
                <option value="MINEURE">Mineure</option>
              </select>
            </div>
            <div>
              <label className="form-label">Exécution liée *</label>
              <select
                value={form.executionId}
                onChange={(e) => setForm({ ...form, executionId: e.target.value })}
                className="form-input"
                required
              >
                <option value="">— Choisir —</option>
                {executions.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    Exécution EXE-{ex.id} — {formatStatut(ex.status) || ex.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Capture d'écran (Image)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="form-input text-sm"
            />
            {editing?.urlCapture && !selectedFile && (
              <p className="text-[10px] text-gray-400 mt-1 italic">Une capture existe déjà</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" disabled={submitting}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {editing ? 'Enregistrer' : 'Déclarer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Détail de l'anomalie" size="lg">
        {selected && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selected.titre}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`badge border ${getGraviteColor(selected.gravite)}`}>{formatGravite(selected.gravite)}</span>
                <span className={`badge border ${getStatutColor(selected.statut)}`}>{formatStatut(selected.statut)}</span>
                {selected.predictedSeverity && (
                  <span className="text-xs text-indigo-600 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> IA : {formatGravite(selected.predictedSeverity)}
                    {selected.predictionConfidence != null && ` (${Math.round(selected.predictionConfidence * 100)}%)`}
                  </span>
                )}
                <span className="text-xs text-gray-500">{formatDateTime(selected.dateCreation)}</span>
              </div>
            </div>
            <div>
              <label className="form-label">Description</label>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{selected.description || 'Aucune'}</p>
            </div>
            {selected.urlCapture && (
              <div>
                <label className="form-label">Capture d'écran</label>
                <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img 
                    src={selected.urlCapture} 
                    alt="Capture" 
                    className="max-h-[300px] mx-auto cursor-pointer hover:scale-[1.02] transition"
                    onClick={() => window.open(selected.urlCapture, '_blank')}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="form-label">Changer le statut</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['OUVERTE', 'EN_COURS', 'CORRIGEE', 'FERMEE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatutChange(s)}
                    disabled={submitting || selected.statut === s}
                    className={`px-3 py-2 text-xs font-medium rounded-md border transition ${
                      selected.statut === s
                        ? `${getStatutColor(s)} ring-2 ring-offset-1 ring-current`
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {formatStatut(s)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Commentaire</label>
              {selected.commentaire && (
                <div className="mb-3 text-sm text-gray-600 bg-amber-50 border border-amber-200 p-3 rounded-md">
                  {selected.commentaire}
                </div>
              )}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="form-input min-h-[80px]"
                placeholder="Ajouter un commentaire..."
              />
              <button onClick={handleAddComment} disabled={submitting || !comment.trim()} className="btn-primary mt-2">
                {submitting && <Spinner size="sm" />} Ajouter
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer l'anomalie"
        message={`Supprimer l'anomalie "${confirmDelete?.titre}" ?`}
        loading={submitting}
      />
    </div>
  );
}
