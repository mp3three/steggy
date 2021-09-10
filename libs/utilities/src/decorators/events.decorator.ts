import { SetMetadata } from '@nestjs/common';
import { OnOptions } from 'eventemitter2';

export const EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';
/**
 * Event listener decorator.
 * Subscribes to events based on the specified name(s).
 */
export function OnEvent(
  event: string | symbol | Array<string | symbol>,
  options?: OnOptions,
): MethodDecorator {
  return SetMetadata(EVENT_LISTENER_METADATA, {
    event,
    options,
  } as OnEventMetadata);
}

export class OnEventMetadata {
  

  /**
   * Event (name or pattern) to subscribe to.
   */
  public event: string | symbol | Array<string | symbol>;
  /**
   * Subscription options.
   */
  options?: OnOptions;

  
}
