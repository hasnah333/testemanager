import { FolderKanban } from 'lucide-react';

export default function ProjectSelector({ projets, selectedProjet, onChange }) {
  return (
    <div className="card p-4">
      <label className="form-label">Projet</label>
      <select
        value={selectedProjet}
        onChange={(e) => onChange(e.target.value)}
        className="form-input md:max-w-md"
      >
        {projets.length === 0 && <option value="">Aucun projet assigné</option>}
        {projets.map((p) => (
          <option key={p.id} value={p.id}>{p.nom}</option>
        ))}
      </select>
    </div>
  );
}
