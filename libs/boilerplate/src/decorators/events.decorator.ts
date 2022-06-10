import { SetMetadata } from '@nestjs/common';

export const EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';
/**
 * Event listener decorator.
 * Subscribes to events based on the specified name(s).
 */
export function OnEvent(event: string | symbol | string[]): MethodDecorator {
  return SetMetadata(EVENT_LISTENER_METADATA, {
    event,
  } as OnEventMetadata);
}

export class OnEventMetadata {
  /**
   * Event (name or pattern) to subscribe to.
   */
  public event: string | symbol | string[];
}
