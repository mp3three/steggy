import { CanFake } from './Base.dto';
import faker from 'faker';
import { AccessTypes, ACCESS_PERMISSION } from './constants';
import { IsEnum, IsObjectId, IsOptional } from '@automagical/validation';

export class AccessDTO extends CanFake {
  // #region Public Static Methods

  public static fake(): AccessDTO {
    return {
      ...super.fake(),
      type: faker.random.arrayElement(Object.values(AccessTypes)),
      roles: Array(faker.datatype.number(5)).map(() => faker.random.uuid()),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsEnum(AccessTypes)
  public type: AccessTypes;
  @IsEnum(ACCESS_PERMISSION)
  @IsOptional()
  public permission?: ACCESS_PERMISSION;
  @IsObjectId({
    each: true,
  })
  public roles: string[];

  // #endregion Object Properties
}
