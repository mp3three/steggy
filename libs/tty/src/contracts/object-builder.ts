export enum TABLE_CELL_TYPE {
  string = 'string',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
  list = 'list',
}

export class TableBuilderElement<EXTRA = unknown> {
  public extra?: EXTRA;
  public format?: (value: unknown) => string;
  public name: string;
  public path: string;
  public type: `${TABLE_CELL_TYPE}`;
}

export class TableBuilderOptions<T extends unknown> {
  public current?: T | T[];
  public elements: TableBuilderElement[];
  public mode?: 'single' | 'multi';
}

export class ColumnInfo {
  public maxWidth: number;
  public name: string;
}

export enum OBJECT_BUILDER_ELEMENT {
  string = 'string',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
  list = 'list',
}

export class ObjectBuilderEnum {
  public enum: string[];
}

export class ObjectBuilderElement {
  public name: string;
  public options?: ObjectBuilderEnum;
  public path: string;
  public type: OBJECT_BUILDER_ELEMENT;
}

export class ObjectBuilderOptions<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  public current?: T | T[];
  public elements: ObjectBuilderElement[];
}
