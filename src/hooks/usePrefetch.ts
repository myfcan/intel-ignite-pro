import { useEffect } from 'react';

// Prefetch functions for lazy-loaded pages
const prefetchDashboard = () => import('../pages/Dashboard');
const prefetchTrailDetail = () => import('../pages/TrailDetail');
const prefetchOnboarding = () => import('../pages/Onboarding');

/**
 * Hook to prefetch frequently accessed pages in the background
 * Call this on pages where users are likely to navigate to Dashboard or TrailDetail next
 */
export const usePrefetchDashboard = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    
    // Small delay to not interfere with current page load
    const timeoutId = setTimeout(() => {
      prefetchDashboard();
      prefetchOnboarding();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [enabled]);
};

export const usePrefetchTrailDetail = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    
    const timeoutId = setTimeout(() => {
      prefetchTrailDetail();
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [enabled]);
};

/**
 * Prefetch all main pages (Dashboard, TrailDetail, Onboarding)
 * Use on landing page or auth page
 */
export const usePrefetchMainPages = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    
    // Stagger prefetching to avoid bandwidth congestion
    const timer1 = setTimeout(() => prefetchDashboard(), 1500);
    const timer2 = setTimeout(() => prefetchOnboarding(), 2000);
    const timer3 = setTimeout(() => prefetchTrailDetail(), 2500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [enabled]);
};
