import { Injectable } from '@nestjs/common';
import { START } from '@text-based/utilities';

import { ansiMaxLength, ansiPadEnd } from '../../includes';
import { BoxService } from '../render/box.service';

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
