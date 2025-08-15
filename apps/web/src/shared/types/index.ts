// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User and Auth types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  date_joined: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Book and Catalog types
export interface Author {
  id: number;
  name: string;
  bio?: string;
  birth_date?: string;
  death_date?: string;
}

export interface Genre {
  id: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  publication_date: string;
  description?: string;
  page_count?: number;
  language: string;
  authors: Author[];
  genres: Genre[];
  
  // Asset availability flags
  has_cover: boolean;
  has_model: boolean;
  has_pages: boolean;
  
  // Computed asset URLs (from serializer)
  cover_url?: string;
  model_url?: string;
  pages_url?: string;
  
  // API endpoints for asset access
  cover_api_url?: string;
  model_api_url?: string;
  pages_api_url?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// Asset management types
export interface AssetUploadResponse {
  upload_data: {
    url: string;
    fields: Record<string, string>;
  };
  key: string;
  asset_type: 'cover' | 'model' | 'page';
  content_type: string;
  max_size_mb: number;
  compression_recommended: boolean;
  expires_in: number;
  page_number?: number;
  preferred_format?: string;
}

export interface SignedUrlResponse {
  signed_url: string;
  expires_at: string;
  content_type: string;
}

export interface AssetConfirmation {
  asset_type: 'cover' | 'model' | 'page';
  object_key: string;
  page_number?: number;
}

// Search and Filter types
export interface BookFilters {
  search?: string;
  genres__id?: number[];
  authors__id?: number[];
  language?: string;
  has_cover?: boolean;
  has_model?: boolean;
  has_pages?: boolean;
  publication_date_after?: string;
  publication_date_before?: string;
}

export interface BookSearchParams extends BookFilters {
  page?: number;
  page_size?: number;
  ordering?: string;
}

// Circulation types
export interface Borrow {
  id: number;
  book: Book;
  user: User;
  borrowed_date: string;
  due_date: string;
  returned_date?: string;
  is_overdue: boolean;
  fine_amount?: number;
}

// 3D Viewer types
export interface ViewerSettings {
  autoRotate: boolean;
  showWireframe: boolean;
  backgroundColor: string;
  lightIntensity: number;
  cameraPosition: [number, number, number];
}

export interface ModelLoadingState {
  isLoading: boolean;
  progress: number;
  error?: string;
}

// UI Component types
export interface ButtonVariants {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

export interface FormErrors {
  [key: string]: string | string[];
}