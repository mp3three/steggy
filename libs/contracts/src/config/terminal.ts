import { CreateConfigurableAnnotation } from '..';
import { APP_DASHBOARD, LIB_TERMINAL } from '../library-names';
import { FigletFonts } from '../libs/terminal/figlet';

const UsesConfig = CreateConfigurableAnnotation(LIB_TERMINAL.description);

export class TerminalConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {
      [APP_DASHBOARD.description]: 'available',
    },
    default: FigletFonts.DOS_Rebel,
    type: Object.values(FigletFonts),
  })
  public DEFAULT_HEADER_FONT?: FigletFonts;
  @UsesConfig({
    applications: {
      [APP_DASHBOARD.description]: 'available',
    },
    default: FigletFonts.DOS_Rebel,
    type: Object.values(FigletFonts),
  })
  public OUTPUT_HEADER_FONT?: FigletFonts;

  // #endregion Object Properties
}

export const DEFAULT_HEADER_FONT = `libs.${LIB_TERMINAL.description}.DEFAULT_HEADER_FONT`;
export const OUTPUT_HEADER_FONT = `libs.${LIB_TERMINAL.description}.OUTPUT_HEADER_FONT`;
