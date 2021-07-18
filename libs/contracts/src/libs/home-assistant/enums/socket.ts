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
  input_boolean = 'input_boolean',
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

export enum HASSIO_WS_COMMAND {
  // Normal use / already implemented
  subscribe_events = 'subscribe_events',
  auth = 'auth',
  call_service = 'call_service',
  area_list = 'config/area_registry/list',
  entity_list = 'config/entity_registry/list',
  device_list = 'config/device_registry/list',
  get_states = 'get_states',
  ping = 'ping',
  // Used by lovelace, but no use here (yet)
  get_themes = 'frontend/get_themes',
  current_user = 'auth/current_user',
  lovelace_config = 'lovelace/config',
  lovelace_resources = 'lovelace/resources',
  get_user_data = 'frontend/get_user_data',
  translations = 'frontend/get_translations',
  persistent_notification = 'persistent_notification/get',
  trace_contexts = 'trace/contexts',
  auth_list = 'config/auth/list',
  render_template = 'render_template',
  cloud_status = 'cloud/status',
  search_related = 'search/related',
  get_config = 'get_config',
  network = 'network',
  analytics = 'analytics',
  core_update = 'config/core/update',
  setup_info = 'integration/setup_info',
  system_health = 'system_health/info',
  unsubscribe_events = 'unsubscribe_events',
}

export enum HassSocketMessageTypes {
  auth_required = 'auth_required',
  auth_ok = 'auth_ok',
  event = 'event',
  result = 'result',
  pong = 'pong',
}

// export enum HassServices {
//   toggle = 'toggle',
//   turn_on = 'turn_on',
//   turn_off = 'turn_off',
//   publish = 'publish',
//   set_speed = 'set_speed',
//   lock = 'lock',
//   update_entity = 'update_entity',
//   unlock = 'unlock',
// }
