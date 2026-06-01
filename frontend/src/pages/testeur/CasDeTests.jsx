import { useEffect, useState } from 'react';
import { FileText, Search, Plus, Pencil, Trash2, PlayCircle, Sparkles } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { PageLoader, EmptyState } from '../../components/Loaders';
import { casDeTestAPI, projetAPI, scenarioAPI, moduleAPI, sessionAPI, executionAPI, chatAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function CasDeTests() {
  const { user } = useAuth();
  const [projets, setProjets] = useState([]);
  const [selectedProjet, setSelectedProjet] = useState('');
  // Cas de test enrichis avec scenarioId + scenarioTitre (cross-reference)
  const [casDeTests, setCasDeTests] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [modules, setModules] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingCases, setLoadingCases] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
  const [selectedCasForLaunch, setSelectedCasForLaunch] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [launching, setLaunching] = useState(false);

  const [editingCase, setEditingCase] = useState(null);
  const [saving, setSaving] = useState(false);
  // Le backend CasDeTestDTO attend : titre, description, etapes, resultatAttendu, scenarioId, priority
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    priority: 'MEDIUM',
    etapes: '',
    resultatAttendu: '',
    scenarioId: '',
  });

  // Charge modules → scénarios → cas de test, et associe chaque cas à son scénario
  const loadData = async (projetId) => {
    if (!projetId) {
      setCasDeTests([]);
      setScenarios([]);
      return;
    }
    setLoadingCases(true);
    try {
      const { data: scenarioList } = await scenarioAPI.getByProjet(projetId);
      setScenarios(scenarioList || []);

      const allCases = [];
      if (scenarioList) {
        for (const s of scenarioList) {
          try {
            const { data: cases } = await casDeTestAPI.getByScenario(s.id);
            (cases || []).forEach((c) => {
              allCases.push({
                ...c,
                scenarioId: s.id,
                scenarioTitre: s.titre,
              });
            });
          } catch { /* ignore */ }
        }
      }
      setCasDeTests(allCases);

      const { data: sessList } = await sessionAPI.getByProjet(projetId).catch(() => ({ data: [] }));
      setSessions(sessList || []);
      
      const { data: modulesData } = await moduleAPI.getByProjet(projetId).catch(() => ({ data: [] }));
      setModules(modulesData || []);

    } catch (err) {
      toast.error(getErrorMessage(err));
      setCasDeTests([]);
      setScenarios([]);
    } finally {
      setLoadingCases(false);
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

  const openLaunchModal = (cas) => {
    setSelectedCasForLaunch(cas);
    if (sessions.length > 0) {
      setSelectedSessionId(String(sessions[0].id));
    } else {
      setSelectedSessionId('NEW');
    }
    setIsLaunchModalOpen(true);
  };

  const handleLaunch = async () => {
    if (!selectedSessionId) return;
    setLaunching(true);
    try {
      let sessionId = selectedSessionId;

      // Si aucune session n'existe, on en crée une automatiquement
      if (selectedSessionId === 'NEW') {
        const { data: newSess } = await sessionAPI.create({
          nom: `Session automatique - ${new Date().toLocaleDateString()}`,
          commentaire: 'Session créée automatiquement pour exécution rapide.',
          projetId: parseInt(selectedProjet),
          testeurId: user.userId,
          statut: 'EN_COURS'
        });
        sessionId = newSess.id;
        // On rafraîchit la liste des sessions pour l'UI
        const { data: sessList } = await sessionAPI.getByProjet(selectedProjet);
        setSessions(sessList);
      }

      await executionAPI.lancer({
        casDeTestId: selectedCasForLaunch.id,
        sessionTestId: parseInt(sessionId),
        status: 'PENDING'
      });
      toast.success('Test lancé ! Retrouvez-le dans "Exécutions"');
      setIsLaunchModalOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLaunching(false);
    }
  };

  const openCreateModal = () => {
    if (!selectedProjet) {
      toast.error("Veuillez d'abord sélectionner un projet");
      return;
    }
    setEditingCase(null);
    setFormData({
      titre: '',
      description: '',
      priority: 'MEDIUM',
      etapes: '',
      resultatAttendu: '',
      scenarioId: scenarios[0]?.id ? String(scenarios[0].id) : '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingCase(item);
    setFormData({
      titre: item.titre || item.nom || '',
      description: item.description || '',
      priority: item.priority || 'MEDIUM',
      etapes: item.etapes || '',
      resultatAttendu: item.resultatAttendu || '',
      scenarioId: item.scenarioId ? String(item.scenarioId) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titre.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }
    if (!formData.scenarioId) {
      toast.error('Veuillez sélectionner un scénario');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        titre: formData.titre.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        etapes: formData.etapes.trim(),
        resultatAttendu: formData.resultatAttendu.trim(),
        scenarioId: Number(formData.scenarioId),
      };

      if (editingCase?.id) {
        await casDeTestAPI.update(editingCase.id, payload);
        toast.success('Cas de test modifié');
      } else {
        await casDeTestAPI.create(payload);
        toast.success('Cas de test créé');
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
    if (!window.confirm(`Supprimer le cas de test "${item.titre || item.nom}" ?`)) return;
    try {
      await casDeTestAPI.delete(item.id);
      toast.success('Cas de test supprimé');
      await loadData(selectedProjet);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!formData.titre.trim()) {
      toast.error("Veuillez d'abord saisir un titre pour guider l'IA");
      return;
    }
    if (!formData.scenarioId) {
      toast.error("Veuillez sélectionner un scénario");
      return;
    }

    const scenario = scenarios.find(s => String(s.id) === String(formData.scenarioId));
    
    setIsGenerating(true);
    const loadingToast = toast.loading("L'IA génère les détails du test...");
    try {
      const prompt = `Génère les détails d'un cas de test logiciel au format JSON strict.
Titre du cas de test: ${formData.titre}
Scénario: ${scenario?.titre || ''}
Description scénario: ${scenario?.description || ''}
Réponds UNIQUEMENT avec ce JSON (sans texte autour):
{"description":"...","etapes":"...","resultatAttendu":"..."}`;
      const { data } = await chatAPI.ask(prompt);

      if (data.answer) {
        try {
          const jsonMatch = data.answer.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : data.answer);
          setFormData(prev => ({
            ...prev,
            description: parsed.description || prev.description,
            etapes: parsed.etapes || prev.etapes,
            resultatAttendu: parsed.resultatAttendu || prev.resultatAttendu
          }));
          toast.success("Détails générés par l'IA !");
        } catch (e) {
          setFormData(prev => ({ ...prev, description: data.answer }));
          toast.success("Détails générés par l'IA !");
        }
      }
    } catch (err) {
      toast.error("Échec de la génération IA");
    } finally {
      setIsGenerating(false);
      toast.dismiss(loadingToast);
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

  const filtered = casDeTests.filter((c) => {
    const query = search.toLowerCase();
    return (
      !query ||
      c.titre?.toLowerCase().includes(query) ||
      c.nom?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.scenarioTitre?.toLowerCase().includes(query)
    );
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader title="Cas de test" subtitle="Gestion des cas de test par projet" />

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={selectedProjet}
            onChange={(e) => setSelectedProjet(e.target.value)}
            className="form-input"
          >
            {projets.length === 0 && <option value="">Aucun projet</option>}
            {projets.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.nom}</option>
            ))}
          </select>
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
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary inline-flex items-center justify-center gap-2"
            disabled={!selectedProjet}
          >
            <Plus className="w-4 h-4" />
            Nouveau cas
          </button>
        </div>
        {projets.length > 0 && scenarios.length === 0 && !loadingCases && (
          <p className="mt-3 text-sm text-amber-600">
            Aucun scénario disponible. Créez d'abord un module puis un scénario.
          </p>
        )}
      </div>

      {loadingCases ? (
        <div className="card p-8">
          <PageLoader message="Chargement des cas de test..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title={selectedProjet ? 'Aucun cas de test' : 'Sélectionnez un projet'}
            description={selectedProjet
              ? "Aucun cas de test n'a été trouvé pour ce projet."
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
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Priorité</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Scénario</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-bold text-gray-400 mb-1">CT-{c.id}</div>
                    <div className="font-medium text-gray-800">{c.titre || c.nom}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getPriorityStyles(c.priority)} font-bold whitespace-nowrap`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">SCN-{c.scenarioId} — {c.scenarioTitre || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xl">{c.description || 'Aucune description'}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn-icon text-primary-600 hover:bg-primary-50"
                        onClick={() => openLaunchModal(c)}
                        title="Lancer le test"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>
                      <button className="btn-icon" onClick={() => openEditModal(c)} title="Modifier">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Lancement */}
      <Modal
        isOpen={isLaunchModalOpen}
        onClose={() => !launching && setIsLaunchModalOpen(false)}
        title="Lancer une exécution"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Sélectionnez la session de test pour le cas : <strong>{selectedCasForLaunch?.titre || selectedCasForLaunch?.nom}</strong>
          </p>
          <div>
            <label className="form-label">Session de test</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="form-input"
            >
              {sessions.length === 0 && (
                <option value="NEW">Créer une nouvelle session automatiquement</option>
              )}
              {sessions.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.nom}</option>
              ))}
              {sessions.length > 0 && (
                <option value="NEW">+ Créer une autre session automatique</option>
              )}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setIsLaunchModalOpen(false)} disabled={launching}>
              Annuler
            </button>
            <button type="button" className="btn-primary" onClick={handleLaunch} disabled={launching}>
              {launching ? 'Lancement...' : 'Confirmer le lancement'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingCase ? 'Modifier cas de test' : 'Nouveau cas de test'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="form-label">Titre <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                  className="form-input"
                  placeholder="Titre du cas de test"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !formData.titre.trim()}
                  className="btn-secondary px-3 flex items-center gap-1.5 whitespace-nowrap text-xs border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                  title="Générer les étapes avec l'IA"
                >
                  <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                  IA
                </button>
              </div>
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
            <label className="form-label">Scénario <span className="text-red-500">*</span></label>
            <select
              value={formData.scenarioId}
              onChange={(e) => setFormData((prev) => ({ ...prev, scenarioId: e.target.value }))}
              className="form-input"
              required
            >
              <option value="">Sélectionner un scénario</option>
              {scenarios.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.moduleNom ? `${s.moduleNom} → ${s.titre || s.nom}` : (s.titre || s.nom)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="form-input min-h-[80px]"
              placeholder="Description courte du cas de test"
            />
          </div>
          <div>
            <label className="form-label">Étapes</label>
            <textarea
              value={formData.etapes}
              onChange={(e) => setFormData((prev) => ({ ...prev, etapes: e.target.value }))}
              className="form-input min-h-[100px]"
              placeholder="1. Ouvrir la page&#10;2. Cliquer sur le bouton...&#10;3. Vérifier..."
            />
          </div>
          <div>
            <label className="form-label">Résultat attendu</label>
            <textarea
              value={formData.resultatAttendu}
              onChange={(e) => setFormData((prev) => ({ ...prev, resultatAttendu: e.target.value }))}
              className="form-input min-h-[80px]"
              placeholder="Ce qui doit se produire si le test passe"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : editingCase ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
