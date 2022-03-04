import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CanFake } from './can-fake.dto';
import { ACCESS_PERMISSION, PERMISSION_ACCESS_TYPES } from './constants';

export class AccessDTO extends CanFake {
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

  // #endregion Object Properties
}
