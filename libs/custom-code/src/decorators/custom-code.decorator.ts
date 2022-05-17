import { Injectable, Provider } from '@nestjs/common';

global.CUSTOM_PROVIDERS ??= [] as Provider[];

export function CustomCode(): ClassDecorator {
  return (target: unknown) => {
    global.CUSTOM_PROVIDERS.push(target as Provider);
    Injectable()(target as Function);
  };
}
