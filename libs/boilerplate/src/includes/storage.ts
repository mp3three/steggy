import { AsyncLocalStorage } from 'async_hooks';
import pino from 'pino';

export const storage = new AsyncLocalStorage<pino.Logger>();
