import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class RelativeComparisonDTO {
  // public solar: string;
}

export class TimeRangeDTO {
  @IsOptional()
  @IsString({ each: true })
  /**
   * - 1-31
   * - 01-31
   * - Su-Sa
   * - Sun-Sat
   * - Sunday-Saturday
   */
  public days?: string[];
  @IsOptional()
  @ValidateNested()
  public from?: RelativeComparisonDTO;
  @IsOptional()
  @IsString({ each: true })
  /**
   * - 0-23
   * - 00-23
   */
  public hours?: string[];
  @IsOptional()
  @IsString({ each: true })
  /**
   * - 1-12
   * - 01-12
   * - Jan-Dec
   * - January-December
   */
  public month?: string[];
  @IsOptional()
  @ValidateNested()
  public to?: RelativeComparisonDTO;
}
