import { AppMode } from './types';

export const MODES = [
  { 
    id: AppMode.ProductScene, 
    icon: '➕', 
    name: 'Criação Livre',
    description: 'Envie 1 imagem do produto e descreva o cenário.',
  },
  { 
    id: AppMode.ProductReference, 
    icon: '✖️', 
    name: 'Referência',
    description: 'Envie o produto e uma imagem de referência de estilo.',
  },
  { 
    id: AppMode.SceneComposition, 
    icon: '♾️', 
    name: 'Composição',
    description: 'Una produto, personagem e ambiente.',
  },
];