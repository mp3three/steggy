import { EMPTY } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvironmentService {
  public getDimensions(): Record<'height' | 'width', number> {
    const [width, height] = process.stdout?.getWindowSize() || [EMPTY, EMPTY];
    return { height, width };
  }
}
