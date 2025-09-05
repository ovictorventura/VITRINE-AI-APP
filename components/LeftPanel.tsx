import React from 'react';
import { AppMode, ImageFile, InputType, UIMode, HistoryItem, FavoriteItem } from '../types';
import { MODES } from '../constants';
import FunctionCard from './FunctionCard';
import ImageUpload from './ImageUpload';
import ImageEditor from './ImageEditor';
import HistoryCard from './HistoryCard';
import FavoriteCard from './FavoriteCard';

interface LeftPanelProps {
  uiMode: UIMode;
  onUiModeChange: (mode: UIMode) => void;
  appMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  
  productImage: ImageFile | null;
  setProductImage: (file: ImageFile | null) => void;
  referenceImage: ImageFile | null;
  setReferenceImage: (file: ImageFile | null) => void;
  characterImage: ImageFile | null;
  setCharacterImage: (file: ImageFile | null) => void;
  environmentImage: ImageFile | null;
  setEnvironmentImage: (file: ImageFile | null) => void;
  
  characterInputType: InputType;
  setCharacterInputType: (type: InputType) => void;
  environmentInputType: InputType;
  setEnvironmentInputType: (type: InputType) => void;
  characterPrompt: string;
  setCharacterPrompt: (prompt: string) => void;
  environmentPrompt: string;
  setEnvironmentPrompt: (prompt: string) => void;
  
  imageToEdit: ImageFile | null;
  setMaskImage: (file: ImageFile | null) => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;

  onGenerate: () => void;
  isLoading: boolean;
  isGenerateDisabled: boolean;

  history: HistoryItem[];
  selectedHistoryId: string | null;
  onSelectHistoryItem: (id: string) => void;
  onDeleteHistoryItem: (id: string) => void;

  favorites: FavoriteItem[];
  selectedFavoriteId: string | null;
  onSelectFavoriteItem: (id: string) => void;
  onDeleteFavoriteItem: (id: string) => void;
}

const InputTypeToggle: React.FC<{ selected: InputType, onSelect: (type: InputType) => void }> = ({ selected, onSelect }) => (
  <div className="flex bg-slate-200/80 p-1 rounded-full w-full">
    <button onClick={() => onSelect('text')} className={`flex-1 py-1 text-sm rounded-full transition-colors duration-200 ${selected === 'text' ? 'bg-orange-600 text-white font-semibold shadow' : 'hover:bg-white/50 text-slate-700'}`}>
      Texto
    </button>
    <button onClick={() => onSelect('image')} className={`flex-1 py-1 text-sm rounded-full transition-colors duration-200 ${selected === 'image' ? 'bg-orange-600 text-white font-semibold shadow' : 'hover:bg-white/50 text-slate-700'}`}>
      Imagem
    </button>
  </div>
);

const UiModeToggle: React.FC<{ selected: UIMode, onSelect: (mode: UIMode) => void }> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-200/80 p-1 rounded-full w-full gap-1">
    <button onClick={() => onSelect(UIMode.Create)} className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${selected === UIMode.Create ? 'bg-orange-600 text-white shadow' : 'hover:bg-white/50 text-slate-700'}`}>
      Criar
    </button>
    <button onClick={() => onSelect(UIMode.Edit)} className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${selected === UIMode.Edit ? 'bg-orange-600 text-white shadow' : 'hover:bg-white/50 text-slate-700'}`}>
      Editar
    </button>
    <button onClick={() => onSelect(UIMode.History)} className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${selected === UIMode.History ? 'bg-orange-600 text-white shadow' : 'hover:bg-white/50 text-slate-700'}`}>
      Histórico
    </button>
     <button onClick={() => onSelect(UIMode.Favorites)} className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${selected === UIMode.Favorites ? 'bg-orange-600 text-white shadow' : 'hover:bg-white/50 text-slate-700'}`}>
      Favoritos
    </button>
  </div>
);

const LeftPanel: React.FC<LeftPanelProps> = (props) => {
  const { 
    uiMode, onUiModeChange,
    appMode, onModeChange, prompt, setPrompt, onGenerate, isLoading, isGenerateDisabled,
    aspectRatio, setAspectRatio,
    productImage, setProductImage, referenceImage, setReferenceImage,
    characterImage, setCharacterImage, environmentImage, setEnvironmentImage,
    characterInputType, setCharacterInputType, environmentInputType, setEnvironmentInputType,
    characterPrompt, setCharacterPrompt, environmentPrompt, setEnvironmentPrompt,
    imageToEdit, setMaskImage, editPrompt, setEditPrompt,
    history, selectedHistoryId, onSelectHistoryItem, onDeleteHistoryItem,
    favorites, selectedFavoriteId, onSelectFavoriteItem, onDeleteFavoriteItem,
  } = props;

  const handleImageUpload = (file: File, setter: (file: ImageFile | null) => void) => {
    setter({ file, preview: URL.createObjectURL(file) });
  };

  const handleMaskUpload = (file: File) => {
    setMaskImage({ file, preview: URL.createObjectURL(file) });
  };
  
  return (
    <div className="w-full md:w-[420px] lg:w-[480px] flex-shrink-0 bg-white/40 backdrop-blur-lg border border-white/30 rounded-2xl p-6 flex flex-col gap-5 overflow-y-auto noise-bg">
      <UiModeToggle selected={uiMode} onSelect={onUiModeChange} />
      
      {uiMode === UIMode.Create && (
        <>
          <header>
            <h1 className="text-2xl font-bold text-slate-900 text-center">Selecione o modo de criação</h1>
          </header>

          <div className="grid grid-cols-3 gap-2">
            {MODES.map(mode => (
              <FunctionCard
                key={mode.id}
                icon={mode.icon}
                name={mode.name}
                isActive={appMode === mode.id}
                onClick={() => onModeChange(mode.id)}
                isCompact={true}
              />
            ))}
          </div>

          <p className="text-center text-sm text-slate-700 bg-white/20 rounded-lg py-2 px-3">
            {MODES.find(m => m.id === appMode)?.description}
          </p>
          
          <section>
            <label htmlFor="prompt" className="block text-lg font-semibold text-slate-800 mb-2">Descreva sua ideia</label>
            <textarea
              id="prompt"
              className="w-full h-24 bg-white/50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 resize-none"
              placeholder="Descreva o cenário, o estilo e os detalhes da imagem final..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </section>

          <div className="flex flex-col gap-4">
            <div className="w-4/5 mx-auto">
              <ImageUpload
                  id="productImage"
                  title="Imagem do Produto"
                  onImageSelect={(file) => handleImageUpload(file, setProductImage)}
                  imagePreview={productImage?.preview}
              />
            </div>

            {appMode === AppMode.ProductReference && (
              <div className="w-4/5 mx-auto">
                  <ImageUpload
                      id="referenceImage"
                      title="Imagem de Referência"
                      onImageSelect={(file) => handleImageUpload(file, setReferenceImage)}
                      imagePreview={referenceImage?.preview}
                  />
              </div>
            )}

            {appMode === AppMode.SceneComposition && (
              <>
                <div className="bg-black/5 p-3 rounded-lg flex flex-col gap-2">
                  <label className="font-semibold text-slate-700">Personagem</label>
                  <InputTypeToggle selected={characterInputType} onSelect={setCharacterInputType} />
                  {characterInputType === 'image' ? (
                    <ImageUpload
                        id="characterImage"
                        title="Imagem do Personagem"
                        onImageSelect={(file) => handleImageUpload(file, setCharacterImage)}
                        imagePreview={characterImage?.preview}
                        isCompact={true}
                    />
                  ) : (
                    <input type="text" placeholder="Ex: mulher sorrindo, 30 anos" value={characterPrompt} onChange={(e) => setCharacterPrompt(e.target.value)} className="w-full bg-white/50 border border-slate-300 rounded-lg p-2 text-sm text-slate-800 placeholder-slate-500 focus:ring-1 focus:ring-orange-500" />
                  )}
                </div>

                <div className="bg-black/5 p-3 rounded-lg flex flex-col gap-2">
                  <label className="font-semibold text-slate-700">Ambiente</label>
                  <InputTypeToggle selected={environmentInputType} onSelect={setEnvironmentInputType} />
                  {environmentInputType === 'image' ? (
                    <ImageUpload
                        id="environmentImage"
                        title="Imagem do Ambiente"
                        onImageSelect={(file) => handleImageUpload(file, setEnvironmentImage)}
                        imagePreview={environmentImage?.preview}
                        isCompact={true}
                    />
                  ) : (
                    <input type="text" placeholder="Ex: em uma praia, ao pôr do sol" value={environmentPrompt} onChange={(e) => setEnvironmentPrompt(e.target.value)} className="w-full bg-white/50 border border-slate-300 rounded-lg p-2 text-sm text-slate-800 placeholder-slate-500 focus:ring-1 focus:ring-orange-500" />
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )} 
      
      {uiMode === UIMode.Edit && (
        <>
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Editar Imagem</h1>
                <p className="text-slate-600 mt-1">Desenhe uma máscara na área que deseja alterar e descreva a modificação.</p>
            </header>

            {imageToEdit ? (
                <div className="flex flex-col gap-4">
                    <div className="w-4/5 mx-auto">
                      <ImageEditor imageUrl={imageToEdit.preview} onMaskChange={handleMaskUpload} />
                    </div>
                    <section>
                        <label htmlFor="edit-prompt" className="block text-lg font-semibold text-slate-800 mb-2">Descreva a edição</label>
                        <textarea
                        id="edit-prompt"
                        className="w-full h-24 bg-white/50 border border-slate-300 rounded-lg p-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 resize-none"
                        placeholder="Ex: adicione um colar de ouro, mude a cor do fundo para azul..."
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        />
                    </section>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-100/50 rounded-lg p-4">
                    <p className="font-semibold text-slate-700">Selecione uma imagem para editar</p>
                    <p className="text-sm text-slate-600">Gere uma imagem no modo "Criar" e depois clique em "Editar esta imagem" no painel direito.</p>
                </div>
            )}
        </>
      )}

      {uiMode === UIMode.History && (
         <>
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Histórico</h1>
                <p className="text-slate-600 mt-1">Veja e gerencie suas criações anteriores.</p>
            </header>
            {history.length > 0 ? (
                 <div className="flex flex-col gap-3">
                    {history.map(item => (
                        <HistoryCard
                            key={item.id}
                            item={item}
                            isSelected={selectedHistoryId === item.id}
                            onSelect={() => onSelectHistoryItem(item.id)}
                            onDelete={() => onDeleteHistoryItem(item.id)}
                        />
                    ))}
                 </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-100/50 rounded-lg p-4">
                    <p className="font-semibold text-slate-700">Nenhuma criação ainda</p>
                    <p className="text-sm text-slate-600">Suas imagens geradas aparecerão aqui.</p>
                </div>
            )}
         </>
      )}

      {uiMode === UIMode.Favorites && (
         <>
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Favoritos</h1>
                <p className="text-slate-600 mt-1">Suas imagens favoritas em um só lugar.</p>
            </header>
            {favorites.length > 0 ? (
                 <div className="flex flex-col gap-3">
                    {favorites.map(item => (
                        <FavoriteCard
                            key={item.id}
                            item={item}
                            isSelected={selectedFavoriteId === item.id}
                            onSelect={() => onSelectFavoriteItem(item.id)}
                            onDelete={() => onDeleteFavoriteItem(item.id)}
                        />
                    ))}
                 </div>
            ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-100/50 rounded-lg p-4">
                    <p className="font-semibold text-slate-700">Nenhuma imagem favorita</p>
                    <p className="text-sm text-slate-600">Clique na estrela sobre uma imagem para adicioná-la aqui.</p>
                </div>
            )}
         </>
      )}

      {uiMode !== UIMode.History && uiMode !== UIMode.Favorites && (
        <>
          <section>
            <label htmlFor="aspectRatio" className="block text-md font-semibold text-slate-800 mb-2">Proporção</label>
            <div className="relative">
                <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-white/50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 appearance-none"
                >
                <option value="1:1">Quadrado (1:1)</option>
                <option value="16:9">Youtube (16:9)</option>
                <option value="9:16">Story (9:16)</option>
                <option value="4:3">Paisagem (4:3)</option>
                <option value="3:4">Retrato (3:4)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </section>
          <div className="pt-4">
            <button 
              id="generateBtn"
              className="w-full h-14 bg-[#fc6200] text-white font-bold text-lg rounded-full flex items-center justify-center gap-3 transition-all duration-200 hover:bg-[#e25800] disabled:bg-slate-400 disabled:cursor-not-allowed shadow-lg hover:shadow-[#fc6200]/50"
              onClick={onGenerate}
              disabled={isGenerateDisabled}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando...
                </>
              ) : (
                 uiMode === UIMode.Edit ? 'Editar Imagem' : 'Gerar Imagem'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LeftPanel;