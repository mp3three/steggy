// Proof of concept code
// Overlay the config builder on top of a different application
// Works great / 10

// import {
//   ConfigBuilderService,
//   MainCLIModule,
//   PromptService,
// } from '@text-based/tty';
// import { BootstrapOptions } from '@text-based/utilities';

// export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
//   imports: [MainCLIModule],
//   // nestNoopLogger: true,
//   preInit: [
//     async (app) => {
//       const prompt = app.get(PromptService);
//       prompt.clear();
//       prompt.scriptHeader('Config Builder');
//       const builder = app.get(ConfigBuilderService);
//       await builder.handleConfig();
//       process.exit();
//     },
//   ],
//   prettyLog: true,
// };
