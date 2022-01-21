import { IsString } from 'class-validator';

export class RelatedDescriptionDTO {
  @IsString({ each: true })
  public area: string[];
  @IsString({ each: true })
  public config_entry: string[];
  @IsString({ each: true })
  public device?: string[];
  @IsString({ each: true })
  public entity: string[];
}
