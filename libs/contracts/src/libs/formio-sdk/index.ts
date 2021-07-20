/**
 * May contain alphnumeric, and dashes.
 *
 * Must not start/end with dash
 * Must not end with "submission" or "action"
 */
export type BaseOmitProperties = 'owner' | 'project';

// Basics
export * from './base.dto';
export * from './constants';
export * from './form.dto';
export * from './project.dto';
export * from './submission.dto';

// Extends
export * from './submission';
