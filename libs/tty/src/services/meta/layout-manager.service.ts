import { Injectable } from '@nestjs/common';
import { InjectConfig, START } from '@text-based/utilities';

import { HEADER_COLOR } from '../../config';
import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { BoxService } from '../render/box.service';
import { ThemeService } from './theme.service';

type LayoutCache = { footer: string; header: string };
const CORNERS = 2;

@Injectable()
export class LayoutManagerService {
  public stackHorizontal(boxes: BoxService[]): string {
    const out = boxes[START].render().split(`\n`);
    boxes.shift();
    boxes.forEach((item) => {
      const lines = item.render().split(`\n`);
      const max = ansiMaxLength(lines);
      out.forEach((i, index) => i + ansiPadEnd(lines[index] ?? '', max));
    });
    return out.join(`\n`);
  }
}
