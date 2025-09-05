import React from 'react';
import { FavoriteItem } from '../types';

interface FavoriteCardProps {
  item: FavoriteItem;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const FavoriteCard: React.FC<FavoriteCardProps> = ({ item, isSelected, onSelect, onDelete }) => {

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(item.timestamp);
  
  const baseClasses = 'w-full flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200';
  const stateClasses = isSelected 
    ? 'bg-orange-100/80 ring-2 ring-orange-500 shadow-md' 
    : 'bg-white/50 hover:bg-orange-50/80';

  return (
    <div className={`${baseClasses} ${stateClasses}`} onClick={onSelect}>
      <div className="flex-shrink-0 w-16 h-16 bg-slate-200 rounded-md overflow-hidden">
        <img src={item.imageUrl} alt="Favorito" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-slate-800 truncate" title={item.prompt}>
            {item.prompt || "Imagem favoritada"}
        </p>
        <p className="text-xs text-slate-600">{formattedDate}</p>
      </div>
      <button 
        onClick={handleDelete}
        className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-100/50"
        title="Remover dos favoritos"
        aria-label="Remover dos favoritos"
      >
        <TrashIcon />
      </button>
    </div>
  );
};

export default FavoriteCard;
