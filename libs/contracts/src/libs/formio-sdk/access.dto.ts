import { CanFake } from '@automagical/contracts';
import { IsEnum, IsOptional, IsString } from '@automagical/validation';
import faker from 'faker';
import { AccessTypes, ACCESS_PERMISSION } from './constants';

export class AccessDTO extends CanFake {
  // #region Public Static Methods

  public static fake(): AccessDTO {
    return {
      ...super.fake(),
      type: faker.random.arrayElement(Object.values(AccessTypes)),
      roles: Array.from({ length: faker.datatype.number(5) }).map(() =>
        faker.datatype.uuid(),
      ),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsEnum(AccessTypes)
  public type: AccessTypes;
  @IsEnum(ACCESS_PERMISSION)
  @IsOptional()
  public permission?: ACCESS_PERMISSION;
  @IsString({
    each: true,
  })
  public roles: string[];

  // #endregion Object Properties
}
