import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from '@automagical/validation';
import { createHash } from 'crypto';

export class UtilizationResponseDTO {
  // #region Public Static Methods

  public static VerifyHash(
    response: UtilizationResponseDTO,
    body: Record<string, unknown>,
  ) {
    const base64 = Buffer.from(JSON.stringify(body)).toString('base64');
    const md5 = createHash('md5').update(base64).digest('hex');
    return md5 === response.hash;
  }

  // #endregion Public Static Methods

  // #region Object Properties

  @IsBoolean()
  public vpat: boolean;
  @IsNumber()
  public apiServers: number;
  @IsNumber()
  public formManagers: number;
  @IsNumber()
  public pdfServers: number;
  @IsNumber()
  public projects: number;
  @IsNumber()
  public tenants: number;
  @IsString()
  @IsOptional()
  public hash?: string;

  // #endregion Object Properties
}
