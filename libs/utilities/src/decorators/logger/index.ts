export * from './debug.decorator';
export * from './loggable-module.decorator';
export * from './trace.decorator';
export * from './warn.decorator';

export let TRACE_ENABLED = true;
export let DEBUG_ENABLED = true;

export function SetTrace(state: boolean): void {
  TRACE_ENABLED = state;
}

export function SetDebug(state: boolean): void {
  DEBUG_ENABLED = state;
}
