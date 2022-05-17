import { DynamicModule } from '@nestjs/common';
import { LOGGER_LIBRARY } from '@steggy/boilerplate';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'upath';

import { CUSTOM_PROVIDERS } from '../decorators';
import { nativeRequire } from '../includes';

export const CustomCodeModule = (application: symbol): DynamicModule => {
  load(application);
  return {
    module: class {},
    providers: CUSTOM_PROVIDERS.map(provider => {
      provider[LOGGER_LIBRARY] = 'custom-code';
      return provider;
    }),
  };
};

function load(application: symbol) {
  const DATA_DIRS = [
    ...(process.env.XDG_DATA_DIRS ?? '/usr/local/share/:/usr/share/').split(
      ':',
    ),
    join(homedir(), '.local', 'share'),
  ];
  const LOADED_DATA_PATH = DATA_DIRS.find(path =>
    existsSync(join(path, application.description)),
  );
  if (!LOADED_DATA_PATH) {
    return;
  }
  // ! Go out and grab the path and run it BEFORE bootstrapping

  // eslint-disable-next-line security/detect-non-literal-require
  nativeRequire(LOADED_DATA_PATH);
}
