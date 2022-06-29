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
  // `setTimeout` & `setInterval` are not defined within the vm
  // sleep does have the desired effect
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
  del(key: string): Promise<void>;
  get<T extends unknown>(key: string): Promise<T>;
  keys(pattern?: string): Promise<string[]>;
  set<T extends unknown>(key: string, value: unknown, ttl?: number): Promise<T>;
}`,
  `

class ComparisonDTO {
  public operation?: FILTER_OPERATIONS | \`\${FILTER_OPERATIONS}\`;
  public value?: FilterValueType | FilterValueType[];
}
type FilterValueType =
  | string
  | boolean
  | number
  | Date
  | RegExp
  | unknown
  | Record<string, string>;


  enum HTTP_METHODS {
    get = 'get',
    delete = 'delete',
    put = 'put',
    head = 'head',
    options = 'options',
    patch = 'patch',
    index = 'index',
    post = 'post',
  }


  class WebhookHeaderDTO {
    public header: string;
    public value: string;
  }
class RoutineCommandWebhookDTO {
  public assignProperty?: string;
  public assignTo?: string;
  public assignType?: 'person' | 'room';
  public code?: string;
  public headers: WebhookHeaderDTO[];
  public method: \`\${HTTP_METHODS}\`;
  public objectPath?: string;
  public parse?: 'none' | 'text' | 'json';
  public url: string;
}

enum FILTER_OPERATIONS {
  // "elemMatch" functionality in mongo
  // eslint-disable-next-line unicorn/prevent-abbreviations
  elem = 'elem',
  regex = 'regex',
  in = 'in',
  nin = 'nin',
  lt = 'lt',
  lte = 'lte',
  gt = 'gt',
  gte = 'gte',
  exists = 'exists',
  ne = 'ne',
  eq = 'eq',
}
enum STOP_PROCESSING_TYPE {
  attribute = 'attribute',
  date = 'date',
  state = 'state',
  metadata = 'metadata',
  template = 'template',
  webhook = 'webhook',
}

enum RELATIVE_DATE_COMPARISON_TYPE {
  after = 'after',
  before = 'before',
  in_range = 'in_range',
  not_in_range = 'not_in_range',
}

type relative = \`\${RELATIVE_DATE_COMPARISON_TYPE}\`;

class RoutineStateComparisonDTO extends ComparisonDTO {
  public entity_id: string;
}

class RoutineAttributeComparisonDTO extends ComparisonDTO {
  public attribute: string;
  public entity_id: string;
}

class MetadataComparisonDTO extends ComparisonDTO {
  public property: string;
  public room: string;
  public type?: 'room' | 'person';
}

class RoutineWebhookComparisonDTO extends ComparisonDTO {
  public handleAs: 'text' | 'json';
  public property?: string;
  public webhook: RoutineCommandWebhookDTO;
}

class RoutineTemplateComparisonDTO extends ComparisonDTO {
  public template: string;
}

class RoutineRelativeDateComparisonDTO {
  public dateType: relative;
  public expression: string;
}

type STOP_PROCESSING_DEFINITIONS =
  | RoutineStateComparisonDTO
  | RoutineAttributeComparisonDTO
  | RoutineWebhookComparisonDTO
  | RoutineTemplateComparisonDTO
  | MetadataComparisonDTO
  | RoutineRelativeDateComparisonDTO;

class RoutineComparisonDTO<
  TYPE =
    | RoutineStateComparisonDTO
    | RoutineAttributeComparisonDTO
    | RoutineWebhookComparisonDTO
    | RoutineTemplateComparisonDTO
    | MetadataComparisonDTO
    | RoutineRelativeDateComparisonDTO,
> {
  public comparison: TYPE;
  public friendlyName: string;
  public id: string;
  public type: STOP_PROCESSING_TYPE;
}

class RoutineCommandStopProcessingDTO<T = STOP_PROCESSING_DEFINITIONS> {
  public comparisons?: RoutineComparisonDTO<T>[];
  public mode?: 'all' | 'any';
}



class RoutineEnableDTO<
  T = STOP_PROCESSING_DEFINITIONS,
> extends RoutineCommandStopProcessingDTO<T> {
  /**
   * Re-check interval for items such as webhook tests
   */
  public poll?: number;
  public type?: 'enable' | 'disable' | 'disable_rules' | 'enable_rules';
}

class RoutineDTO {
  /**
   * Autogenerated string
   */
  public _id?: string;

  public activate?: unknown[];

  public command?: unknown[];

  /**
   * Autogenerated creation date
   */
  public created?: Date;


  /**
   * Human readable/provided long form description
   */
  public description?: string;

  public enable?: RoutineEnableDTO;

  public friendlyName: string;

  /**
   * Autogenerated last modified date
   */
  public modified?: Date;

  /**
   * ID reference to another routine
   */
  public parent?: string;

  public repeat?: 'normal' | 'queue' | 'block' | 'interrupt';

  public sync?: boolean;
}
class HassStateDTO<
  STATE extends unknown = unknown,
  ATTRIBUTES extends Record<never, unknown> = { friendly_name?: string },
> {
  public attributes: ATTRIBUTES;
  public context: {
    id: string;
    parent_id: string;
    user_id: string;
  };
  public entity_id: string;
  public last_changed: string;
  public last_updated: string;
  public state: STATE;
}
class EventDataDTO<
  STATE extends unknown = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  public entity_id?: string;
  public event?: number;
  public id?: string;
  public new_state?: HassStateDTO<STATE, ATTRIBUTES>;
  public old_state?: HassStateDTO<STATE, ATTRIBUTES>;
}
class HassEventDTO<
  STATE extends unknown = unknown,
  ATTRIBUTES extends Record<never, unknown> = Record<never, unknown>,
> {
  public context: {
    id: string;
    parent_id: string;
    user_id: string;
  };
  public data: EventDataDTO<STATE, ATTRIBUTES>;
  public event_type: string;
  public origin: 'local';
  public result?: string;
  public time_fired: Date;
  public variables: Record<string, unknown>;
}
class GeneralSaveStateDTO {
  public extra?: Record<string, unknown>;
  public ref: string;
  public state?: string;
  public type?: 'group' | 'entity' | 'room';
}

class GroupSaveStateDTO {
  /**
   * Human readable name for the save state
   */
  public friendlyName: string;

  /**
   * Generated id
   */
  public id?: string;

  /**
   * Saved states
   */
  public states: GeneralSaveStateDTO[];
}
enum GROUP_REFERENCE_TYPES {
  group = 'group',
  room = 'room',
  person = 'person',
}
class GroupReferenceDTO {
  public target: string;
  public type: \`\${GROUP_REFERENCE_TYPES}\`;
}
class GroupDTO {
  /**
   * Autogenerated string
   */
  public _id?: string;
  /**
   * Autogenerated creation date
   */
  public created?: Date;

  public deleted?: number;

  /**
   * A list of entity ids that can be looked up in home assistant
   */
  public entities: string[];

  public friendlyName: string;

  /**
   * Autogenerated last modified date
   */
  public modified?: Date;

  public references?: GroupReferenceDTO[];

  /**
   * Captured save states
   */
  public save_states?: GroupSaveStateDTO[];

  /**
   * What type of group
   */
  public type: string;
}
enum ROOM_METADATA_TYPES {
  string = 'string',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
}
class RoomEntityDTO {
  public entity_id: string;
}
class RoomMetadataDTO {
  /**
   * Notes for self / "why did I create this variable?"
   */
  public description?: string;
  public id?: string;
  public name?: string;
  public options?: string[];
  public type?: \`\${ROOM_METADATA_TYPES}\`;
  public value?: string | boolean | number | Date;
}

class RoomStateDTO {
  public friendlyName: string;
  public id: string;
  public states: GeneralSaveStateDTO[];
  public tags?: string[];
}

class RoomDTO {
  /**
   * Autogenerated string
   */
  public _id?: string;
  /**
   * Autogenerated creation date
   */
  public created?: Date;

  public deleted?: number;

  public entities?: RoomEntityDTO[];

  /**
   * Dynamic data, current state for all items in entities array
   */
  public entityStates?: HassStateDTO[];

  public friendlyName: string;

  /**
   * Reference to group entries
   */
  public groups?: string[];

  public metadata?: RoomMetadataDTO[];

  /**
   * Autogenerated last modified date
   */
  public modified?: Date;

  /**
   * Javascript referenceable name for VMService
   */
  public name?: string;

  public save_states?: RoomStateDTO[];
}
enum PinTypes {
  group = 'group',
  entity = 'entity',
  room = 'room',
  routine = 'routine',
  person = 'person',
  group_state = 'group_state',
  person_state = 'person_state',
  room_state = 'room_state',
  room_metadata = 'room_metadata',
  person_metadata = 'person_metadata',
}

class PinnedItemDTO {
  public target: string;
  public type: \`\${PinTypes}\`;
}

class PersonDTO {
  /**
   * Autogenerated string
   */
  public _id?: string;

  /**
   * Autogenerated creation date
   */
  public created?: Date;

  public deleted?: number;

  public entities?: RoomEntityDTO[];

  /**
   * Dynamic data, current state for all items in entities array
   */
  public entityStates?: HassStateDTO[];

  public friendlyName: string;

  /**
   * Reference to group entries
   */
  public groups?: string[];

  public metadata?: RoomMetadataDTO[];

  /**
   * Autogenerated last modified date
   */
  public modified?: Date;

  /**
   * Javascript referenceable name for VMService
   */
  public name?: string;

  /**
   * For UI purposes. Track frequently accessed items
   */
  public pinned_items?: PinnedItemDTO[];

  /**
   * Reference to room entries
   */
  public rooms?: string[];

  public save_states?: RoomStateDTO[];
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
