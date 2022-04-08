import { Injectable } from '@nestjs/common';
import { EMPTY } from '@steggy/utilities';

@Injectable()
export class EnvironmentService {
  public getDimensions(): Record<'height' | 'width', number> {
    const [width, height] = process.stdout?.getWindowSize() || [EMPTY, EMPTY];
    return { height, width };
  }
}
