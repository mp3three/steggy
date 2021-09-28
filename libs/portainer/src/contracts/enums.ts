/* eslint-disable @typescript-eslint/no-magic-numbers */

export enum TemplateTypes {
  swarm = 1,
  compose = 2,
}
export enum PlatformTypes {
  linux = 1,
  windows = 2,
}
export enum ResourceControlTypes {
  container = 1,
  service = 2,
  volume = 3,
  secret = 4,
  stack = 5,
  config = 6,
  custom_template = 7,
}
export enum RegistryType {
  quay = 1,
  azure = 2,
  custom = 3,
  gitlab = 4,
}
export enum Status {
  active = 1,
  inactive = 2,
}
export enum StackType {
  container = 1,
  swarm = 2,
  compose = 3,
}
export enum ResourceTypes {
  container = 'container',
  volume = 'volume',
  service = 'service',
  secret = 'secret',
  config = 'config',
  stack = 'stack',
}
