import { useEffect, useState } from 'react';
import {
  UserPlus, Edit2, Trash2, Search, Users as UsersIcon,
  Power, PowerOff, Mail, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { PageLoader, EmptyState, Spinner } from '../../components/Loaders';
import { userAPI, authAPI } from '../../api/services';
import { getErrorMessage, formatRole } from '../../utils/helpers';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'TESTEUR' });

  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll();
      setUsers(data);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible de charger les utilisateurs'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', email: '', password: '', role: 'TESTEUR' });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ username: u.username, email: u.email || '', password: '', role: u.role });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        // PUT (password optional)
        const payload = { username: form.username, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await userAPI.update(editingUser.id, payload);
        toast.success('Utilisateur modifié');
      } else {
        // Création via /api/auth/register
        if (!form.password) {
          toast.error('Mot de passe obligatoire à la création');
          setSubmitting(false);
          return;
        }
        await authAPI.register(form);
        toast.success('Utilisateur créé');
      }
      setModalOpen(false);
      await loadUsers();
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
      await userAPI.delete(confirmDelete.id);
      toast.success('Utilisateur supprimé');
      setConfirmDelete(null);
      await loadUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (u) => {
    try {
      if (u.active) await userAPI.desactiver(u.id);
      else await userAPI.activer(u.id);
      toast.success(u.active ? 'Compte désactivé' : 'Compte activé');
      await loadUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle={`${users.length} utilisateur${users.length > 1 ? 's' : ''} au total`}
        actions={
          <button onClick={openCreate} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        }
      />

      {/* Filtres */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="form-input md:w-48"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="MANAGER">Responsables (Managers)</option>
            <option value="TESTEUR">Testeurs</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Aucun utilisateur"
            description="Aucun utilisateur ne correspond à vos critères"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm uppercase">
                          {u.username?.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-800">{u.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {u.email}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                        u.role === 'MANAGER' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {formatRole(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleActive(u)}
                          className="btn-icon"
                          title={u.active ? 'Archiver (Désactiver)' : 'Restaurer (Activer)'}
                        >
                          {u.active ? <PowerOff className="w-4 h-4 text-amber-600" /> : <Power className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => openEdit(u)} className="btn-icon" title="Modifier">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nom d'utilisateur *</label>
            <input
              type="text" required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="form-input"
              placeholder="ex: jdupont"
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="form-input"
              placeholder="ex: jdupont@example.com"
            />
          </div>
          <div>
            <label className="form-label">
              Mot de passe {editingUser ? '' : '*'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="form-input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="form-label">Rôle *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="form-input"
            >
              <option value="TESTEUR">Testeur</option>
              <option value="MANAGER">Responsable (Manager)</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" disabled={submitting}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {editingUser ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
