import { useState, useEffect } from 'react';
import { User, Mail, Shield, Lock, Eye, EyeOff, Save, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { userAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';

const roleLabels = {
  ADMIN:   { label: 'Administrateur', color: 'bg-blue-100 text-blue-700' },
  MANAGER: { label: 'Manager',        color: 'bg-violet-100 text-violet-700' },
  TESTEUR: { label: 'Testeur',        color: 'bg-emerald-100 text-emerald-700' },
};

export default function MonCompte() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]             = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [savingPwd, setSavingPwd]         = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userAPI.getMe();
        setProfile(data);
      } catch {
        toast.error('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setSavingPwd(true);
    try {
      await userAPI.changePassword(newPassword);
      toast.success('Mot de passe mis à jour avec succès');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPwd(false);
    }
  };

  const role = roleLabels[profile?.role] || roleLabels.TESTEUR;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Mon compte"
        subtitle="Gérez vos informations personnelles et votre sécurité"
      />

      {/* ── Carte profil ── */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
            {(profile?.username || user?.username)?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {loading ? '...' : profile?.username}
            </h2>
            {profile?.role && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${role.color}`}>
                {role.label}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Identifiant</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {loading ? '...' : profile?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Adresse email</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {loading ? '...' : (profile?.email || '—')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Rôle</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {loading ? '...' : role.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Changer le mot de passe ── */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-800">Changer le mot de passe</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Nouveau mot de passe */}
          <div>
            <label className="form-label">Nouveau mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmer */}
          <div>
            <label className="form-label">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`form-input pl-9 pr-10 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : ''
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={savingPwd || !newPassword || !confirmPassword}
              className="btn-primary"
            >
              {savingPwd ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
