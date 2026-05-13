import { useEffect, useState } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { scenarioAPI, projetAPI, moduleAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function Scenarios() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  // Liste enrichie : chaque scénario reçoit moduleId + moduleNom (via la relation chargée séparément)
  const [scenarios, setScenarios] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState(null);
  const [saving, setSaving] = useState(false);
  // Le backend ScenarioDTO attend "titre" + "objectif" (pas "description") + "moduleId" + "priority"
  const [formData, setFormData] = useState({ titre: '', objectif: '', priority: 'MEDIUM', moduleId: '' });

  // Charge modules + scénarios du projet, et associe chaque scénario à son module
  const loadData = async (projetId) => {
    if (!projetId) {
      setScenarios([]);
      setModules([]);
      return;
    }
    setLoadingScenarios(true);
    try {
      const { data: modulesData } = await moduleAPI.getByProjet(projetId);
      setModules(modulesData || []);

      const { data: scenarioList } = await scenarioAPI.getByProjet(projetId);
      
      const enriched = (scenarioList || []).map(s => {
        const mod = (modulesData || []).find(m => m.id === s.module?.id);
        return {
          ...s,
          moduleId: s.module?.id,
          moduleNom: mod ? mod.nom : (s.module?.nom || '-')
        };
      });
      
      setScenarios(enriched);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setScenarios([]);
      setModules([]);
    } finally {
      setLoadingScenarios(false);
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
    loadData(selectedProjet);
  }, [selectedProjet]);

  const openCreateModal = () => {
    if (!selectedProjet) {
      toast.error("Veuillez d'abord sélectionner un projet");
      return;
    }
    if (modules.length === 0) {
      toast.error('Créez d\'abord un module dans la page Modules avant d\'ajouter un scénario');
      return;
    }
    setEditingScenario(null);
    setFormData({
      titre: '',
      objectif: '',
      priority: 'MEDIUM',
      moduleId: modules[0]?.id ? String(modules[0].id) : '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingScenario(item);
    setFormData({
      titre: item.titre || item.nom || '',
      objectif: item.objectif || item.description || '',
      priority: item.priority || 'MEDIUM',
      moduleId: item.moduleId ? String(item.moduleId) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (!formData.moduleId) {
      toast.error('Veuillez sélectionner un module');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titre: formData.titre.trim(),
        objectif: formData.objectif.trim(),
        priority: formData.priority,
        moduleId: Number(formData.moduleId),
      };

      if (editingScenario?.id) {
        await scenarioAPI.update(editingScenario.id, payload);
        toast.success('Scénario modifié');
      } else {
        await scenarioAPI.create(payload);
        toast.success('Scénario créé');
      }

      setIsModalOpen(false);
      await loadData(selectedProjet);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Supprimer le scénario "${item.titre || item.nom}" ?`)) return;
    try {
      await scenarioAPI.delete(item.id);
      toast.success('Scénario supprimé');
      await loadData(selectedProjet);
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
      <PageHeader title="Scénarios" subtitle="Gestion des scénarios de test par projet" />

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
            Nouveau scénario
          </button>
        </div>
        {projets.length === 0 && (
          <p className="text-sm text-amber-600">
            Vous n'êtes assigné à aucun projet.
          </p>
        )}
        {projets.length > 0 && modules.length === 0 && !loadingScenarios && (
          <p className="text-sm text-amber-600">
            Aucun module pour ce projet. Créez d'abord un module dans la page « Modules ».
          </p>
        )}
      </div>

      {loadingScenarios ? (
        <div className="card p-8">
          <PageLoader message="Chargement des scénarios..." />
        </div>
      ) : scenarios.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="Aucun scénario"
            description="Aucun scénario trouvé pour ce projet."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <div key={s.id} className="card p-5 hover:shadow-card-hover transition">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                   <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SCN-{s.id}</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        {s.titre || s.nom}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityStyles(s.priority)} font-bold`}>
                          {s.priority}
                        </span>
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      {s.casDeTests?.length
                        ? `${s.casDeTests.length} cas de test`
                        : 'Aucun cas de test associé'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-icon" onClick={() => openEditModal(s)} title="Modifier">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{s.objectif || s.description || 'Aucun objectif renseigné'}</p>
              <p className="text-xs text-gray-500 mt-2 font-medium">Module : <span className="text-primary-600">MOD-{s.moduleId} — {s.moduleNom || '-'}</span></p>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingScenario ? 'Modifier scénario' : 'Nouveau scénario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Titre <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                className="form-input"
                placeholder="Titre du scénario"
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
          </div>
          <div>
            <label className="form-label">Module <span className="text-red-500">*</span></label>
            <select
              value={formData.moduleId}
              onChange={(e) => setFormData((prev) => ({ ...prev, moduleId: e.target.value }))}
              className="form-input"
              required
            >
              <option value="">Sélectionner un module</option>
              {modules.map((m) => (
                <option key={m.id} value={String(m.id)}>{m.nom || m.titre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Objectif</label>
            <textarea
              value={formData.objectif}
              onChange={(e) => setFormData((prev) => ({ ...prev, objectif: e.target.value }))}
              className="form-input min-h-[110px]"
              placeholder="Objectif du scénario"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : editingScenario ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
