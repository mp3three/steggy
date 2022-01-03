import { MenuEntry } from './inquirer';

export enum OBJECT_BUILDER_ELEMENT {
  string = 'string',
  confirm = 'confirm',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
  list = 'list',
}

export class ObjectBuilderElement<T = unknown> {
  public name: string;
  public options?: MenuEntry<T>[];
  public path: string;
  public type: OBJECT_BUILDER_ELEMENT;
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
