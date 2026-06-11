/**
 * Module-level search controller.
 * Holds the current AbortController so any component can stop an in-flight search.
 */

let _abort: (() => void) | null = null;

/** Called by useTickets when a new fetch session starts. */
export function registerAbort(fn: () => void) {
  _abort = fn;
}

/** Called when the user clicks "Parar". Cancels the current fetch. */
export function stopSearch() {
  _abort?.();
  _abort = null;
}

/** Returns whether a stop function is currently registered. */
export function canStop() {
  return _abort !== null;
}
