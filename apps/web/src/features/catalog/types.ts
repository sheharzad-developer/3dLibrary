export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  coverUrl?: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  isAvailable: boolean;
}

export interface CatalogFilters {
  category: string;
  author: string;
  availability: 'all' | 'available' | 'unavailable';
  publishedYear?: {
    min?: number;
    max?: number;
  };
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CatalogState {
  searchQuery: string;
  filters: CatalogFilters;
  pagination: PaginationState;
  sortBy: 'title' | 'author' | 'publishedYear' | 'category';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
}

export interface CatalogActions {
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CatalogFilters>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setSorting: (sortBy: CatalogState['sortBy'], sortOrder: CatalogState['sortOrder']) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type CatalogContextType = CatalogState & CatalogActions;