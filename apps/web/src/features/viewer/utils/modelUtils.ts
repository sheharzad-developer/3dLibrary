import { useGLTF } from '@react-three/drei';

// Type for the internal cache structure
interface GLTFCache {
  has?: (key: string) => boolean;
  clear?: () => void;
}

// Preload a model for better performance
export function preloadModel(url: string): void {
  useGLTF.preload(url);
}

// Clear cache helper - useful for development or memory management
export function clearModelCache(url?: string): void {
  if (url) {
    useGLTF.clear(url);
  } else {
    // Clear all cached models by accessing the internal cache
    const gltfWithCache = useGLTF as typeof useGLTF & { cache?: GLTFCache };
    const cache = gltfWithCache.cache;
    if (cache && cache.clear) {
      cache.clear();
    }
  }
}

// Check if a model is already cached
export function isModelCached(url: string): boolean {
  // Check if model is already in useGLTF cache
  const gltfWithCache = useGLTF as typeof useGLTF & { cache?: GLTFCache };
  const cache = gltfWithCache.cache;
  return Boolean(cache && cache.has && cache.has(url));
}

// Preload multiple models
export function preloadModels(urls: string[]) {
  urls.forEach(url => preloadModel(url));
}