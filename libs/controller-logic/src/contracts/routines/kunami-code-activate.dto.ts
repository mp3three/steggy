export class KunamiCodeActivateDTO {
  /**
   * States from controller to match
   */
  public match: string[];

  /**
   * Normally a watcher must wait 1500 as a "cooling off" / "waiting for more states to match with to come in"
   *
   * - self: after activating, reset the progress of this particular activate event so it can re-activate immediately
   *
   * - sensor: reset ALL kunami activate watchers attached to this sensor as if that 1500 seconds happened immediately
   */
  public reset?: 'self' | 'sensor';

  /**
   * entity_id
   */
  public sensor: string;
}
