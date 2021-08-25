import { YOINK_DEFAULT_PATH } from '@automagical/contracts/config';
import { iRepl } from '@automagical/contracts/tty';
import { Repl } from '@automagical/tty';
import { AutoConfigService, FetchService } from '@automagical/utilities';
import execa from 'execa';
import { lstatSync, mkdirSync, readdirSync, renameSync } from 'fs';
import inquirer from 'inquirer';
import { join } from 'path';

/* eslint-disable security/detect-non-literal-regexp */

const SEPARATOR = ' - ';
@Repl({
  description: [
    `Download url zip from url to new folder`,
    `Extract`,
    `Update file name prefixes to be a consistent 4 digits`,
    `Update file ownership`,
  ],
  name: 'Yoink',
})
export class YoinkService implements iRepl {
  // #region Constructors

  constructor(
    private readonly configService: AutoConfigService,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async exec(): Promise<void> {
    const { dirname, url, path } = await inquirer.prompt([
      {
        default: this.configService.get(YOINK_DEFAULT_PATH),
        message: 'Path',
        name: 'path',
        type: 'input',
      },
      {
        message: 'Destination Folder',
        name: 'dirname',
        type: 'input',
      },
      {
        input: 'input',
        message: 'Download URL',
        name: 'url',
      },
    ]);
    const destination = join(path, dirname);
    mkdirSync(join(destination, dirname), { recursive: true });
    const zip = join(destination, 'output.zip');
    await this.fetchService.download({
      destination: zip,
      rawUrl: true,
      url,
    });
    await execa('unzip', [zip], { cwd: destination });
    await execa('rm', [zip], { cwd: destination });
    this.processDir(destination);
  }

  // #endregion Public Methods

  // #region Private Methods

  private processDir(DIR: string) {
    const files = readdirSync(DIR);
    files.forEach((file) => {
      const directory = join(DIR, file);
      const isDirectory = lstatSync(directory).isDirectory();
      if (isDirectory) {
        this.processDir(directory);
        return;
      }
      if (!file.includes(' - ')) {
        this.processRaw(DIR, file);
        return;
      }
      this.processImgur(DIR, file);
    });
  }

  private processImgur(DIR: string, file: string) {
    let number = file.split(SEPARATOR, 1)[0].toString();
    const orig = number;
    number = number.padStart(4, '0');
    renameSync(
      join(DIR, file),
      join(
        DIR,
        file.replace(new RegExp(`^${orig}${SEPARATOR}`, 'g'), `${number} - `),
      ),
    );
  }

  private processRaw(DIR: string, file: string) {
    let number = file.split('.')[0].toString();
    const orig = number;
    number = number.padStart(4, '0');
    renameSync(
      join(DIR, file),
      join(DIR, file.replace(new RegExp(`^${orig}`, 'g'), `${number}`)),
    );
  }

  // #endregion Private Methods
}
