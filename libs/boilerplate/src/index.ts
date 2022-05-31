// This is purely so that builds include `reflect-metadata` in the package.json output
// ? Peer dependency might make more sense
import 'reflect-metadata';

export * from './config';
export * from './contracts';
export * from './decorators';
export * from './includes';
export * from './modules';
export * from './services';
