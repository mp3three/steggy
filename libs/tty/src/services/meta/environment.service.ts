import { Injectable } from '@nestjs/common';
import { is } from '@steggy/utilities';
import { isNumberString } from 'class-validator';
import execa from 'execa';
import { stdout } from 'process';

const DEFAULT_WIDTH = 150;
const DEFAULT_HEIGHT = 100;

@Injectable()
export class EnvironmentService {
  public async getDimensions(): Promise<Record<'height' | 'width', number>> {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    if (is.function(stdout.getWindowSize)) {
      const [width, height] = stdout.getWindowSize();
      return { height, width };
    }
    const lines = await execa('tput', ['lines']);
    const cols = await execa('tput', ['cols']);

    const height = isNumberString(lines.stdout)
      ? Number(lines.stdout)
      : DEFAULT_HEIGHT;
    const width = isNumberString(cols.stdout)
      ? Number(cols.stdout)
      : DEFAULT_WIDTH;

    return { height, width };
  }
}
