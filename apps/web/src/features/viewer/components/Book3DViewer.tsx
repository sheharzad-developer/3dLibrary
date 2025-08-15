import React, { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { 
  Bounds, 
  Center, 
  Environment, 
  Html, 
  OrbitControls, 
  useGLTF,
  PresentationControls,
  Float,
  Sparkles
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, ZoomIn, ZoomOut, RotateCw, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

type Book3DViewerProps = {
  gltfUrl: string;        // final URL (public or signed) to a .glb
  className?: string;     // optional container styles
  onError?: (error: Error) => void;
};

type BookModelProps = {
  url: string;
  scale?: number;
};

function BookModel({ url, scale = 1 }: BookModelProps) {
  // Important: pass the final URL; useGLTF caches by URL
  const { scene } = useGLTF(url, true);
  const meshRef = useRef<THREE.Object3D>(null);
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Add subtle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });
  
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <Center disableZ>
        <primitive 
          ref={meshRef}
          object={clonedScene} 
          scale={scale}
        />
        <Sparkles 
          count={20} 
          scale={2} 
          size={2} 
          speed={0.3} 
          opacity={0.1}
          color="#8b5cf6"
        />
      </Center>
    </Float>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-4 bg-white/90 rounded-lg shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </Html>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-red-50 rounded-lg">
      <div className="text-red-600 mb-4">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load 3D model</h3>
      <p className="text-sm text-red-600 mb-4 text-center max-w-md">
        {error.message || "An error occurred while loading the 3D model. Please try again."}
      </p>
      <Button onClick={resetErrorBoundary} variant="outline" size="sm">
        <RotateCcw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}

// Simple error boundary component
interface ViewerErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
  resetKeys?: unknown[];
}

interface ViewerErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ViewerErrorBoundary extends React.Component<ViewerErrorBoundaryProps, ViewerErrorBoundaryState> {
  constructor(props: ViewerErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ViewerErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps: ViewerErrorBoundaryProps) {
    const { resetKeys } = this.props;
    if (prevProps.resetKeys !== resetKeys && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback 
          error={this.state.error} 
          resetErrorBoundary={() => this.setState({ hasError: false, error: undefined })} 
        />
      );
    }

    return this.props.children;
  }
}

function CanvasContent({ gltfUrl }: { gltfUrl: string }) {
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <>
      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#8b5cf6" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#ec4899" />

      <Suspense fallback={<LoadingFallback />}>
        <Environment preset="sunset" />
        {/* Bounds frames the camera around whatever we render inside */}
        <Bounds fit clip observe margin={1.2}>
          <BookModel url={gltfUrl} />
        </Bounds>
      </Suspense>

      <PresentationControls
        global
        rotation={[0, -Math.PI / 4, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI * 0.6}
          minDistance={2}
          maxDistance={10}
          enableDamping
          dampingFactor={0.05}
          autoRotate={isAutoRotating}
          autoRotateSpeed={1}
        />
      </PresentationControls>

      {/* Controls UI */}
      <Html position={[2, 2, 0]}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-2 p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className="text-white hover:bg-white/20"
          >
            {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setZoomLevel(zoomLevel === 1 ? 1.5 : 1)}
            className="text-white hover:bg-white/20"
          >
            {zoomLevel === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.location.reload()}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </motion.div>
      </Html>
    </>
  );
}

export default function Book3DViewer({ gltfUrl, className, onError }: Book3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Key the Canvas by URL so a fresh signed URL remounts content when it changes
  const canvasKey = useMemo(() => gltfUrl, [gltfUrl]);
  
  // Ensure container is visible and has proper dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Force a reflow to ensure Canvas gets proper dimensions
    const observer = new ResizeObserver(() => {
      // Trigger a resize event to help Canvas recalculate dimensions
      window.dispatchEvent(new Event('resize'));
    });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  const handleError = (error: Error) => {
    console.error('3D Viewer Error:', error);
    onError?.(error);
  };

  return (
    <ViewerErrorBoundary
      onError={handleError}
      resetKeys={[gltfUrl]} // Reset error boundary when URL changes
    >
      <div 
        ref={containerRef}
        className={className ?? "w-full min-h-[70vh] bg-black/5 rounded-xl overflow-hidden"}
        style={{ minHeight: '500px' }} // Ensure non-zero height
      >
        <Canvas 
          key={canvasKey}
          camera={{ position: [0, 1.2, 3], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]} // Responsive pixel ratio
        >
          <CanvasContent gltfUrl={gltfUrl} />
        </Canvas>
      </div>
    </ViewerErrorBoundary>
  );
}