import { useEffect, useState } from 'react';
import { Bug, Search, Trash2, Edit2, MessageSquare, Filter, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PageLoader, EmptyState, Spinner } from '../../components/Loaders';
import { anomalieAPI, projetAPI, executionAPI } from '../../api/services';
import {
  getErrorMessage, formatDateTime, getGraviteColor,
  getStatutColor, formatGravite, formatStatut,
} from '../../utils/helpers';

export default function Anomalies() {
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [anomalies, setAnomalies] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [filterGravite, setFilterGravite] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    titre: '', description: '', gravite: 'MAJEURE', executionId: '',
    priorite: 'Major', typeAnomalie: 'Bug',
  });
  const [submitting, setSubmitting] = useState(false);

  // Prédiction IA de la sévérité
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

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

  const loadData = async () => {
    if (!selectedProjet) return;
    const { data } = await anomalieAPI.getByProjet(selectedProjet);
    setAnomalies(data);
  };

  const openCreate = () => {
    setForm({
      titre: '', description: '', gravite: 'MAJEURE', executionId: executions[0]?.id || '',
      priorite: 'Major', typeAnomalie: 'Bug',
    });
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
        priorite: form.priorite,
        typeAnomalie: form.typeAnomalie,
        module: projetNom,
      };
      await anomalieAPI.declarer(payload);
      toast.success('Anomalie déclarée');
      setModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (a) => {
    setSelected(a);
    setComment(a.commentaire || '');
    setDetailOpen(true);
  };

  const handleStatutChange = async (statut) => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { data } = await anomalieAPI.changerStatut(selected.id, statut);
      toast.success('Statut mis à jour');
      setSelected(data);
      await loadData();
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
      await loadData();
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
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = anomalies.filter((a) => {
    const matchSearch = !search ||
      a.titre?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'ALL' || a.statut === filterStatut;
    const matchGravite = filterGravite === 'ALL' || a.gravite === filterGravite;
    return matchSearch && matchStatut && matchGravite;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des anomalies"
        subtitle={`${anomalies.length} anomalie${anomalies.length > 1 ? 's' : ''} déclarée${anomalies.length > 1 ? 's' : ''}`}
        actions={
          selectedProjet && (
            <button onClick={openCreate} className="btn-primary" disabled={executions.length === 0}>
              <Plus className="w-4 h-4" />
              Déclarer une anomalie
            </button>
          )
        }
      />

      {/* Filtres */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedProjet}
              onChange={(e) => setSelectedProjet(e.target.value)}
              className="form-input pl-9"
              disabled={loadingList}
            >
              {projets.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="form-input"
          >
            <option value="ALL">Tous statuts</option>
            <option value="OUVERTE">Ouverte</option>
            <option value="EN_COURS">En cours</option>
            <option value="CORRIGEE">Corrigée</option>
            <option value="FERMEE">Fermée</option>
          </select>
          <select
            value={filterGravite}
            onChange={(e) => setFilterGravite(e.target.value)}
            className="form-input"
          >
            <option value="ALL">Toutes gravités</option>
            <option value="BLOQUANTE">Bloquante</option>
            <option value="MAJEURE">Majeure</option>
            <option value="MINEURE">Mineure</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loadingList ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
            <span className="ml-2 text-gray-600">Chargement des anomalies...</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Bug} title="Aucune anomalie" description="Aucune anomalie ne correspond aux filtres" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => openDetail(a)}
                        className="text-left group"
                      >
                        <div className="font-medium text-gray-800 group-hover:text-primary-600 transition underline-offset-2 hover:underline">
                          {a.titre}
                        </div>
                        {a.description && (
                          <div className="text-xs text-gray-500 truncate max-w-md mt-0.5">{a.description}</div>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge border ${getGraviteColor(a.predictedSeverity || a.gravite)}`}>
                          {formatGravite(a.predictedSeverity || a.gravite)}
                        </span>
                        {a.predictedSeverity && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-400" title="Détecté par l'IA">
                            <Sparkles className="w-3 h-3" />
                            {a.predictionConfidence != null ? `${Math.round(a.predictionConfidence * 100)}%` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge border ${getStatutColor(a.statut)}`}>
                        {formatStatut(a.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(a.dateCreation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Détail de l'anomalie"
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selected.titre}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`badge border ${getGraviteColor(selected.gravite)}`}>
                  {formatGravite(selected.gravite)}
                </span>
                <span className={`badge border ${getStatutColor(selected.statut)}`}>
                  {formatStatut(selected.statut)}
                </span>
                {selected.predictedSeverity && (
                  <span className="text-xs text-indigo-600 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> IA : {formatGravite(selected.predictedSeverity)}
                    {selected.predictionConfidence != null && ` (${Math.round(selected.predictionConfidence * 100)}%)`}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Déclarée le {formatDateTime(selected.dateCreation)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                {selected.description || 'Aucune description'}
              </p>
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

            {/* Statut (Lecture seule) */}
            <div>
              <label className="form-label">Statut actuel</label>
              <div className={`badge border w-fit ${getStatutColor(selected.statut)}`}>
                {formatStatut(selected.statut)}
              </div>
            </div>

            {/* Commentaire (Lecture seule) */}
            <div>
              <label className="form-label flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Commentaire Expert
              </label>
              <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 p-3 rounded-md italic">
                {selected.commentaire || "Aucun commentaire pour le moment."}
              </div>
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

      {/* Modal création anomalie */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Déclarer une anomalie"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Titre *</label>
            <input
              type="text"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input min-h-[80px]"
              placeholder="Description détaillée de l'anomalie..."
            />
          </div>

          {/* Priorité + Type : utilisés par l'IA */}
          <div className="grid grid-cols-2 gap-4">
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
              <label className="form-label">Type</label>
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

          {/* Suggestion IA */}
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
                  <span className="text-xs font-medium text-emerald-600">✓ Appliquée</span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Gravité (finale)</label>
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
            <label className="form-label">Exécution *</label>
            <select
              value={form.executionId}
              onChange={(e) => setForm({ ...form, executionId: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Sélectionner une exécution</option>
              {executions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.casDeTest?.nom || `Exécution ${e.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting && <Spinner size="sm" />}
              Déclarer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
