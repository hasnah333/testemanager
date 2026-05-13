import { useEffect, useState } from 'react';
import {
  Plus, Edit2, Trash2, Search, FolderKanban, Users as UsersIcon,
  UserPlus, X, Calendar, Archive,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PageLoader, EmptyState, Spinner } from '../../components/Loaders';
import { projetAPI, userAPI, membreAPI } from '../../api/services';
import { getErrorMessage, formatDate } from '../../utils/helpers';

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nom: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  // Team modal
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState(null);
  const [projetMembres, setProjetMembres] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([
        projetAPI.getAll(),
        userAPI.getEligible().catch(() => ({ data: [] })),
      ]);
      setProjets(pRes.data);
      setEligibleUsers(eRes.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nom: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ nom: p.nom, description: p.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await projetAPI.update(editing.id, form);
        toast.success('Projet modifié');
      } else {
        await projetAPI.create(form);
        toast.success('Projet créé');
      }
      setModalOpen(false);
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
      await projetAPI.delete(confirmDelete.id);
      toast.success('Projet supprimé');
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ===== TEAM MANAGEMENT =====
  const openTeamModal = async (p) => {
    setSelectedProjet(p);
    setTeamModalOpen(true);
    setLoadingTeam(true);
    try {
      const { data } = await membreAPI.getByProjet(p.id);
      setProjetMembres(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setProjetMembres([]);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleAssign = async (userId) => {
    try {
      await membreAPI.assigner(userId, selectedProjet.id);
      toast.success('Membre assigné');
      const { data } = await membreAPI.getByProjet(selectedProjet.id);
      setProjetMembres(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleRemove = async (userId) => {
    try {
      await membreAPI.retirer(userId, selectedProjet.id);
      toast.success('Membre retiré');
      const { data } = await membreAPI.getByProjet(selectedProjet.id);
      setProjetMembres(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleArchive = async (p) => {
    try {
      // Envoyer uniquement les champs attendus par le ProjetDTO
      const payload = {
        nom: p.nom,
        description: p.description,
        archived: true
      };
      await projetAPI.update(p.id, payload);
      toast.success('Projet archivé');
      await loadData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filtered = projets.filter((p) => {
    const matchSearch = !search || p.nom?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && !p.archived;
  });

  // IDs des membres déjà assignés au projet sélectionné
  const assignedIds = new Set(projetMembres.map((m) => m.user?.id || m.userId));
  const availableMembers = eligibleUsers.filter((t) => !assignedIds.has(t.id));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des projets"
        subtitle={`${projets.length} projet${projets.length > 1 ? 's' : ''} créé${projets.length > 1 ? 's' : ''}`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" />
            Nouveau projet
          </button>
        }
      />

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      {/* Grille de projets */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderKanban}
            title="Aucun projet"
            description="Commencez par créer votre premier projet"
            action={
              <button onClick={openCreate} className="btn-primary">
                <Plus className="w-4 h-4" />
                Créer un projet
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="card p-5 hover:shadow-card-hover transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleArchive(p)} className="btn-icon text-amber-600 hover:bg-amber-50" title="Archiver">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(p)} className="btn-icon" title="Modifier">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{p.nom}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                {p.description || 'Aucune description'}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(p.dateCreation)}
                </div>
                <button
                  onClick={() => openTeamModal(p)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <UsersIcon className="w-3.5 h-3.5" />
                  Équipe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal create/edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Modifier le projet' : 'Nouveau projet'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nom du projet *</label>
            <input
              type="text" required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="form-input"
              placeholder="ex: Application e-commerce"
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="form-input min-h-[100px]"
              placeholder="Décrivez l'objectif du projet..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" disabled={submitting}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Team management modal */}
      <Modal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        title={`Équipe — ${selectedProjet?.nom || ''}`}
        size="lg"
      >
        {loadingTeam ? (
          <div className="py-8 text-center"><Spinner /></div>
        ) : (
          <div className="space-y-6">
            {/* Assigned testeurs */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Membres du projet ({projetMembres.length})
              </h4>
              {projetMembres.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md text-sm text-gray-400">
                  Aucun membre assigné
                </div>
              ) : (
                <div className="space-y-2">
                  {projetMembres.map((m) => {
                    const u = m.user || m;
                    return (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold uppercase">
                            {u.username?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {u.username}
                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${
                                u.role === 'MANAGER' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            {u.email && <div className="text-xs text-gray-500">{u.email}</div>}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemove(u.id)}
                          className="btn-icon hover:bg-red-50 hover:text-red-600"
                          title="Retirer du projet"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available members */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Membres disponibles ({availableMembers.length})
              </h4>
              {availableMembers.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md text-sm text-gray-400">
                  Tous les membres éligibles sont déjà assignés
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableMembers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold uppercase">
                          {t.username?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">
                            {t.username} 
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${
                              t.role === 'MANAGER' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              {t.role}
                            </span>
                          </div>
                          {t.email && <div className="text-xs text-gray-500">{t.email}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssign(t.id)}
                        className="text-xs px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Ajouter
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
