/**
 * Mock network latency.
 *
 * Every mock service call goes through this so loading affordances
 * (skeletons, progress bars, disabled buttons) are actually observable
 * in the demos instead of resolving synchronously.
 */

const DEFAULT_LATENCY_MS = 240;

export function simulateLatency(ms: number = DEFAULT_LATENCY_MS) {
  if (ms <= 0) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
