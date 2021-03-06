export enum HassEvents {
  state_changed = 'state_changed',
  hue_event = 'hue_event',
}

export enum HASSIO_WS_COMMAND {
  // Found a use for
  area_list = 'config/area_registry/list',
  auth = 'auth',
  call_service = 'call_service',
  device_list = 'config/device_registry/list',
  entity_list = 'config/entity_registry/list',
  entity_update = 'config/entity_registry/update',
  get_config = 'get_config',
  get_states = 'get_states',
  ping = 'ping',
  registry_get = 'config/entity_registry/get',
  render_template = 'render_template',
  search_related = 'search/related',
  subscribe_trigger = 'subscribe_trigger',
  subscribe_events = 'subscribe_events',
  // Haven't decided
  core_update = 'config/core/update',
  persistent_notification = 'persistent_notification/get',
  setup_info = 'integration/setup_info',
  system_health = 'system_health/info',
  trace_contexts = 'trace/contexts',
  unsubscribe_events = 'unsubscribe_events',
  // Don't see a use for
  analytics = 'analytics',
  auth_list = 'config/auth/list',
  cloud_status = 'cloud/status',
  current_user = 'auth/current_user',
  get_themes = 'frontend/get_themes',
  get_user_data = 'frontend/get_user_data',
  lovelace_config = 'lovelace/config',
  lovelace_resources = 'lovelace/resources',
  network = 'network',
  translations = 'frontend/get_translations',
}

export enum HassSocketMessageTypes {
  auth_required = 'auth_required',
  auth_ok = 'auth_ok',
  event = 'event',
  result = 'result',
  pong = 'pong',
  auth_invalid = 'auth_invalid',
}
