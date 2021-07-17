import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import faker from 'faker';

import { CanFake } from '../../classes';
import { ACCESS_PERMISSION, PERMISSION_ACCESS_TYPES } from './constants';

export class AccessDTO extends CanFake {
  // #region Public Static Methods

  public static fake(): AccessDTO {
    return {
      ...super.fake(),
      roles: Array.from({ length: faker.datatype.number(5) }).map(() =>
        faker.datatype.uuid(),
      ),
      type: faker.random.arrayElement(Object.values(PERMISSION_ACCESS_TYPES)),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsEnum(PERMISSION_ACCESS_TYPES)
  @ApiProperty({
    enum: PERMISSION_ACCESS_TYPES,
  })
  public type: PERMISSION_ACCESS_TYPES;
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

  // #endregion Object Properties
}
