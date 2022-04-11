import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SequenceActivateDTO {
  /**
   * States from controller to match
   */
  @ApiProperty()
  @IsString({ each: true })
  public match: string[];

  /**
   * Normally a watcher must wait 1500 as a "cooling off" / "waiting for more states to match with to come in"
   *
   * - self: after activating, reset the progress of this particular activate event so it can re-activate immediately
   *
   * - sensor: reset ALL kunami activate watchers attached to this sensor as if that 1500 seconds happened immediately
   */
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  public reset?: 'self' | 'sensor';

  /**
   * entity_id
   */
  @ApiProperty()
  @IsString()
  public sensor: string;
}
