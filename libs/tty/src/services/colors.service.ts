/* This file is full of ported code */
/* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/no-nested-ternary */
import { Injectable } from '@nestjs/common';

type RGB = Record<'r' | 'g' | 'b', number>;
type HSV = Record<'h' | 's' | 'v', number>;
const clamp = (input: number, min: number, max: number) => {
  if (input < min) {
    return min;
  }
  return input > max ? max : input;
};

@Injectable()
export class ColorsService {
  public hexToRGB(hex: string): RGB {
    const split = hex.match(new RegExp('.{1,2}', 'g'));
    return {
      b: Number.parseInt(split[2], 16),
      g: Number.parseInt(split[1], 16),
      r: Number.parseInt(split[0], 16),
    };
  }

  /**
   * Reference code: https://gist.github.com/mjackson/5311256#gistcomment-2789005
   */
  public hsvToRGB({ h, s, v }: HSV): RGB {
    const hprime = h / 60;
    hprime.toString(2);
    const c = v * s;
    const x = c * (1 - Math.abs((hprime % 2) - 1));
    const m = v - c;
    let r, g, b;
    if (!hprime) {
      r = 0;
      g = 0;
      b = 0;
    }
    if (hprime >= 0 && hprime < 1) {
      r = c;
      g = x;
      b = 0;
    }
    if (hprime >= 1 && hprime < 2) {
      r = x;
      g = c;
      b = 0;
    }
    if (hprime >= 2 && hprime < 3) {
      r = 0;
      g = c;
      b = x;
    }
    if (hprime >= 3 && hprime < 4) {
      r = 0;
      g = x;
      b = c;
    }
    if (hprime >= 4 && hprime < 5) {
      r = x;
      g = 0;
      b = c;
    }
    if (hprime >= 5 && hprime < 6) {
      r = c;
      g = 0;
      b = x;
    }
    return {
      b: Math.round((b + m) * 255),
      g: Math.round((g + m) * 255),
      r: Math.round((r + m) * 255),
    };
  }

  /**
   * Reference code: https://gist.github.com/EDais/1ba1be0fe04eca66bbd588a6c9cbd666
   */
  public kelvinToRGB(kelvin: number): RGB {
    kelvin = clamp(kelvin, 1000, 40_000) / 100;
    const r =
      kelvin <= 66
        ? 255
        : clamp(
            329.698_727_446 * Math.pow(kelvin - 60, -0.133_204_759_2),
            0,
            255,
          );
    const g =
      kelvin <= 66
        ? clamp(99.470_802_586_1 * Math.log(kelvin) - 161.119_568_166_1, 0, 255)
        : clamp(
            288.122_169_528_3 * Math.pow(kelvin - 60, -0.075_514_849_2),
            0,
            255,
          );
    const b =
      kelvin >= 66
        ? 255
        : kelvin <= 19
        ? 0
        : clamp(
            138.517_731_223_1 * Math.log(kelvin - 10) - 305.044_792_730_7,
            0,
            255,
          );
    return { b, g, r };
  }

  public rgbToHEX({ r, b, g }: RGB): string {
    return r.toString(16) + b.toString(16) + g.toString(16);
  }

  /**
   * Reference code: https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L84
   */
  public rgbToHSV({ r, g, b }: RGB): HSV {
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    const d = max - min;
    if (max === min) {
      h = 0; // achromatic
    } else {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h,
      s: max == 0 ? 0 : d / max,
      v: max,
    };
  }
}
