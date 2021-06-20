import { ApiProperty } from '@nestjs/swagger';

export class RemoteEnvironmentCheckDTO {
  // #region Object Properties

  /**
   * /apps/{app}/package.json
   */
  @ApiProperty()
  public appVersion: string;
  /**
   * /libs/contracts/package.json
   */
  @ApiProperty()
  public contractVersion: string;
  /**
   * Environment ID tied to the submission collection
   */
  @ApiProperty()
  public environmentId: string;
  /**
   * /package.json
   */
  @ApiProperty()
  public rootVersion: string;
  /**
   * Server iteration number
   */
  @ApiProperty()
  public version: string;
  /**
   * TODO: Why?
   */
  @ApiProperty({
    required: false,
  })
  public proxy?: boolean;

  // #endregion Object Properties
}
