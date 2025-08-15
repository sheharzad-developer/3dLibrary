import { useCallback, useRef } from 'react';
import axios from '../../../shared/api/client';
import { preloadModel } from '../../viewer/utils/modelUtils';

interface ModelPreloadCache {
  [bookId: string]: {
    url?: string;
    loading: boolean;
    error?: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const preloadCache: ModelPreloadCache = {};

export function useModelPreloader() {
  const preloadTimeouts = useRef<{ [bookId: string]: number }>({});

  const preloadModelForBook = useCallback(async (bookId: string) => {
    // Check if already cached and not expired
    const cached = preloadCache[bookId];
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      if (cached.url && !cached.loading && !cached.error) {
        // Already have a valid URL, preload it
        try {
          preloadModel(cached.url);
        } catch (error) {
          console.warn('Failed to preload cached model:', error);
        }
      }
      return;
    }

    // Mark as loading
    preloadCache[bookId] = {
      loading: true,
      timestamp: Date.now()
    };

    try {
      // Fetch the model URL
      const { data } = await axios.get(`/api/books/${bookId}/assets/model`);
      
      if (data?.gltf_url) {
        // Update cache with URL
        preloadCache[bookId] = {
          url: data.gltf_url,
          loading: false,
          timestamp: Date.now()
        };

        // Preload the model
        preloadModel(data.gltf_url);
      } else {
        preloadCache[bookId] = {
          loading: false,
          error: 'No model URL received',
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.warn(`Failed to preload model for book ${bookId}:`, error);
      preloadCache[bookId] = {
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }, []);

  const schedulePreload = useCallback((bookId: string, delay: number = 500) => {
    // Clear any existing timeout for this book
    if (preloadTimeouts.current[bookId]) {
      clearTimeout(preloadTimeouts.current[bookId]);
    }

    // Schedule preload after delay
    preloadTimeouts.current[bookId] = setTimeout(() => {
      preloadModelForBook(bookId);
      delete preloadTimeouts.current[bookId];
    }, delay);
  }, [preloadModelForBook]);

  const cancelPreload = useCallback((bookId: string) => {
    if (preloadTimeouts.current[bookId]) {
      clearTimeout(preloadTimeouts.current[bookId]);
      delete preloadTimeouts.current[bookId];
    }
  }, []);

  const getPreloadStatus = useCallback((bookId: string) => {
    const cached = preloadCache[bookId];
    if (!cached) return 'not-started';
    if (cached.loading) return 'loading';
    if (cached.error) return 'error';
    if (cached.url) return 'ready';
    return 'not-started';
  }, []);

  return {
    schedulePreload,
    cancelPreload,
    getPreloadStatus,
    preloadModelForBook
  };
}