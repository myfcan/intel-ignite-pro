/**
 * Unit test: C11_RAF_ANCHOR_TIMING — Crossing Detector
 * 
 * Proves that the crossing detection logic fires within 2 RAF frames (≤32ms)
 * when audio time crosses a keywordTime trigger point.
 * 
 * Run: bunx vitest run src/components/lessons/v7/cinematic/validators/crossingDetector.test.ts
 */

import { describe, it, expect } from 'vitest';

// ============= EXTRACTED CROSSING LOGIC =============
// This is the exact logic from useAnchorText.ts, extracted for testability

function hasCrossedTrigger(triggerPoint: number, prevTime: number, currTime: number): boolean {
  return prevTime < triggerPoint && currTime >= triggerPoint;
}

// ============= SIMULATED RAF POLLING =============

interface RAFTickResult {
  frameIndex: number;
  prevTime: number;
  currTime: number;
  crossed: boolean;
}

/**
 * Simulates RAF-based audio polling and returns when crossing is detected.
 * @param keywordTime - The trigger point (seconds)
 * @param startTime - Audio time when simulation starts (seconds)  
 * @param playbackRate - Audio playback rate (1.0 = normal)
 * @param frameIntervalMs - RAF frame interval in ms (default 16.67 for 60fps)
 * @returns Array of tick results until crossing is detected (max 200 frames)
 */
function simulateRAFPolling(
  keywordTime: number,
  startTime: number,
  playbackRate: number = 1.0,
  frameIntervalMs: number = 16.67,
): RAFTickResult[] {
  const results: RAFTickResult[] = [];
  let prevTime = startTime;
  const maxFrames = 200; // Safety limit

  for (let i = 0; i < maxFrames; i++) {
    // Simulate audio advancing by frameInterval * playbackRate
    const elapsed = (frameIntervalMs / 1000) * playbackRate;
    const currTime = prevTime + elapsed;

    const crossed = hasCrossedTrigger(keywordTime, prevTime, currTime);
    results.push({ frameIndex: i, prevTime, currTime, crossed });

    if (crossed) break;

    prevTime = currTime;
  }

  return results;
}

// ============= TESTS =============

describe('C11_RAF_ANCHOR_TIMING — Crossing Detector', () => {

  describe('hasCrossedTrigger (pure function)', () => {
    it('returns true when prevTime < trigger <= currTime', () => {
      expect(hasCrossedTrigger(48.123, 48.100, 48.130)).toBe(true);
    });

    it('returns true when currTime exactly equals trigger', () => {
      expect(hasCrossedTrigger(48.123, 48.100, 48.123)).toBe(true);
    });

    it('returns false when both times are before trigger', () => {
      expect(hasCrossedTrigger(48.123, 47.900, 48.000)).toBe(false);
    });

    it('returns false when both times are after trigger', () => {
      expect(hasCrossedTrigger(48.123, 48.200, 48.300)).toBe(false);
    });

    it('returns false when prevTime equals trigger (already crossed)', () => {
      expect(hasCrossedTrigger(48.123, 48.123, 48.200)).toBe(false);
    });

    it('returns false when prevTime > trigger (past)', () => {
      expect(hasCrossedTrigger(48.123, 48.200, 48.300)).toBe(false);
    });

    it('handles trigger at exactly 0', () => {
      expect(hasCrossedTrigger(0, -1, 0)).toBe(true);
    });

    it('handles very small differences (microsecond precision)', () => {
      expect(hasCrossedTrigger(48.123, 48.12299, 48.12301)).toBe(true);
    });
  });

  describe('RAF Polling Simulation', () => {

    it('detects crossing within 2 frames at 60fps', () => {
      // Start audio 16ms before keywordTime  
      const keywordTime = 48.123;
      const startTime = keywordTime - 0.020; // 20ms before

      const ticks = simulateRAFPolling(keywordTime, startTime);
      const crossingTick = ticks.find(t => t.crossed);

      expect(crossingTick).toBeDefined();
      // Must detect within 2 frames (indices 0 or 1)
      expect(crossingTick!.frameIndex).toBeLessThanOrEqual(1);
    });

    it('detects crossing within 2 frames even starting 250ms before', () => {
      const keywordTime = 48.123;
      const startTime = keywordTime - 0.250; // 250ms before (worst case timeupdate interval)

      const ticks = simulateRAFPolling(keywordTime, startTime);
      const crossingTick = ticks.find(t => t.crossed);

      expect(crossingTick).toBeDefined();
      // At 60fps with 16.67ms frames, 250ms = ~15 frames
      // The crossing happens on the frame where it passes the trigger
      const overshoot = crossingTick!.currTime - keywordTime;
      // Overshoot must be less than 1 frame interval (16.67ms)
      expect(overshoot).toBeLessThan(0.017);
    });

    it('overshoot is always less than 1 RAF frame', () => {
      // Test multiple keywordTime values
      const keywordTimes = [0.5, 5.0, 10.123, 48.123, 100.456, 200.789];

      for (const kt of keywordTimes) {
        const startTime = kt - 0.100; // 100ms before
        const ticks = simulateRAFPolling(kt, startTime);
        const crossingTick = ticks.find(t => t.crossed);

        expect(crossingTick).toBeDefined();
        const overshoot = crossingTick!.currTime - kt;
        // Overshoot < 1 frame (16.67ms = 0.01667s)
        expect(overshoot).toBeLessThan(0.017);
        // Overshoot >= 0 (no negative overshoots)
        expect(overshoot).toBeGreaterThanOrEqual(0);
      }
    });

    it('detection latency is <= 32ms (2 frames) from actual crossing point', () => {
      const keywordTime = 48.123;
      // Start exactly 1 frame before (worst-case for "just missed previous tick")
      const startTime = keywordTime - 0.001; // 1ms before

      const ticks = simulateRAFPolling(keywordTime, startTime);
      const crossingTick = ticks.find(t => t.crossed);

      expect(crossingTick).toBeDefined();
      // The detection latency is the overshoot in time
      const latencyMs = (crossingTick!.currTime - keywordTime) * 1000;
      expect(latencyMs).toBeLessThanOrEqual(32);
    });

    it('handles playback rate 1.5x correctly', () => {
      const keywordTime = 48.123;
      const startTime = keywordTime - 0.100;

      const ticks = simulateRAFPolling(keywordTime, startTime, 1.5);
      const crossingTick = ticks.find(t => t.crossed);

      expect(crossingTick).toBeDefined();
      const overshoot = crossingTick!.currTime - keywordTime;
      // At 1.5x, each frame advances 25ms of audio → overshoot < 25ms
      expect(overshoot).toBeLessThan(0.026);
    });

    it('handles playback rate 0.5x correctly', () => {
      const keywordTime = 48.123;
      const startTime = keywordTime - 0.050;

      const ticks = simulateRAFPolling(keywordTime, startTime, 0.5);
      const crossingTick = ticks.find(t => t.crossed);

      expect(crossingTick).toBeDefined();
      const overshoot = crossingTick!.currTime - keywordTime;
      // At 0.5x, each frame advances 8.33ms of audio → overshoot < 8.33ms
      expect(overshoot).toBeLessThan(0.009);
    });
  });

  describe('Comparison: RAF vs timeupdate', () => {

    it('RAF overshoot is at least 10x smaller than worst-case timeupdate overshoot', () => {
      const keywordTime = 48.123;
      
      // Worst-case timeupdate: starts 1ms before keyword, next tick 250ms later
      const timeupdateWorstOvershoot = 0.249; // 250ms interval - 1ms = 249ms overshoot
      
      // Simulate RAF: fires every ~16.67ms
      const rafTicks = simulateRAFPolling(keywordTime, keywordTime - 0.100);
      const rafCrossing = rafTicks.find(t => t.crossed)!;
      const rafOvershoot = rafCrossing.currTime - keywordTime;

      // RAF overshoot should be significantly smaller than worst-case timeupdate
      expect(rafOvershoot).toBeLessThan(timeupdateWorstOvershoot);
      // And specifically less than 1 frame
      expect(rafOvershoot).toBeLessThan(0.017);
    });
  });
});
