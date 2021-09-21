import { AutoLogService } from '@automagical/utilities';
import { AsyncLocalStorage } from 'async_hooks';

export class Store {
  constructor(public logger: AutoLogService) {}
}

export const storage = new AsyncLocalStorage<Store>();
