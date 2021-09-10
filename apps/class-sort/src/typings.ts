import { Rule } from './eslint';

export class DefaultsDTO {
  groups?: unknown[];
  order?: unknown[];
}
export class Slot {
  group?: string;
  name?: string;
  sort?: 'alphabetical' | 'none';
  testName?: (name: string) => boolean;
}
export class ReportProblemParameters {
  problem: Problems | string;
  message: string;
  context: Rule.RuleContext;
  stopAfterFirst: boolean;
  problemCount: number;
  groupAccessors?: boolean;
}

export class PluginOptions {
  message?: string;
  accessorPairPositioning?: 'getThenSet' | 'any';
  context?: Rule.RuleContext;
  stopAfterFirstProblem?: boolean;
  problemCount?: number;
  groupAccessors?: unknown[];
  order?: unknown[];
  groups?: [];
  locale?: string;
}

export interface Problems {
  expected: string;
  source: unknown;
  target: unknown;
}

export interface ReportData {
  expected: string;
  source: unknown;
  target: unknown;
  more?: number;
  problem?: string;
}
