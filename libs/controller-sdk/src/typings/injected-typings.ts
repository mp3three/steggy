/**
 * ## Description
 *
 * These will be replaced when I figure out how to make the UI pull these directly form NPM instead
 *
 * ## Included
 *
 * - logger interface
 */
export const EXTRA_UI_TYPINGS = [
  `/**`,
  ` * Pause execution for \`n\` ms (default \`1000\`)`,
  ` * `,
  ` * @example \`await sleep(2000)\``,
  ` */`,
  `declare const sleep: (duration?:number) => Promise<void>;`,
  `type LogLevels = 'info' | 'debug' | 'warn' | 'trace' | 'error' | 'fatal';`,
  `type LoggerFunction =
  | ((message: string, ...arguments_: unknown[]) => void)
  | ((
      object: Record<string, unknown>,
      message?: string,
      ...arguments_: unknown[]
    ) => void);`,
  `interface iLogger extends iLoggerCore {
  level: LogLevels | string;
  debug(message: string, ...arguments_: unknown[]): void;
  debug(...arguments_: Parameters<LoggerFunction>): void;
  error(message: string, ...arguments_: unknown[]): void;
  error(...arguments_: Parameters<LoggerFunction>): void;
  fatal(message: string, ...arguments_: unknown[]): void;
  fatal(...arguments_: Parameters<LoggerFunction>): void;
  info(message: string, ...arguments_: unknown[]): void;
  info(...arguments_: Parameters<LoggerFunction>): void;
  trace(message: string, ...arguments_: unknown[]): void;
  trace(...arguments_: Parameters<LoggerFunction>): void;
  warn(message: string, ...arguments_: unknown[]): void;
  warn(...arguments_: Parameters<LoggerFunction>): void;
}`,
  `interface iLoggerCore {
  level: LogLevels | string;
  debug(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  error(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  fatal(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  info(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  trace(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
  warn(
    object: Record<string, unknown>,
    message?: string,
    ...arguments_: unknown[]
  ): void;
}`,
  // FIXME: I just LOVE the way this is repeated...
  // blocked on fixing right now
  `/**
  * Functions for more direct access of internal code APIs
  *
  * This is intended to provide a smattering of generally useful methods for interacting with the controller.
  * Future implementations will keep this, but ALSO directly inject providers for "direct access" as an advanced feature.
  * That will happen after I am able to import **@scoped** packages into the monaco editor
  */
   interface iVMBreakoutAPI {
   /**
    * A flat ID listing of all routines the controller identifies as active.
    * Modifying this list has no effect
    */
   ACTIVE_ROUTINES: string[];
   /**
    * Execute a single command out of the routine.
    * Does not consider the enabled state of the routine
    */
   activateCommand(
     command: string,
     routine: string,
     waitForChange?: boolean,
     runId?: string,
   ): Promise<boolean>;
   activateGroupState(
     target: string,
     state: string,
     waitForChange?: boolean,
   ): Promise<void>;
   activatePersonState(
     target: string,
     state: string,
     waitForChange?: boolean,
   ): Promise<void>;
   activateRoomState(
     target: string,
     state: string,
     waitForChange?: boolean,
   ): Promise<void>;
   /**
    * Activate a routine, taking into account current disabled state, and race condition modifiers.
    * Depending on the options passed, and the current state of the routine, it is not guaranteed that it will execute
    */
   activateRoutine(
     /**
      * Routine ID
      */
     routine: string,
     options?: {
       /***
        * Force activation (ignore disabled state / other modifiers)
        */
       force?: boolean;
       /**
        * Report an activation source
        */
       source?: string;
       /**
        * Activate routine in this many ms
        */
       timeout?: number;
       /**
        * Execute routine at future date
        */
       timestamp?: string;
     },
     /**
      * Wait for home assistant to respond back
      */
     waitForChange?: boolean,
   ): Promise<void>;
   // that was the point
   // eslint-disable-next-line spellcheck/spell-checker
   /**
    * Convert an expression to a date, or date range
    *
    * - "thursmas" should return undefined
    * - "tomorrow" should return single date
    * - "Monday to Friday" should return pair of dates
    */
   chronoParse(text: string): undefined | [Date] | [Date, Date];
   /**
    * Modify the enabled setting of a routine.
    * Cannot modify rules through this method, the web UI must be used for that
    */
   routineEnable(
     routine: string,
     enabled: 'enable' | 'disable' | 'disable_rules' | 'enable_rules',
   ): Promise<void>;
   /**
    * Convert a routine ID to a name that's excessively friendly for use with the logger
    *
    * [Routine] > [Child] > [Target Grandchild]
    */
   routineSuperFriendlyName(id: string): string;
   /**
    * @deprecated temporary placeholder, expect to go away
    */
   sendNotification(
     message: string,
     optional?: {
       data?: Record<string, unknown>;
       target?: string;
       title?: string;
     },
     waitForChange?: boolean,
   ): Promise<void>;
   /**
    * Modify the metadata for a room.
    * **DOES** perform type checking / coercion on the inside.
    * **DOES NOT** allow for the creation of new properties.
    *
    * Will automatically perform updates / routine activations related to the changing of this value.
    */
   updatePersonMetadata(
     idOrName: string,
     property: string,
     value: unknown,
   ): Promise<void>;
   /**
    * Modify the metadata for a room.
    * **DOES** perform type checking / coercion on the inside.
    * **DOES NOT** allow for the creation of new properties.
    *
    * Will automatically perform updates / routine activations related to the changing of this value.
    */
   updateRoomMetadata(
     idOrName: string,
     property: string,
     value: unknown,
   ): Promise<void>;
 }`,
  `interface iCacheManager {
  del<T extends unknown>(key: string): Promise<T>;
  get<T extends unknown>(key: string): Promise<T>;
  set<T extends unknown>(key: string, value: unknown, ttl?: number): Promise<T>;
}`,
].join(`\n`);

/**
 * Functions for more direct access of internal code APIs
 *
 * This is intended to provide a smattering of generally useful methods for interacting with the controller.
 * Future implementations will keep this, but ALSO directly inject providers for "direct access" as an advanced feature.
 * That will happen after I am able to import **@scoped** packages into the monaco editor
 */
export interface iVMBreakoutAPI {
  /**
   * A flat ID listing of all routines the controller identifies as active.
   * Modifying this list has no effect
   */
  ACTIVE_ROUTINES: string[];
  /**
   * Execute a single command out of the routine.
   * Does not consider the enabled state of the routine
   */
  activateCommand(
    command: string,
    routine: string,
    waitForChange?: boolean,
    runId?: string,
  ): Promise<boolean>;
  activateGroupState(
    target: string,
    state: string,
    waitForChange?: boolean,
  ): Promise<void>;
  activatePersonState(
    target: string,
    state: string,
    waitForChange?: boolean,
  ): Promise<void>;
  activateRoomState(
    target: string,
    state: string,
    waitForChange?: boolean,
  ): Promise<void>;
  /**
   * Activate a routine, taking into account current disabled state, and race condition modifiers.
   * Depending on the options passed, and the current state of the routine, it is not guaranteed that it will execute
   */
  activateRoutine(
    /**
     * Routine ID
     */
    routine: string,
    options?: {
      /***
       * Force activation (ignore disabled state / other modifiers)
       */
      force?: boolean;
      /**
       * Report an activation source
       */
      source?: string;
      /**
       * Activate routine in this many ms
       */
      timeout?: number;
      /**
       * Execute routine at future date
       */
      timestamp?: string;
    },
    /**
     * Wait for home assistant to respond back
     */
    waitForChange?: boolean,
  ): Promise<void>;
  // that was the point
  // eslint-disable-next-line spellcheck/spell-checker
  /**
   * Convert an expression to a date, or date range
   *
   * - "thursmas" should return undefined
   * - "tomorrow" should return single date
   * - "Monday to Friday" should return pair of dates
   */
  chronoParse(text: string): undefined | [Date] | [Date, Date];
  /**
   * Modify the enabled setting of a routine.
   * Cannot modify rules through this method, the web UI must be used for that
   */
  routineEnable(
    routine: string,
    enabled: 'enable' | 'disable' | 'disable_rules' | 'enable_rules',
  ): Promise<void>;
  /**
   * Convert a routine ID to a name that's excessively friendly for use with the logger
   *
   * [Routine] > [Child] > [Target Grandchild]
   */
  routineSuperFriendlyName(id: string): string;
  /**
   * @deprecated temporary placeholder, expect to go away
   */
  sendNotification(
    message: string,
    optional?: {
      data?: Record<string, unknown>;
      target?: string;
      title?: string;
    },
    waitForChange?: boolean,
  ): Promise<void>;
  /**
   * Modify the metadata for a room.
   * **DOES** perform type checking / coercion on the inside.
   * **DOES NOT** allow for the creation of new properties.
   *
   * Will automatically perform updates / routine activations related to the changing of this value.
   */
  updatePersonMetadata(
    idOrName: string,
    property: string,
    value: unknown,
  ): Promise<void>;
  /**
   * Modify the metadata for a room.
   * **DOES** perform type checking / coercion on the inside.
   * **DOES NOT** allow for the creation of new properties.
   *
   * Will automatically perform updates / routine activations related to the changing of this value.
   */
  updateRoomMetadata(
    idOrName: string,
    property: string,
    value: unknown,
  ): Promise<void>;
}
