import { log } from 'node:console';
import { iLogger } from '../typings/iLogger';
import { Logger } from './logger';
import debugLib, { Debugger } from 'debug';

describe('Logger', () => {
  it('should have all the methods defined', () => {
    const logger = Logger('test');
    [
      'emerg',
      'alert',
      'crit',
      'error',
      'warning',
      'notice',
      'info',
      'debug',
    ].forEach((level: keyof iLogger) => {
      expect(logger[level]).toBeDefined();
    });
  });
});
