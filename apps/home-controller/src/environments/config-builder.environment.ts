import {
  ConfigBuilderService,
  MainCLIModule,
  PromptService,
} from '@ccontour/tty';
import { BootstrapOptions } from '@ccontour/utilities';

export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
  imports: [MainCLIModule],
  // nestNoopLogger: true,
  preInit: [
    async (app) => {
      const prompt = app.get(PromptService);
      prompt.clear();
      prompt.scriptHeader('Config Builder');
      const builder = app.get(ConfigBuilderService);
      await builder.handleConfig();
      process.exit();
    },
  ],
  prettyLog: true,
};
