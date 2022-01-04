export enum OBJECT_BUILDER_ELEMENT {
  string = 'string',
  confirm = 'confirm',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
  discriminator = 'discriminator',
  list = 'list',
}

export class ObjectBuilderElement<EXTRA = unknown> {
  public extra?: EXTRA;
  public format?: (value: unknown) => string;
  public name: string;
  public path: string;
  public type: string;
}

export class ObjectBuilderOptions<T extends unknown> {
  public current?: T | T[];
  public elements: ObjectBuilderElement[];
  public mode?: 'single' | 'multi';
}

export class ColumnInfo {
  public maxWidth: number;
  public name: string;
}
