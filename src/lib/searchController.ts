let _abort: (() => void) | null = null;

export function registerAbort(fn: () => void) { _abort = fn; }
export function stopSearch() { _abort?.(); _abort = null; }
export function canStop() { return _abort !== null; }
