export enum HassEvents {
  state_changed = 'state_changed',
  hue_event = 'hue_event',
}

export enum HassDomains {
  switch = 'switch',
  light = 'light',
  mqtt = 'mqtt',
  sun = 'sun',
  sensor = 'sensor',
  weather = 'weather',
  climate = 'climate',
  person = 'person',
  automation = 'automation',
  group = 'group',
  scene = 'scene',
  binary_sensor = 'binary_sensor',
  media_player = 'media_player',
  zone = 'zone',
  device_tracker = 'device_tracker',
  remote = 'remote',
  persistentNotification = 'persistent_notification',
  fan = 'fan',
  lock = 'lock',
  notify = 'notify',
  configurator = 'configurator',
  homeassistant = 'homeassistant',
}

export enum HassCommands {
  subscribe_events = 'subscribe_events',
  auth = 'auth',
  call_service = 'call_service',
  area_list = 'config/area_registry/list',
  get_states = 'get_states',
  ping = 'ping',
}

export enum HassServices {
  toggle = 'toggle',
  turn_on = 'turn_on',
  turn_off = 'turn_off',
  publish = 'publish',
  set_speed = 'set_speed',
  lock = 'lock',
  update_entity = 'update_entity',
  unlock = 'unlock',
}

export enum HassSocketMessageTypes {
  auth_required = 'auth_required',
  auth_ok = 'auth_ok',
  event = 'event',
  result = 'result',
  pong = 'pong',
}
