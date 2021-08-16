// doesn't seem to work as intended
import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import JSON from 'comment-json';

const path = join(
  homedir(),
  'Library',
  'Application Support',
  'Code',
  'User',
  'settings.json',
);
const userJson = JSON.parse(readFileSync(path, 'utf-8'));

const iconJson = JSON.parse(
  readFileSync(
    join(
      homedir(),
      'Library',
      'Application Support',
      'Code',
      'User',
      'settings.json',
    ),
    'utf-8',
  ),
);

writeFileSync(
  path,
  JSON.stringify(
    {
      ...userJson,
      'material-icon-theme.folders.associations':
        iconJson['material-icon-theme.folders.associations'],
      'material-icon-theme.files.associations':
        iconJson['material-icon-theme.files.associations'],
    },
    undefined,
    '  ',
  ),
);
