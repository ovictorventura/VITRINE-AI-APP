import React, { useRef } from 'react';

interface ImageUploadProps {
  id: string;
  title: string;
  onImageSelect: (file: File) => void;
  imagePreview?: string;
  isCompact?: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);


const ImageUpload: React.FC<ImageUploadProps> = ({ id, title, onImageSelect, imagePreview, isCompact = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };
  
  return (
    <div
      className={`relative w-full aspect-square bg-white/20 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:border-orange-500 hover:bg-white/40 transition-colors duration-200`}
      onClick={handleClick}
    >
      <input
        type="file"
        id={id}
        ref={inputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
      ) : (
        <>
          <div className="text-2xl">
            <UploadIcon />
          </div>
          <p className="font-semibold text-slate-700 mt-1 text-sm">{title}</p>
          <p className="text-xs text-slate-500">Clique para selecionar</p>
        </>
      )}
    </div>
  );
};

export default ImageUpload;