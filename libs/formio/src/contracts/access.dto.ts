import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ACCESS_PERMISSION, PERMISSION_ACCESS_TYPES } from './constants';

export class AccessDTO {
  @IsEnum(ACCESS_PERMISSION)
  @IsOptional()
  @ApiProperty({
    enum: ACCESS_PERMISSION,
  })
  public permission?: ACCESS_PERMISSION;
  @IsString({
    each: true,
  })
  @ApiProperty({
    items: {
      type: 'string',
    },
  })
  public roles: string[];
  @IsEnum(PERMISSION_ACCESS_TYPES)
  @ApiProperty({
    enum: PERMISSION_ACCESS_TYPES,
  })
  public type: PERMISSION_ACCESS_TYPES;

  
}
