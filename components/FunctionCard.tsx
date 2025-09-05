import React from 'react';

interface FunctionCardProps {
  icon: React.ReactNode;
  name: string;
  isActive: boolean;
  onClick: () => void;
  isCompact?: boolean;
}

const FunctionCard: React.FC<FunctionCardProps> = ({ icon, name, isActive, onClick, isCompact = false }) => {
  const baseClasses = "rounded-lg text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 w-full";
  const sizeClasses = isCompact ? "p-2 aspect-square" : "p-4 aspect-square gap-2";
  
  // Conditional classes for active/inactive state
  const stateClasses = isActive 
    ? 'bg-orange-600 text-white shadow-lg' // Active: Solid orange BG, white text/icon
    : 'bg-gradient-to-br from-white/60 to-orange-50/50 hover:from-white/80 hover:to-orange-100/70 backdrop-blur-sm ring-1 ring-orange-300 text-slate-700'; // Inactive: Gradient BG, dark text

  // Conditional icon color to override parent text color when inactive
  const iconColorClass = isActive ? '' : 'text-orange-600';
  
  const iconSize = isCompact ? "text-2xl" : "text-3xl";
  const textSize = isCompact ? "text-sm font-bold" : "text-base font-bold";

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
      onClick={onClick}
    >
      <div className={`${iconSize} ${iconColorClass}`}>{icon}</div>
      <div className={`${textSize}`}>{name}</div>
    </button>
  );
};

export default FunctionCard;