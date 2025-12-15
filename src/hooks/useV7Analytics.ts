// src/hooks/useV7Analytics.ts
// Analytics tracking hook for V7 Cinematic Lessons

import { useCallback, useRef, useEffect } from 'react';
import { AnalyticsEvent, AnalyticsMetric } from '@/types/v7-cinematic.types';
import { supabase } from '@/integrations/supabase/client';

interface V7AnalyticsSession {
  lessonId: string;
  userId?: string;
  sessionId: string;
  startTime: number;
  events: AnalyticsEvent[];
  metrics: AnalyticsMetric[];
}

export function useV7Analytics(lessonId: string) {
  // ============================================================================
  // HOOKS AT TOP
  // ============================================================================

  const sessionRef = useRef<V7AnalyticsSession | null>(null);
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // SESSION INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Initialize analytics session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      sessionRef.current = {
        lessonId,
        userId: session?.user?.id,
        sessionId: `v7-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        events: [],
        metrics: [],
      };

      console.log('[V7Analytics] Session initialized:', sessionRef.current.sessionId);
    };

    initSession();

    // Setup auto-flush every 30 seconds
    flushTimerRef.current = setInterval(() => {
      flushAnalytics();
    }, 30000);

    // Cleanup on unmount
    return () => {
      flushAnalytics();
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
    };
  }, [lessonId]);

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (!sessionRef.current) return;

    const enhancedEvent = {
      ...event,
      sessionId: sessionRef.current.sessionId,
      timestamp: event.timestamp || Date.now(),
    };

    sessionRef.current.events.push(enhancedEvent);

    console.log('[V7Analytics] Event tracked:', enhancedEvent.type, enhancedEvent.data);

    // If this is a critical event, flush immediately
    if (event.type === 'complete' || event.type === 'act-complete') {
      flushAnalytics();
    }
  }, []);

  const trackMetric = useCallback((metric: AnalyticsMetric) => {
    if (!sessionRef.current) return;

    // Update or add metric
    const existingIndex = sessionRef.current.metrics.findIndex((m) => m.id === metric.id);

    if (existingIndex >= 0) {
      sessionRef.current.metrics[existingIndex] = metric;
    } else {
      sessionRef.current.metrics.push(metric);
    }

    console.log('[V7Analytics] Metric tracked:', metric.id, metric.value);
  }, []);

  // ============================================================================
  // DATA PERSISTENCE
  // ============================================================================

  const flushAnalytics = useCallback(async () => {
    if (!sessionRef.current || sessionRef.current.events.length === 0) return;

    try {
      const analyticsData = {
        lesson_id: sessionRef.current.lessonId,
        user_id: sessionRef.current.userId,
        session_id: sessionRef.current.sessionId,
        start_time: new Date(sessionRef.current.startTime).toISOString(),
        events: sessionRef.current.events,
        metrics: sessionRef.current.metrics,
        duration: Date.now() - sessionRef.current.startTime,
      };

      // Store in Supabase
      const { error } = await supabase.from('v7_analytics').insert([analyticsData]);

      if (error) {
        console.error('[V7Analytics] Failed to flush analytics:', error);
      } else {
        console.log(
          '[V7Analytics] Flushed',
          sessionRef.current.events.length,
          'events'
        );
        // Clear flushed events
        sessionRef.current.events = [];
      }
    } catch (error) {
      console.error('[V7Analytics] Error flushing analytics:', error);
    }
  }, []);

  // ============================================================================
  // COMPUTED ANALYTICS
  // ============================================================================

  const getEngagementScore = useCallback((): number => {
    if (!sessionRef.current) return 0;

    const events = sessionRef.current.events;
    const duration = Date.now() - sessionRef.current.startTime;

    // Calculate engagement based on:
    // - Number of interactions
    // - Time spent
    // - Completion of acts
    // - Interaction success rate

    const interactionCount = events.filter((e) => e.type === 'interaction').length;
    const actCompleteCount = events.filter((e) => e.type === 'act-complete').length;
    const pauseCount = events.filter((e) => e.type === 'pause').length;

    // Simple engagement formula (can be refined)
    const engagementScore =
      Math.min(interactionCount * 10, 50) + // Max 50 points from interactions
      Math.min(actCompleteCount * 15, 30) + // Max 30 points from act completion
      Math.min(duration / 1000 / 60, 20) - // Max 20 points from time spent
      pauseCount * 2; // Penalty for pausing

    return Math.max(0, Math.min(engagementScore, 100));
  }, []);

  const getCompletionRate = useCallback((): number => {
    if (!sessionRef.current) return 0;

    const events = sessionRef.current.events;
    const completeEvent = events.find((e) => e.type === 'complete');

    if (completeEvent) return 100;

    const actCompleteCount = events.filter((e) => e.type === 'act-complete').length;
    // This assumes we know the total number of acts
    // In production, this would come from lesson metadata
    const totalActs = 5; // Placeholder

    return (actCompleteCount / totalActs) * 100;
  }, []);

  const getAverageInteractionTime = useCallback((): number => {
    if (!sessionRef.current) return 0;

    const interactionEvents = sessionRef.current.events.filter(
      (e) => e.type === 'interaction'
    );

    if (interactionEvents.length === 0) return 0;

    // Calculate time between interaction events
    let totalTime = 0;
    for (let i = 1; i < interactionEvents.length; i++) {
      totalTime += interactionEvents[i].timestamp - interactionEvents[i - 1].timestamp;
    }

    return totalTime / (interactionEvents.length - 1);
  }, []);

  // ============================================================================
  // EXPORT
  // ============================================================================

  return {
    trackEvent,
    trackMetric,
    flushAnalytics,
    getEngagementScore,
    getCompletionRate,
    getAverageInteractionTime,
  };
}
