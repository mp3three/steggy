import { DynamicModule } from '@nestjs/common';
import { LOGGER_LIBRARY } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'upath';

import { nativeRequire } from '../includes';

export const CustomCodeModule = (application: symbol): DynamicModule => {
  load(application);
  return {
    imports: [],
    module: class {},
    providers: global.CUSTOM_PROVIDERS.map(provider => {
      provider[LOGGER_LIBRARY] = 'custom-code';
      return provider;
    }),
  };
};

// ? Deliberately using environment variables here
// This code is intended to be run prior to bootstrapping
// The general config loader is not available at this time

function load(application: symbol) {
  // ? Referencing this document
  // - https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
  const DATA_DIRS = [
    ...(process.env.XDG_DATA_DIRS ?? '/usr/local/share/:/usr/share/')
      .split(':')
      .map(i => join(i, application.description)),
    join(__dirname, 'custom-code'),
    join(homedir(), '.local', 'share', application.description),
  ];
  if (!is.empty(process.env.XDG_DATA_HOME)) {
    DATA_DIRS.push(join(process.env.XDG_DATA_HOME, application.description));
  }
  const LOADED_DATA_PATH = DATA_DIRS.find(path => existsSync(path));
  if (is.empty(LOADED_DATA_PATH)) {
    return;
  }
  // Yolo require
  // Webpack isn't getting involved, and who knows what might happen after this point
  nativeRequire(LOADED_DATA_PATH);
}
