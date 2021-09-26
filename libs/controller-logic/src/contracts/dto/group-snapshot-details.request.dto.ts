import { IsString } from 'class-validator';

export class GroupSnapshotDetailsDTO {
  @IsString()
  name: string;
}
