import Modal from './Modal';
import { Spinner } from './Loaders';

export default function SessionFormModal({
  isOpen,
  onClose,
  editing,
  form,
  setForm,
  onSubmit,
  submitting,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Modifier la session' : 'Nouvelle session'}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="form-label">Nom *</label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="form-input"
            placeholder="ex: Session de tests v1.2"
          />
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="form-input min-h-[100px]"
            placeholder="Description de la session"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={submitting}>
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting && <Spinner size="sm" />}
            {editing ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
