export enum AppMode {
  ProductScene = 'product-scene',
  ProductReference = 'product-reference',
  SceneComposition = 'scene-composition',
}

export enum UIMode {
  Create = 'create',
  Edit = 'edit',
  History = 'history',
  Favorites = 'favorites',
}

export type InputType = 'image' | 'text';

export interface ImageFile {
  file: File;
  preview: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  appMode: AppMode;
  aspectRatio: string;
  generatedImages: string[];
  productImagePreview?: string;
}

export interface FavoriteItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}
