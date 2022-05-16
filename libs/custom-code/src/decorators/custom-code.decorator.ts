import { Injectable, Provider } from '@nestjs/common';

export const CUSTOM_PROVIDERS: Provider[] = [];

export function CustomCode(): ClassDecorator {
  return (target: unknown) => {
    CUSTOM_PROVIDERS.push(target as Provider);
    Injectable()(target as Function);
  };
}
