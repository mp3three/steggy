import { colors } from '@blessed/themes/themes/Solarized-Light';

const {
  primary: { background, foreground },
  normal: { red, green, blue, yellow, magenta, cyan },
} = colors;

export const BLESSED_COLORS = {
  colors,
  header: {
    border: {
      bg: background,
      fg: foreground,
      type: 'line',
    },
    style: {
      bg: background,
      fg: red,
    },
  },
  // this is for inline usage of theme colors for text and labels
  program: {
    bg: background,
    fg: foreground,
  },
};
