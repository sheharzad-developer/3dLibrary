import { useEffect, useState, useCallback } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, RotateCcw, Maximize } from "lucide-react";
import Book3DViewer from "./Book3DViewer";
import axios from "../../../shared/api/client";

type LocationState = { 
  gltfUrl?: string; // optional direct URL passed from catalog (public case)
  bookTitle?: string;
};

type ViewerState = 'loading' | 'ready' | 'error' | 'retrying';

interface BookViewerData {
  url: string;
  expires_in?: number;
  asset_type?: string;
}

export default function BookViewerPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [gltfUrl, setGltfUrl] = useState<string | null>(state.gltfUrl ?? null);
  const [viewerState, setViewerState] = useState<ViewerState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchSignedUrl = useCallback(async () => {
    if (!id) {
      setError("No book ID provided");
      setViewerState('error');
      return;
    }

    try {
      setViewerState('loading');
      setError(null);
      
      // Backend should return a short-lived, final URL (e.g., R2/Supabase signed).
      // Example response: { url: "https://...signed..." }
      const { data } = await axios.get<BookViewerData>(`/books/${id}/assets/model`);
      
      if (!data?.url) {
        throw new Error("No 3D model URL received from server");
      }
      
      setGltfUrl(data.url);
      setViewerState('ready');
      setRetryCount(0);
    } catch (e: unknown) {
      console.error('Failed to fetch 3D model URL:', e);
      const error = e as Error & { response?: { data?: { error?: string } } };
      const errorMessage = error?.response?.data?.error || error?.message || "Failed to load 3D model";
      setError(errorMessage);
      setViewerState('error');
    }
  }, [id]);

  // Fetch signed URL on mount if not provided (or if you always gate access)
  useEffect(() => {
    let active = true;
    
    const loadModel = async () => {
      // If we already have a public URL from state, we can skip fetching
      if (gltfUrl && viewerState !== 'error') {
        setViewerState('ready');
        return;
      }

      await fetchSignedUrl();
    };

    if (active) {
      loadModel();
    }

    return () => {
      active = false;
    };
  }, [gltfUrl, viewerState, fetchSignedUrl]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setViewerState('retrying');
    setGltfUrl(null); // Clear existing URL to force refetch
    setTimeout(() => {
      fetchSignedUrl();
    }, 500); // Small delay for better UX
  }, [fetchSignedUrl]);

  const handleViewerError = useCallback((error: Error) => {
    console.error('3D Viewer Error:', error);
    setError(`3D Viewer Error: ${error.message}`);
    setViewerState('error');
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const renderContent = () => {
    switch (viewerState) {
      case 'loading':
      case 'retrying':
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-gray-50 rounded-lg">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {viewerState === 'retrying' ? 'Retrying...' : 'Loading 3D Model'}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              {viewerState === 'retrying' 
                ? `Attempt ${retryCount + 1} - Please wait while we reload the model...`
                : 'Preparing your 3D book viewer. This may take a moment...'}
            </p>
          </div>
        );

      case 'error':
        return (
          <Alert variant="destructive" className="mx-auto max-w-md">
            <AlertDescription className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Failed to load 3D model</h3>
                <p className="text-sm">{error}</p>
              </div>
              <Button onClick={handleRetry} variant="outline" size="sm" className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        );

      case 'ready':
        if (!gltfUrl) {
          return (
            <Alert variant="destructive">
              <AlertDescription>No 3D model URL available</AlertDescription>
            </Alert>
          );
        }
        return (
          <Book3DViewer 
            gltfUrl={gltfUrl} 
            onError={handleViewerError}
            className={isFullscreen ? "w-screen h-screen bg-black" : "w-full min-h-[70vh] bg-black/5 rounded-xl overflow-hidden"}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen bg-gray-50'}`}>
      {/* Header */}
      {!isFullscreen && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Link
                  to={`/books/${id}`}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">3D Book Viewer</h1>
                  {state.bookTitle && (
                    <p className="text-sm text-gray-600">{state.bookTitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {viewerState === 'ready' && (
                  <>
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reload
                    </Button>
                    <Button onClick={toggleFullscreen} variant="outline" size="sm">
                      <Maximize className="w-4 h-4 mr-2" />
                      Fullscreen
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Viewer Content */}
      <div className={`${isFullscreen ? 'h-full' : 'p-4'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'max-w-7xl mx-auto'}`}>
          {renderContent()}
        </div>
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <Button
          onClick={toggleFullscreen}
          variant="secondary"
          size="sm"
          className="fixed top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
}