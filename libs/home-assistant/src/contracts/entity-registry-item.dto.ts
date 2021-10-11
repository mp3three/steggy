import { LightCapabilities } from './entities';

export type CapbilityList = LightCapabilities | Record<string, unknown>;

export class EntityRegistryItemDTO<
  CAPABILITIES extends CapbilityList = Record<string, unknown>,
> {
  public area_id: string;
  public capabilities: CAPABILITIES;
  public config_entry_id: string;
  public device_id: string;
  public disabled_by: string;
  public entity_id: string;
  public icon: string;
  public name: string;
  public original_icon: string;
  public original_name: string;
  public platform: string;
  public unique_id: string;
}
