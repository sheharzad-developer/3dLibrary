import { useReducer } from 'react';
import type { ReactNode } from 'react';
import type { CatalogState, CatalogActions, CatalogContextType, CatalogFilters, PaginationState } from './types';
import { CatalogContext } from './context';

type CatalogAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<CatalogFilters> }
  | { type: 'SET_PAGINATION'; payload: Partial<PaginationState> }
  | { type: 'SET_SORTING'; payload: { sortBy: CatalogState['sortBy']; sortOrder: CatalogState['sortOrder'] } }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CatalogState = {
  searchQuery: '',
  filters: {
    category: '',
    author: '',
    availability: 'all',
  },
  pagination: {
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  },
  sortBy: 'title',
  sortOrder: 'asc',
  isLoading: false,
  error: null,
};

function catalogReducer(state: CatalogState, action: CatalogAction): CatalogState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        pagination: { ...state.pagination, page: 1 }, // Reset to first page on search
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }, // Reset to first page on filter change
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case 'SET_SORTING':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
        pagination: { ...state.pagination, page: 1 }, // Reset to first page on sort change
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        searchQuery: '',
        filters: initialState.filters,
        pagination: { ...state.pagination, page: 1 },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    default:
      return state;
  }
}



export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  const actions: CatalogActions = {
    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },
    setFilters: (filters: Partial<CatalogFilters>) => {
      dispatch({ type: 'SET_FILTERS', payload: filters });
    },
    setPagination: (pagination: Partial<PaginationState>) => {
      dispatch({ type: 'SET_PAGINATION', payload: pagination });
    },
    setSorting: (sortBy: CatalogState['sortBy'], sortOrder: CatalogState['sortOrder']) => {
      dispatch({ type: 'SET_SORTING', payload: { sortBy, sortOrder } });
    },
    resetFilters: () => {
      dispatch({ type: 'RESET_FILTERS' });
    },
    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },
    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },
  };

  const contextValue: CatalogContextType = {
    ...state,
    ...actions,
  };

  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
}