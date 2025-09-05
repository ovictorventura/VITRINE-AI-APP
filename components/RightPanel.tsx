import React, { useMemo } from 'react';
import { HistoryItem, UIMode, FavoriteItem } from '../types';

interface RightPanelProps {
  uiMode: UIMode;
  isLoading: boolean;
  generatedImages: string[];
  error: string | null;
  onSelectImageForEdit: (imageSrc: string) => void;
  onPreviewImage: (imageSrc: string, prompt: string) => void;
  onDownloadImage: (imageSrc: string) => void;
  onToggleFavorite: (imageSrc: string, prompt: string) => void;
  history: HistoryItem[];
  selectedHistoryId: string | null;
  favorites: FavoriteItem[];
  selectedFavoriteId: string | null;
  currentPrompt: string;
}

const PlaceholderIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={`transition-all duration-200 ${filled ? 'fill-orange-600 stroke-orange-600' : 'fill-none stroke-orange-600'}`}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);


const RightPanel: React.FC<RightPanelProps> = (props) => {
  const { 
    uiMode, isLoading, generatedImages, error, onSelectImageForEdit, onPreviewImage,
    onDownloadImage, onToggleFavorite, history, selectedHistoryId, favorites, 
    selectedFavoriteId, currentPrompt
  } = props;

  const selectedHistoryItem = useMemo(() => {
    if (uiMode !== UIMode.History || !selectedHistoryId) return null;
    return history.find(item => item.id === selectedHistoryId);
  }, [uiMode, selectedHistoryId, history]);
  
  const selectedFavoriteItem = useMemo(() => {
    if (uiMode !== UIMode.Favorites || !selectedFavoriteId) return null;
    return favorites.find(item => item.id === selectedFavoriteId);
  }, [uiMode, selectedFavoriteId, favorites]);

  const imagesToShow = useMemo(() => {
    if (uiMode === UIMode.History) return selectedHistoryItem?.generatedImages ?? [];
    if (uiMode === UIMode.Favorites) return selectedFavoriteItem ? [selectedFavoriteItem.imageUrl] : [];
    return generatedImages;
  }, [uiMode, generatedImages, selectedHistoryItem, selectedFavoriteItem]);

  const getPromptForImage = (imageSrc: string): string => {
    if (uiMode === UIMode.Favorites) return selectedFavoriteItem?.prompt ?? '';
    return currentPrompt;
  }
  
  const hasContent = imagesToShow.length > 0 || isLoading || error || (uiMode === UIMode.History && selectedHistoryItem) || (uiMode === UIMode.Favorites && selectedFavoriteItem);

  const WelcomeMessage = () => (
    <div className="text-center text-slate-500">
      <div className="mb-4 flex justify-center"><PlaceholderIcon /></div>
      <h2 className="text-xl font-semibold text-slate-700">Suas imagens aparecerão aqui</h2>
      <p className="text-slate-600">Preencha os campos à esquerda e clique em "Gerar Imagem".</p>
    </div>
  );

  const Placeholder = ({ title, message, icon }: {title: string, message: string, icon: React.ReactNode}) => (
     <div className="text-center text-slate-500">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
      <p className="text-slate-600">{message}</p>
    </div>
  )

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-orange-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-slate-600">Gerando imagens... Isso pode levar alguns segundos.</p>
        </div>
      );
    }

    if (error) {
       return (
         <div className="text-center text-red-800 bg-red-200/80 border border-red-300 p-4 rounded-lg">
           <h3 className="font-bold text-lg mb-2">Ocorreu um erro</h3>
           <p className="text-sm">{error}</p>
         </div>
      );
    }
    
    if (imagesToShow.length > 0) {
      const gridCols = imagesToShow.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1';
      return (
        <div className={`w-full h-full grid grid-cols-1 ${gridCols} gap-4 overflow-y-auto`}>
            {imagesToShow.map((imageSrc, index) => {
              const promptForImage = getPromptForImage(imageSrc);
              const isFavorited = favorites.some(fav => fav.imageUrl === imageSrc);
              return (
                <div 
                  key={index} 
                  className="relative group aspect-square bg-black/5 rounded-lg overflow-hidden shadow-lg cursor-pointer"
                  onClick={() => onPreviewImage(imageSrc, promptForImage)}
                >
                  <img src={imageSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-contain" />
                  
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                      <div className="flex items-center justify-center flex-wrap gap-3">
                          <button 
                              onClick={(e) => { e.stopPropagation(); onSelectImageForEdit(imageSrc); }} 
                              className="bg-orange-600 text-white font-bold py-2 px-5 rounded-full text-sm hover:bg-orange-700 transition-colors"
                          >
                              Editar esta imagem
                          </button>
                          <button 
                              onClick={(e) => { e.stopPropagation(); onDownloadImage(imageSrc); }} 
                              className="bg-slate-100 text-slate-800 font-bold py-2 px-5 rounded-full text-sm hover:bg-white transition-colors"
                          >
                              Baixar
                          </button>
                           <button
                              onClick={(e) => { e.stopPropagation(); onToggleFavorite(imageSrc, promptForImage); }}
                              className="bg-slate-100 text-slate-800 p-2.5 rounded-full hover:bg-white transition-colors flex items-center justify-center"
                              title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          >
                              <StarIcon filled={isFavorited} />
                          </button>
                      </div>
                  </div>
                </div>
              )
            })}
        </div>
      );
    }

    if (!hasContent) {
        if (uiMode === UIMode.History) return <Placeholder title="Selecione um item" message="Escolha uma criação do seu histórico para visualizar." icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>} />;
        if (uiMode === UIMode.Favorites) return <Placeholder title="Selecione um favorito" message="Escolha uma imagem favorita no painel esquerdo para visualizar." icon={<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M12 20.947 4.5 15.5V8.5L12 3l7.5 5.5v7L12 20.947z"/><path d="M12 3v18"/></svg>} />;
        return <WelcomeMessage />;
    }

    return null;
  }

  return (
    <div className="flex-1 bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl flex items-center justify-center p-6 noise-bg">
      {renderContent()}
    </div>
  );
};

export default RightPanel;