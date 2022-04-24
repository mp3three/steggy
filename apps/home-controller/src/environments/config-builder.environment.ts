// Proof of concept code
// Overlay the config builder on top of a different application
// Works great / 10

// import {
//   ConfigBuilderService,
//   TTYModule,
//   PromptService,
// } from '@steggy/tty';
// import { BootstrapOptions } from '@steggy/boilerplate';

// export const BOOTSTRAP_OPTIONS: BootstrapOptions = {
//   imports: [TTYModule],
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
