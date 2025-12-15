// src/hooks/useV7AudioPreloader.ts
// Lazy loading and preloading hook for V7 audio assets

import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioAsset {
  id: string;
  url: string;
  type: 'narration' | 'music' | 'effect';
  startTime: number;
  duration: number;
}

interface PreloadState {
  loaded: Set<string>;
  loading: Set<string>;
  errors: Map<string, Error>;
  progress: number;
}

interface UseV7AudioPreloaderOptions {
  preloadAhead?: number; // seconds to preload ahead
  maxConcurrent?: number;
  onAudioReady?: (assetId: string) => void;
  onError?: (assetId: string, error: Error) => void;
}

export const useV7AudioPreloader = (
  assets: AudioAsset[],
  currentTime: number,
  options: UseV7AudioPreloaderOptions = {}
) => {
  const {
    preloadAhead = 30, // Preload 30 seconds ahead
    maxConcurrent = 2,
    onAudioReady,
    onError,
  } = options;

  const [state, setState] = useState<PreloadState>({
    loaded: new Set(),
    loading: new Set(),
    errors: new Map(),
    progress: 0,
  });

  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Preload a single audio asset
  const preloadAsset = useCallback(async (asset: AudioAsset): Promise<void> => {
    if (state.loaded.has(asset.id) || state.loading.has(asset.id)) {
      return;
    }

    // Mark as loading
    setState(prev => ({
      ...prev,
      loading: new Set([...prev.loading, asset.id]),
    }));

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      
      const abortController = new AbortController();
      abortControllersRef.current.set(asset.id, abortController);

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay);
          audio.removeEventListener('error', handleError);
          abortController.signal.removeEventListener('abort', handleAbort);
        };

        const handleCanPlay = () => {
          cleanup();
          resolve();
        };

        const handleError = () => {
          cleanup();
          reject(new Error(`Failed to load audio: ${asset.url}`));
        };

        const handleAbort = () => {
          cleanup();
          reject(new Error('Preload aborted'));
        };

        audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
        audio.addEventListener('error', handleError, { once: true });
        abortController.signal.addEventListener('abort', handleAbort, { once: true });

        audio.src = asset.url;
        audio.load();
      });

      // Store the audio element
      audioElementsRef.current.set(asset.id, audio);

      // Mark as loaded
      setState(prev => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(asset.id);
        const newLoaded = new Set([...prev.loaded, asset.id]);
        
        return {
          ...prev,
          loaded: newLoaded,
          loading: newLoading,
          progress: (newLoaded.size / assets.length) * 100,
        };
      });

      onAudioReady?.(asset.id);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      
      setState(prev => {
        const newLoading = new Set(prev.loading);
        newLoading.delete(asset.id);
        const newErrors = new Map(prev.errors);
        newErrors.set(asset.id, err);
        
        return {
          ...prev,
          loading: newLoading,
          errors: newErrors,
        };
      });

      onError?.(asset.id, err);
    } finally {
      abortControllersRef.current.delete(asset.id);
    }
  }, [assets.length, onAudioReady, onError, state.loaded, state.loading]);

  // Get assets that should be loaded based on current time
  const getAssetsToPreload = useCallback(() => {
    return assets
      .filter(asset => {
        // Load if asset starts within preload window
        const shouldPreload = asset.startTime <= currentTime + preloadAhead;
        // Don't reload already loaded or loading assets
        const notLoaded = !state.loaded.has(asset.id) && !state.loading.has(asset.id);
        // Don't retry errored assets too quickly
        const notErrored = !state.errors.has(asset.id);
        
        return shouldPreload && notLoaded && notErrored;
      })
      .slice(0, maxConcurrent - state.loading.size);
  }, [assets, currentTime, preloadAhead, maxConcurrent, state]);

  // Preload effect
  useEffect(() => {
    const assetsToPreload = getAssetsToPreload();
    
    assetsToPreload.forEach(asset => {
      preloadAsset(asset);
    });
  }, [getAssetsToPreload, preloadAsset]);

  // Get preloaded audio element
  const getAudioElement = useCallback((assetId: string): HTMLAudioElement | null => {
    return audioElementsRef.current.get(assetId) || null;
  }, []);

  // Check if asset is ready
  const isAssetReady = useCallback((assetId: string): boolean => {
    return state.loaded.has(assetId);
  }, [state.loaded]);

  // Cleanup
  useEffect(() => {
    return () => {
      // Abort all pending loads
      abortControllersRef.current.forEach(controller => controller.abort());
      abortControllersRef.current.clear();
      
      // Release audio elements
      audioElementsRef.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioElementsRef.current.clear();
    };
  }, []);

  return {
    loadedAssets: state.loaded,
    loadingAssets: state.loading,
    errors: state.errors,
    progress: state.progress,
    getAudioElement,
    isAssetReady,
    preloadAsset,
  };
};
