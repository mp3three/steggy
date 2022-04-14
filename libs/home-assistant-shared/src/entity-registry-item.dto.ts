import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

import { LightCapabilities } from './entities';

export type CapabilityList = LightCapabilities | Record<string, unknown>;

export class EntityRegistryItemDTO<
  CAPABILITIES extends CapabilityList = Record<string, unknown>,
> {
  @IsString()
  @ApiProperty()
  public area_id: string;
  @IsObject()
  @ApiProperty()
  public capabilities: CAPABILITIES;
  @IsString()
  @ApiProperty()
  public config_entry_id: string;
  @IsString()
  @ApiProperty()
  public device_id: string;
  @IsString()
  @ApiProperty()
  public disabled_by: string;
  @IsString()
  @ApiProperty()
  public entity_id: string;
  @IsString()
  @ApiProperty()
  public icon: string;
  @IsString()
  @ApiProperty()
  public name: string;
  @IsString()
  @ApiProperty()
  public original_icon: string;
  @IsString()
  @ApiProperty()
  public original_name: string;
  @IsString()
  @ApiProperty()
  public platform: string;
  @IsString()
  @ApiProperty()
  public unique_id: string;
}
