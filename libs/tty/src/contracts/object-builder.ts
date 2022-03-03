export enum TABLE_CELL_TYPE {
  string = 'string',
  confirm = 'confirm',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
  discriminator = 'discriminator',
  list = 'list',
}

export class TableBuilderElement<EXTRA = unknown> {
  public extra?: EXTRA;
  public format?: (value: unknown) => string;
  public name: string;
  public path: string;
  public type: string;
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
