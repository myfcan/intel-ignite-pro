// src/hooks/useV7Performance.ts
// Performance monitoring and optimization hook for V7 lessons

import { useState, useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  loadingTime: number;
  audioLoadTime: number;
  frameDrops: number;
  isLowPerformance: boolean;
}

interface UseV7PerformanceOptions {
  onLowPerformance?: () => void;
  fpsThreshold?: number;
}

export const useV7Performance = (options: UseV7PerformanceOptions = {}) => {
  const { onLowPerformance, fpsThreshold = 30 } = options;
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    loadingTime: 0,
    audioLoadTime: 0,
    frameDrops: 0,
    isLowPerformance: false,
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameDropsRef = useRef(0);
  const loadStartRef = useRef(performance.now());
  const isMonitoringRef = useRef(false);
  const animationFrameRef = useRef<number>();
  const lowPerformanceCountRef = useRef(0);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) return;
    isMonitoringRef.current = true;
    loadStartRef.current = performance.now();
    
    const measureFPS = () => {
      if (!isMonitoringRef.current) return;
      
      frameCountRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      
      // Calculate FPS every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);
        const isLow = fps < fpsThreshold;
        
        if (isLow) {
          lowPerformanceCountRef.current++;
          // Only trigger callback after 3 consecutive low FPS readings
          if (lowPerformanceCountRef.current >= 3 && onLowPerformance) {
            onLowPerformance();
          }
        } else {
          lowPerformanceCountRef.current = 0;
        }
        
        setMetrics(prev => ({
          ...prev,
          fps,
          isLowPerformance: lowPerformanceCountRef.current >= 3,
        }));
        
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };
    
    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, [fpsThreshold, onLowPerformance]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Record loading time
  const recordLoadingComplete = useCallback(() => {
    const loadingTime = performance.now() - loadStartRef.current;
    setMetrics(prev => ({ ...prev, loadingTime }));
    return loadingTime;
  }, []);

  // Record audio load time
  const recordAudioLoadTime = useCallback((time: number) => {
    setMetrics(prev => ({ ...prev, audioLoadTime: time }));
  }, []);

  // Record frame drop
  const recordFrameDrop = useCallback(() => {
    frameDropsRef.current++;
    setMetrics(prev => ({ ...prev, frameDrops: frameDropsRef.current }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    metrics,
    startMonitoring,
    stopMonitoring,
    recordLoadingComplete,
    recordAudioLoadTime,
    recordFrameDrop,
  };
};

// Utility to check if device is low-end
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4;
  if (cores <= 2) return true;
  
  // Check device memory if available
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory <= 2) return true;
  
  // Check if mobile with low resolution
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth < 768;
    const isLowRes = window.devicePixelRatio < 1.5;
    if (isMobile && isLowRes) return true;
  }
  
  return false;
};
