export interface Slot {
  group?: string;
  name?: string;
  sort?: 'alphabetical' | 'none';
  testName?: (name: string) => boolean;
}
