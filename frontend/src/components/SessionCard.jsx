import { ClipboardList, Edit2, Trash2, Calendar } from 'lucide-react';

export default function SessionCard({ session, onEdit, onDelete }) {
  return (
    <div className="card p-5 hover:shadow-card-hover transition">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(session)} className="btn-icon" title="Modifier">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{session.nom}</h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
        {session.description || 'Aucune description'}
      </p>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-3 border-t border-gray-100">
        <Calendar className="w-3.5 h-3.5" />
        {session.dateCreation || session.dateDebut || 'Date inconnue'}
      </div>
    </div>
  );
}
