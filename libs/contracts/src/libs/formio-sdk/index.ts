export * from './action';
export * from './Action.dto';
export * from './ActionItem.dto';
export * from './Base.dto';
export * from './constants';
export * from './Form.dto';
export * from './Project.dto';
export * from './resource';
export * from './Resource.dto';
export * from './Role.dto';
export * from './Submission.dto';
export * from './Tag.dto';
export * from './Token.dto';

/**
 * May contain alphnumeric, and dashes.
 *
 * Must not start/end with dash
 * Must not end with "submission" or "action"
 */
export const NAME_REGEX = '^(?!-)[0-9a-zA-Z-]*(?<!submission|action|-)$';
