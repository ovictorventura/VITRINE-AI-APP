import React, { useState, useMemo, useEffect } from 'react';
import { AppMode, ImageFile, InputType, UIMode, HistoryItem, FavoriteItem } from './types';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import { generateImage, editImage } from './services/geminiService';
import ImagePreviewModal from './components/ImagePreviewModal';

const App: React.FC = () => {
  // General UI Mode
  const [uiMode, setUiMode] = useState<UIMode>(UIMode.Create);

  // Create Mode State
  const [appMode, setAppMode] = useState<AppMode>(AppMode.ProductScene);
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  const [characterImage, setCharacterImage] = useState<ImageFile | null>(null);
  const [environmentImage, setEnvironmentImage] = useState<ImageFile | null>(null);
  const [characterInputType, setCharacterInputType] = useState<InputType>('text');
  const [environmentInputType, setEnvironmentInputType] = useState<InputType>('text');
  const [characterPrompt, setCharacterPrompt] = useState<string>('');
  const [environmentPrompt, setEnvironmentPrompt] = useState<string>('');

  // Edit Mode State
  const [imageToEdit, setImageToEdit] = useState<ImageFile | null>(null);
  const [maskImage, setMaskImage] = useState<ImageFile | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Favorites State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<string | null>(null);

  // Common State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Image Preview Modal State
  const [previewImage, setPreviewImage] = useState<{src: string, prompt: string} | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('vitrine-ai-history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      
      const storedFavorites = localStorage.getItem('vitrine-ai-favorites');
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vitrine-ai-history', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);
  
  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vitrine-ai-favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  }, [favorites]);

  const isGenerateDisabled = useMemo(() => {
    if (isLoading) return true;
    if (uiMode === UIMode.Edit) return !imageToEdit || !maskImage || !editPrompt.trim() || maskImage.file.size === 0;
    if (uiMode !== UIMode.Create) return true;
    if (!productImage || !prompt.trim()) return true;
    switch(appMode) {
      case AppMode.ProductReference: return !referenceImage;
      case AppMode.SceneComposition:
        const isCharacterMissing = characterInputType === 'image' ? !characterImage : !characterPrompt.trim();
        const isEnvironmentMissing = environmentInputType === 'image' ? !environmentImage : !environmentPrompt.trim();
        return isCharacterMissing || isEnvironmentMissing;
      default: return false;
    }
  }, [isLoading, uiMode, appMode, prompt, productImage, referenceImage, characterImage, environmentImage, characterInputType, characterPrompt, environmentInputType, environmentPrompt, imageToEdit, maskImage, editPrompt]);

  const currentPrompt = useMemo(() => {
    if (uiMode === UIMode.Create) return prompt;
    if (uiMode === UIMode.Edit) return editPrompt;
    if (uiMode === UIMode.History) {
        return history.find(item => item.id === selectedHistoryId)?.prompt || '';
    }
    return '';
  }, [uiMode, prompt, editPrompt, history, selectedHistoryId]);

  const handleGenerate = async () => {
    if (isGenerateDisabled) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    try {
        let result: string[];
        if (uiMode === UIMode.Create) {
            result = await generateImage({ appMode, prompt, aspectRatio, productImage, referenceImage, characterImage, characterPrompt, characterInputType, environmentImage, environmentPrompt, environmentInputType });
        } else {
             if (!imageToEdit || !maskImage || !editPrompt) throw new Error("Imagem base, máscara e prompt de edição são necessários.");
            result = await editImage({ baseImage: imageToEdit, maskImage: maskImage, prompt: editPrompt, aspectRatio: aspectRatio });
        }
        const newHistoryItem: HistoryItem = { id: Date.now().toString(), timestamp: Date.now(), generatedImages: result, prompt: uiMode === UIMode.Create ? prompt : editPrompt, appMode: appMode, aspectRatio: aspectRatio, productImagePreview: uiMode === UIMode.Create ? productImage?.preview : imageToEdit?.preview };
        setHistory(prev => [newHistoryItem, ...prev]);
        setGeneratedImages(result);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSelectImageForEdit = async (imageSrc: string) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], "image_to_edit.png", { type: blob.type });
      setImageToEdit({ file, preview: imageSrc });
      setGeneratedImages([]);
      setError(null);
      setUiMode(UIMode.Edit);
    } catch (e) {
      setError("Não foi possível carregar a imagem para edição.");
    }
  };

  const handleDownloadImage = (imageSrc: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `vitrine-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditFromModal = (imageSrc: string) => {
    handleSelectImageForEdit(imageSrc);
    handleClosePreview();
  };

  const handlePreviewImage = (src: string, prompt: string) => setPreviewImage({src, prompt});
  const handleClosePreview = () => setPreviewImage(null);

  const handleUiModeChange = (mode: UIMode) => {
    setUiMode(mode);
    setGeneratedImages([]);
    setError(null);
    if (mode !== UIMode.History) setSelectedHistoryId(null);
    if (mode !== UIMode.Favorites) setSelectedFavoriteId(null);
  };

  const handleSelectHistoryItem = (id: string) => setSelectedHistoryId(id);
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (selectedHistoryId === id) setSelectedHistoryId(null);
  };

  const handleToggleFavorite = (imageUrl: string, prompt: string) => {
    setFavorites(prev => {
        const existingIndex = prev.findIndex(fav => fav.imageUrl === imageUrl);
        if (existingIndex > -1) {
            return prev.filter((_, index) => index !== existingIndex);
        } else {
            const newItem: FavoriteItem = { id: `${Date.now()}-${Math.random()}`, imageUrl, prompt, timestamp: Date.now() };
            return [newItem, ...prev];
        }
    });
  };
  const handleSelectFavoriteItem = (id: string) => setSelectedFavoriteId(id);
  const handleDeleteFavoriteItem = (id: string) => {
      setFavorites(prev => prev.filter(item => item.id !== id));
      if (selectedFavoriteId === id) setSelectedFavoriteId(null);
  };

  return (
    <div className="text-slate-900 min-h-screen flex flex-col p-4 font-sans">
       <header className="w-full max-w-7xl mx-auto text-center py-4 px-6 flex-shrink-0 bg-[#fc6200] rounded-2xl">
        <h1 className="text-4xl font-bold text-white">Vitrine AI</h1>
        <p className="text-white/90 mt-1 text-base">Crie imagens profissionais e ultra-realistas para seus produtos.</p>
      </header>
      <main className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 flex-1 min-h-0 mt-6">
        <LeftPanel
          uiMode={uiMode}
          onUiModeChange={handleUiModeChange}
          appMode={appMode}
          onModeChange={setAppMode}
          prompt={prompt} setPrompt={setPrompt}
          aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
          productImage={productImage} setProductImage={setProductImage}
          referenceImage={referenceImage} setReferenceImage={setReferenceImage}
          characterImage={characterImage} setCharacterImage={setCharacterImage}
          environmentImage={environmentImage} setEnvironmentImage={setEnvironmentImage}
          characterInputType={characterInputType} setCharacterInputType={setCharacterInputType}
          environmentInputType={environmentInputType} setEnvironmentInputType={setEnvironmentInputType}
          characterPrompt={characterPrompt} setCharacterPrompt={setCharacterPrompt}
          environmentPrompt={environmentPrompt} setEnvironmentPrompt={setEnvironmentPrompt}
          imageToEdit={imageToEdit}
          setMaskImage={setMaskImage}
          editPrompt={editPrompt} setEditPrompt={setEditPrompt}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          isGenerateDisabled={isGenerateDisabled}
          history={history}
          selectedHistoryId={selectedHistoryId}
          onSelectHistoryItem={handleSelectHistoryItem}
          onDeleteHistoryItem={handleDeleteHistoryItem}
          favorites={favorites}
          selectedFavoriteId={selectedFavoriteId}
          onSelectFavoriteItem={handleSelectFavoriteItem}
          onDeleteFavoriteItem={handleDeleteFavoriteItem}
        />
        <RightPanel 
          uiMode={uiMode}
          isLoading={isLoading}
          generatedImages={generatedImages}
          error={error}
          onSelectImageForEdit={handleSelectImageForEdit}
          history={history}
          selectedHistoryId={selectedHistoryId}
          favorites={favorites}
          selectedFavoriteId={selectedFavoriteId}
          onPreviewImage={handlePreviewImage}
          onDownloadImage={handleDownloadImage}
          onToggleFavorite={handleToggleFavorite}
          currentPrompt={currentPrompt}
        />
      </main>
      {previewImage && (
        <ImagePreviewModal 
          imageUrl={previewImage.src} 
          prompt={previewImage.prompt}
          isFavorite={favorites.some(fav => fav.imageUrl === previewImage.src)}
          onClose={handleClosePreview}
          onEdit={handleEditFromModal}
          onDownload={handleDownloadImage}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
};

export default App;