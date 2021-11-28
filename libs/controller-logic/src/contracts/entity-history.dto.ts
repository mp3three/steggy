import { IsDate } from 'class-validator';

export class EntityHistoryRequest {
  @IsDate()
  public from: Date;
  @IsDate()
  public to: Date;
}
