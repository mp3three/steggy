import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvironmentService {
  public getDimensions(): Record<'height' | 'width', number> {
    const [width, height] = process.stdout.getWindowSize();
    return { height, width };
  }
}
