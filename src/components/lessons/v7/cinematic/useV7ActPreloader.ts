// useV7ActPreloader - Pre-buffer system for seamless act transitions
// Preloads next act's assets (images, code, data) before transition

import { useState, useCallback, useRef, useEffect } from "react";

interface ActAsset {
  id: string;
  type: "image" | "code" | "data" | "component";
  url?: string;
  data?: any;
}

interface PreloadedAct {
  actId: string;
  assets: Map<string, any>;
  isReady: boolean;
  loadedAt: number;
}

interface UseV7ActPreloaderOptions {
  preloadAhead?: number; // How many acts to preload ahead
  maxCached?: number; // Max cached acts
  onPreloadComplete?: (actId: string) => void;
  onPreloadError?: (actId: string, error: Error) => void;
}

export const useV7ActPreloader = (options: UseV7ActPreloaderOptions = {}) => {
  const {
    preloadAhead = 2,
    maxCached = 5,
    onPreloadComplete,
    onPreloadError,
  } = options;

  const [preloadedActs, setPreloadedActs] = useState<Map<string, PreloadedAct>>(new Map());
  const [isPreloading, setIsPreloading] = useState(false);
  const preloadQueueRef = useRef<string[]>([]);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Preload an image
  const preloadImage = useCallback((url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  // Preload code (syntax highlighting preparation)
  const preloadCode = useCallback(async (code: string, language: string): Promise<string> => {
    // Return highlighted code (actual highlighting done by Prism in component)
    return code;
  }, []);

  // Preload a single act's assets
  const preloadAct = useCallback(async (
    actId: string,
    assets: ActAsset[]
  ): Promise<void> => {
    if (preloadedActs.has(actId)) return;

    const abortController = new AbortController();
    abortControllersRef.current.set(actId, abortController);

    setIsPreloading(true);

    const loadedAssets = new Map<string, any>();

    try {
      await Promise.all(
        assets.map(async (asset) => {
          if (abortController.signal.aborted) return;

          try {
            switch (asset.type) {
              case "image":
                if (asset.url) {
                  const img = await preloadImage(asset.url);
                  loadedAssets.set(asset.id, img);
                }
                break;

              case "code":
                if (asset.data) {
                  const highlighted = await preloadCode(
                    asset.data.code,
                    asset.data.language
                  );
                  loadedAssets.set(asset.id, highlighted);
                }
                break;

              case "data":
                loadedAssets.set(asset.id, asset.data);
                break;

              case "component":
                // Components are already loaded, just mark as ready
                loadedAssets.set(asset.id, true);
                break;
            }
          } catch (error) {
            console.warn(`[V7Preloader] Failed to preload asset ${asset.id}:`, error);
          }
        })
      );

      if (!abortController.signal.aborted) {
        setPreloadedActs((prev) => {
          const next = new Map(prev);
          
          // Enforce max cached limit
          if (next.size >= maxCached) {
            // Remove oldest cached act
            const oldest = Array.from(next.entries())
              .sort((a, b) => a[1].loadedAt - b[1].loadedAt)[0];
            if (oldest) next.delete(oldest[0]);
          }

          next.set(actId, {
            actId,
            assets: loadedAssets,
            isReady: true,
            loadedAt: Date.now(),
          });

          return next;
        });

        onPreloadComplete?.(actId);
      }
    } catch (error) {
      console.error(`[V7Preloader] Error preloading act ${actId}:`, error);
      onPreloadError?.(actId, error as Error);
    } finally {
      setIsPreloading(false);
      abortControllersRef.current.delete(actId);
    }
  }, [preloadedActs, maxCached, preloadImage, preloadCode, onPreloadComplete, onPreloadError]);

  // Queue acts for preloading
  const queuePreload = useCallback((actIds: string[], assetsMap: Map<string, ActAsset[]>) => {
    actIds.slice(0, preloadAhead).forEach((actId) => {
      if (!preloadedActs.has(actId) && !preloadQueueRef.current.includes(actId)) {
        preloadQueueRef.current.push(actId);
        const assets = assetsMap.get(actId) || [];
        preloadAct(actId, assets);
      }
    });
  }, [preloadedActs, preloadAhead, preloadAct]);

  // Get preloaded act data
  const getPreloadedAct = useCallback((actId: string): PreloadedAct | undefined => {
    return preloadedActs.get(actId);
  }, [preloadedActs]);

  // Check if act is ready
  const isActReady = useCallback((actId: string): boolean => {
    return preloadedActs.get(actId)?.isReady ?? false;
  }, [preloadedActs]);

  // Get asset from preloaded act
  const getAsset = useCallback((actId: string, assetId: string): any => {
    return preloadedActs.get(actId)?.assets.get(assetId);
  }, [preloadedActs]);

  // Cancel all preloading
  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();
    preloadQueueRef.current = [];
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cancelAll();
    setPreloadedActs(new Map());
  }, [cancelAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAll();
    };
  }, [cancelAll]);

  return {
    // State
    preloadedActs,
    isPreloading,

    // Actions
    preloadAct,
    queuePreload,
    cancelAll,
    clearCache,

    // Getters
    getPreloadedAct,
    isActReady,
    getAsset,
  };
};
