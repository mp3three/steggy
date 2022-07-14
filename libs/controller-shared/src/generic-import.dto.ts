import { IsOptional, IsString } from 'class-validator';

export class GenericImport {
  @IsString()
  @IsOptional()
  public friendlyName?: string;
  @IsString()
  @IsOptional()
  public import?: string;
}
