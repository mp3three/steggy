import {
  AutoLogService,
  FetchService,
  InjectConfig,
  QuickScript,
} from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  TTYModule,
} from '@steggy/tty';
import { FIRST, SINGLE } from '@steggy/utilities';
import execa from 'execa';
import { lstatSync, mkdirSync, readdirSync, renameSync } from 'fs';
import { join, normalize } from 'path';

const SEPARATOR = ' - ';
const DEFAULT_PAD_SIZE = 4;

@QuickScript({
  application: Symbol('album-download'),
  imports: [TTYModule],
})
export class ImgurAlbumDownloadService {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
    private readonly fetchService: FetchService,
    @InjectConfig('ALBUM_DOWNLOAD_TARGET')
    private readonly root: string = '~/Downloads',
    @InjectConfig('ALBUM_PAD_SIZE')
    private readonly padSize: number = DEFAULT_PAD_SIZE,
  ) {
    this.root = normalize(this.root);
  }

  public async exec(): Promise<void> {
    this.app.setHeader('Album Downloader');
    const dirname = await this.promptService.string('Base Path', this.root);
    const path = await this.promptService.string('Destination folder');
    const url = await this.promptService.string('Album URL');

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
    files.forEach(file => {
      const directory = join(DIR, file);
      const isDirectory = lstatSync(directory).isDirectory();
      if (isDirectory) {
        this.processDir(directory);
        return;
      }
      if (!file.includes(SEPARATOR)) {
        this.processRaw(DIR, file);
        return;
      }
      this.processImgur(DIR, file);
    });
    this.logger.info(`Completed processing ${files.length} files`);
  }

  private processImgur(DIR: string, file: string) {
    let number = file.split(SEPARATOR, SINGLE)[FIRST].toString();
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
    let number = file.split('.')[FIRST].toString();
    const orig = number;
    number = number.padStart(this.padSize, '0');
    renameSync(
      join(DIR, file),
      join(DIR, file.replace(new RegExp(`^${orig}`, 'g'), `${number}`)),
    );
  }
}
