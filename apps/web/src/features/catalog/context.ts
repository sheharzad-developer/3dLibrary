import { createContext } from 'react';
import type { CatalogContextType } from './types';

export const CatalogContext = createContext<CatalogContextType | undefined>(undefined);