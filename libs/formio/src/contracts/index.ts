/**
 * May contain alphnumeric, and dashes.
 *
 * Must not start/end with dash
 * Must not end with "submission" or "action"
 */
export type BaseOmitProperties = 'owner' | 'project';

// Basics
export * from './access.dto';
export * from './action.dto';
export * from './action-condition.dto';
export * from './action-item.dto';
export * from './base.dto';
export * from './can-fake.dto';
export * from './constants';
export * from './database-fake.dto';
export * from './email';
export * from './form.dto';
export * from './project.dto';
export * from './role.dto';
export * from './sdk-crud-options';
export * from './submission.dto';

// Extends
export * from './components';
