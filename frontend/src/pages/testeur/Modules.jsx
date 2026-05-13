import { useEffect, useState } from 'react';
import { Layers, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { moduleAPI, projetAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Modules() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [saving, setSaving] = useState(false);
  // Le backend ModuleDTO attend "nom" (pas "titre")
  const [formData, setFormData] = useState({ nom: '', description: '', priority: 'MEDIUM' });

  const loadModules = async (projetId) => {
    if (!projetId) {
      setModules([]);
      return;
    }
    setLoadingModules(true);
    try {
      const { data } = await moduleAPI.getByProjet(projetId);
      setModules(data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;
    (async () => {
      try {
        const { data } = await projetAPI.getByTesteur(user.userId);
        setProjets(data || []);
        if (data?.length > 0) setSelectedProjet(String(data[0].id));
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    loadModules(selectedProjet);
  }, [selectedProjet]);

  const openCreateModal = () => {
    if (!selectedProjet) {
      toast.error("Veuillez d'abord sélectionner un projet");
      return;
    }
    setEditingModule(null);
    setFormData({ nom: '', description: '', priority: 'MEDIUM' });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingModule(item);
    setFormData({
      nom: item.nom || item.titre || '',
      description: item.description || '',
      priority: item.priority || 'MEDIUM',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjet) {
      toast.error('Veuillez sélectionner un projet');
      return;
    }
    if (!formData.nom.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    setSaving(true);
    try {
      // Payload conforme au ModuleDTO backend : { nom, description, projetId, priority }
      const payload = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        projetId: Number(selectedProjet),
      };

      if (editingModule?.id) {
        await moduleAPI.update(editingModule.id, payload);
        toast.success('Module modifié');
      } else {
        await moduleAPI.create(payload);
        toast.success('Module créé');
      }

      setIsModalOpen(false);
      await loadModules(selectedProjet);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Supprimer le module "${item.nom || item.titre}" ?`)) return;
    try {
      await moduleAPI.delete(item.id);
      toast.success('Module supprimé');
      await loadModules(selectedProjet);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getPriorityStyles = (p) => {
    switch (p) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Modules" subtitle="Gestion des modules de test par projet" />

      <div className="card p-4 space-y-3">
        <label className="form-label">Projet</label>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <select
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            className="form-input md:max-w-md"
          >
            {projets.length === 0 && <option value="">Aucun projet disponible</option>}
            {projets.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.nom}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary inline-flex items-center gap-2"
            disabled={projets.length === 0}
          >
            <Plus className="w-4 h-4" />
            Nouveau module
          </button>
        </div>
        {projets.length === 0 && (
          <p className="text-sm text-amber-600">
            Vous n'êtes assigné à aucun projet. Demandez à un administrateur de vous assigner.
          </p>
        )}
      </div>

      {loadingModules ? (
        <div className="card p-8">
          <PageLoader message="Chargement des modules..." />
        </div>
      ) : modules.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Layers}
            title="Aucun module"
            description="Aucun module trouvé pour ce projet. Cliquez sur 'Nouveau module' pour en créer un."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => (
            <div key={m.id} className="card p-5 hover:shadow-card-hover transition">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">MOD-{m.id}</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        {m.nom || m.titre}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityStyles(m.priority)} font-bold`}>
                          {m.priority}
                        </span>
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      {m.scenarios?.length
                        ? `${m.scenarios.length} scénario(s)`
                        : 'Aucun scénario associé'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-icon" onClick={() => openEditModal(m)} title="Modifier">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{m.description || 'Aucune description disponible'}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingModule ? 'Modifier module' : 'Nouveau module'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nom <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
              className="form-input"
              placeholder="Nom du module"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="form-label">Priorité</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
              className="form-input"
            >
              <option value="LOW">Basse</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Haute</option>
              <option value="CRITICAL">Critique</option>
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="form-input min-h-[110px]"
              placeholder="Description du module"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : editingModule ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
