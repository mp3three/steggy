import { ApiProperty } from '@nestjs/swagger';
import { GenericVersionDTO } from '@steggy/boilerplate';

export class VersionResponse extends GenericVersionDTO {
  @ApiProperty()
  public application: string;
  @ApiProperty()
  public boot: number;
}
