import { Injectable } from '@nestjs/common';
import execa from 'execa';

@Injectable()
export class EnvironmentService {
  public async getDimensions(): Promise<Record<'height' | 'width', number>> {
    const { stdout: width } = await execa(`tput`, ['cols']);
    const { stdout: height } = await execa(`tput`, ['lines']);
    return {
      height: Number(height),
      width: Number(width),
    };
  }
}
