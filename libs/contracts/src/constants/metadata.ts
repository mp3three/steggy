import dayjs from 'dayjs';

/**
 * For annotating the config properties with
 *
 * Expected value is array of application name symbols
 */
export const METADATA_DEFAULT_CONFIG = 'default-config';
export const METADATA_CACHE_KEY = (
  type: keyof typeof MetadataCacheItems,
): string => `METADATA:${type}:${dayjs().format('HH:mm')}`;
export enum MetadataCacheItems {
  HASS_EVENT_COUNT,
}
