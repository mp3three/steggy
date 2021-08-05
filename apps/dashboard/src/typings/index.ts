import type { Widgets } from 'blessed-contrib';

export const BLESSED_GRID = Symbol('BLESSED_GRID');
export type GridElement = Widgets.GridElement;

export const TOGGLE_LOFT_CONTROLLER = 'TOGGLE_LOFT_CONTROLLER';
export * from './constants';
export * from './workspace.interface';
