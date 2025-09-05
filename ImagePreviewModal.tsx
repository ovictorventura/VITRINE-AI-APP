import React, { useEffect } from 'react';

interface ImagePreviewModalProps {
  imageUrl: string;
  prompt: string;
  isFavorite: boolean;
  onClose: () => void;
  onEdit: (imageUrl: string) => void;
  onDownload: (imageUrl:string) => void;
  onToggleFavorite: (imageUrl: string, prompt: string) => void;
}

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={`transition-all duration-200 ${filled ? 'fill-orange-600 stroke-orange-600' : 'fill-none stroke-orange-600'}`}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);


const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, prompt, isFavorite, onClose, onEdit, onDownload, onToggleFavorite }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden shrink min-h-0">
            <img 
              src={imageUrl} 
              alt="Prévia em alta resolução" 
              className="w-auto h-auto max-w-full max-h-[calc(90vh-80px)] object-contain"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors duration-200"
              aria-label="Fechar prévia"
            >
              <CloseIcon />
            </button>
        </div>

        <div className="flex-shrink-0 flex justify-center items-center gap-4">
            <button 
                onClick={() => onToggleFavorite(imageUrl, prompt)}
                className="bg-slate-100 font-bold p-3 rounded-full text-sm hover:bg-white transition-colors shadow-lg"
                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
                <StarIcon filled={isFavorite} />
            </button>
             <button 
                onClick={() => onEdit(imageUrl)}
                className="bg-orange-600 text-white font-bold py-2 px-5 rounded-full text-sm hover:bg-orange-700 transition-colors shadow-lg"
            >
                Editar esta imagem
            </button>
            <button 
                onClick={() => onDownload(imageUrl)}
                className="bg-slate-100 text-slate-800 font-bold py-2 px-5 rounded-full text-sm hover:bg-white transition-colors shadow-lg"
            >
                Baixar
            </button>
        </div>

      </div>
    </div>
  );
};

export default ImagePreviewModal;