import { APIRequest, APIResponse } from '@automagical/contracts/server';
import { createNamespace } from 'cls-hooked';
import { NextFunction } from 'express';

const context = createNamespace('express-ctx');

export function expressContextMiddleware(
  request: APIRequest,
  response: APIResponse,
  next: NextFunction,
): void {
  context.bindEmitter(request);
  context.bindEmitter(response);
  context.run(() => next());
}

export function expressContextSetValue(key: string, value: unknown): void {
  context.set(key, value);
}

export function expressContextGetValue<T = unknown>(key: string): T {
  if (context && context.active) {
    return context.get(key);
  }
}
