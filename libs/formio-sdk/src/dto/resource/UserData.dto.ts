import { IsEmail, IsOptional, IsString } from '@automagical/validation';
import * as faker from 'faker';
import { CanFake } from '..';

/**
 * Example object
 *
 * ```json
 * {
 *   "_id": "60419fa631267050312037b7",
 *   "owner": "60419fa631267050312037b7",
 *   "roles": [
 *     "60244b43305a90f14e071729"
 *   ],
 *   "_vid": 0,
 *   "_fvid": 1,
 *   "state": "submitted",
 *   "data": {
 *     "fullName": "",
 *     "name": "automatedTests",
 *     "email": "automated-tests@form.io"
 *   },
 *   "access": [],
 *   "form": "60244b43305a901fd507172b",
 *   "project": "60244b43305a907f7d071727",
 *   "externalIds": [],
 *   "created": "2021-03-05T03:04:06.584Z",
 *   "modified": "2021-03-05T03:04:06.620Z"
 * }
 *```
 */
export class UserDataDTO extends CanFake {
  // #region Public Static Methods

  public static fake(): UserDataDTO {
    return {
      ...super.fake(),
      email: faker.internet.email(),
      fullName: faker.name.firstName(),
      password: faker.internet.password(),
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsEmail()
  public email: string;
  @IsString()
  public fullName: string;
  @IsString()
  @IsOptional()
  public password?: string;

  // #endregion Object Properties
}
