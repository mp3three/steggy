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
export * from './constants';
export * from './form.dto';
export * from './project.dto';
export * from './role.dto';
export * from './schema.dto';
export * from './session.dto';
export * from './submission.dto';
export * from './tag.dto';
export * from './token.dto';

// Extends
export * from './portal';
export * from './submission';
