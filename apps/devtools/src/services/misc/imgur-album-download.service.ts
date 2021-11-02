import { iRepl, OctIcons, Repl } from '@automagical/tty';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
} from '@automagical/utilities';
import chalk from 'chalk';
import execa from 'execa';
import { lstatSync, mkdirSync, readdirSync, renameSync } from 'fs';
import inquirer from 'inquirer';
import { join, resolve } from 'path';

import { ALBUM_DOWNLOAD_TARGET, ALBUM_PAD_SIZE } from '../../config';

/* eslint-disable @typescript-eslint/no-magic-numbers */

const SEPARATOR = ' - ';
@Repl({
  category: `Misc`,
  description: [
    `Download url zip from url to new folder`,
    `Extract`,
    `Update file name prefixes to be a consistent 4 digits`,
    `Update file ownership`,
  ],
  icon: OctIcons.desktop_download,
  name: `Yoink`,
})
export class ImgurAlbumDownloadService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    @InjectConfig(ALBUM_DOWNLOAD_TARGET) private readonly root: string,
    @InjectConfig(ALBUM_PAD_SIZE) private readonly padSize: number,
  ) {
    this.root = resolve(this.root);
  }

  public async exec(): Promise<void> {
    if (!this.root) {
      console.log(chalk.bold.red('ALBUM_DOWNLOAD_TARGET config not set'));
      return;
    }
    const { dirname, url, path } = await inquirer.prompt([
      {
        default: this.root,
        message: 'Base Path',
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
        message: 'Album URL',
        name: 'url',
      },
    ]);
    const destination = join(path, dirname);
    mkdirSync(destination, { recursive: true });
    const zip = join(destination, 'output.zip');

    this.logger.info(`Fetching zip`);
    await this.fetchService.download({
      destination: zip,
      rawUrl: true,
      url: `${url}/zip`,
    });
    this.logger.info(`Extracting`);
    await execa('unzip', [zip], { cwd: destination });
    await execa('rm', [zip], { cwd: destination });
    this.logger.info(`Processing files`);
    this.processDir(destination);
  }

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
    this.logger.info(`Completed processing ${files.length} files`);
  }

  private processImgur(DIR: string, file: string) {
    let number = file.split(SEPARATOR, 1)[0].toString();
    const orig = number;
    number = number.padStart(this.padSize, '0');
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
    number = number.padStart(this.padSize, '0');
    renameSync(
      join(DIR, file),
      join(DIR, file.replace(new RegExp(`^${orig}`, 'g'), `${number}`)),
    );
  }
}
