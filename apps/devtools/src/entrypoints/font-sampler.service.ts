import { QuickScript } from '@steggy/boilerplate';
import { PromptService, ScreenService, TTYModule } from '@steggy/tty';
import chalk from 'chalk';
import { Fonts, textSync } from 'figlet';

/* eslint-disable spellcheck/spell-checker */
const ALL_FONTS = [
  '3-D',
  '3D Diagonal',
  '3D-ASCII',
  'ANSI Regular',
  'ANSI Shadow',
  'Alphabet',
  'Banner',
  'Banner3-D',
  'Banner3',
  'Banner4',
  'Big Chief',
  'Big Money-ne',
  'Big Money-nw',
  'Big Money-se',
  'Big Money-sw',
  'Binary',
  'Bloody',
  'Calvin S',
  'Colossal',
  'Crawford',
  'Crawford2',
  'Crazy',
  'DOS Rebel',
  'Decimal',
  'Def Leppard',
  'Delta Corps Priest 1',
  'Digital',
  'Doh',
  'Doom',
  'Efti Font',
  'Electronic',
  'Elite',
  'Epic',
  'Fender',
  'Fire Font-k',
  'Fire Font-s',
  'Flower Power',
  'Fraktur',
  'Georgi16',
  'Georgia11',
  'Ghost',
  'Heart Left',
  'Heart Right',
  'Hex',
  'Impossible',
  'Isometric1',
  'Isometric2',
  'Isometric3',
  'Isometric4',
  'JS Block Letters',
  'Larry 3D 2',
  'Larry 3D',
  'Letters',
  'Lil Devil',
  'Line Blocks',
  'Marquee',
  'Merlin1',
  'Merlin2',
  'Mirror',
  'Modular',
  'Morse',
  'NScript',
  'NV Script',
  'Nancyj-Fancy',
  'Nancyj-Improved',
  'Nancyj-Underlined',
  'Nancyj',
  'O8',
  'Old Banner',
  'Poison',
  'Puffy',
  'Reverse',
  'Roman',
  'Rounded',
  'S Blood',
  'Santa Clara',
  'Script',
  'Slant Relief',
  'Slant',
  'Small Isometric1',
  'Small Slant',
  'Soft',
  'Speed',
  'Standard',
  'Star Wars',
  'Stick Letters',
  'Stop',
  'Sub-Zero',
  'Swamp Land',
  'Swan',
  'Sweet',
  'THIS',
  'Term',
  'The Edge',
  'Thick',
  'Thin',
  'Thorned',
  'Train',
  'Trek',
  'Tubular',
  'USA Flag',
  'Univers',
  'Varsity',
  'Wet Letter',
  'Whimsy',
] as Fonts[];

/**
 * Run through all the fonts that are reasonably readable (my subjective opinion), and print out a word
 *
 * If looking for alternate header fonts for TTY headers, this is a good way to run through the list of options
 */
@QuickScript({
  imports: [TTYModule],
})
export class FontSampler {
  constructor(
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
  ) {}

  protected async exec(): Promise<void> {
    const printWord = await this.promptService.string(
      `What word to print?`,
      'BaNAna',
    );
    ALL_FONTS.forEach(font => {
      this.screenService.print(chalk.magenta(font));
      this.screenService.print(chalk.cyan(textSync(printWord, font).trim()));
    });
  }
}
