import { InternalServerErrorException } from '@nestjs/common';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
} from '@steggy/boilerplate';
import { FormDTO, SubmissionDTO } from '@steggy/formio';
import {
  ApplicationManagerService,
  PromptService,
  QuickScript,
  ToMenuEntry,
} from '@steggy/tty';
import { START } from '@steggy/utilities';
import { eachLimit } from 'async';
import execa from 'execa';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

type COLUMNS =
  | 'SubmissionId'
  | 'FormId'
  | 'Pat_DOB'
  | 'EMRNumber'
  | 'Pat_FirstName'
  | 'Pat_LastName';
type ROW = Record<COLUMNS, string>;
type TOKEN_RESPONSE = { key: string; token: string };
const DEFAULT_LIMIT = 3;
const REMOTE_TOKEN_HEADER = `x-remote-token`;

@QuickScript({
  OVERRIDE_DEFAULTS: {
    libs: {
      boilerplate: {
        // enable debug logs by default
        LOG_LEVEL: 'debug',
      },
    },
  },
  // controls name of config file
  application: Symbol('pdf-downloader'),
})
export class PDFDownloader {
  constructor(
    /**
     * Absolute file path to csv file
     */
    @InjectConfig('CSV_FILE') private readonly csvFile: string,
    /**
     * Number of simultaneous downloads
     */
    @InjectConfig('LIMIT') private readonly limit: number = DEFAULT_LIMIT,
    /**
     * Reference URL for portal, should contain project info but not a trailing slash
     *
     * @example https://azzly.form.io
     * @example https://api.form.io/azzly
     * @example https://api.form.io/project/{project_id}
     */
    @InjectConfig('BASE_URL') private readonly baseUrl: string,
    @InjectConfig('REMOTE_TOKEN') private readonly remoteToken: string,
    private readonly app: ApplicationManagerService,
    private readonly fetchService: FetchService,
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
  ) {}

  private forms = new Map<string, FormDTO>();
  private rows: ROW[];

  public async exec(): Promise<void> {
    this.app.setHeader('PDF Exporter');
    const response = await this.promptService.menu({
      hideSearch: true,
      right: ToMenuEntry([
        ['Print rows', 'print'],
        ['Process first row', 'first'],
        ['Process all', 'all'],
      ]),
    });
    switch (response) {
      case 'print':
        console.log(this.rows);
        await this.promptService.acknowledge();
        return;
      case 'first':
        await this.process(this.rows[START]);
        await this.promptService.acknowledge();
        return;
      case 'all':
        await eachLimit(
          this.rows,
          this.limit,
          async row => await this.process(row),
        );
        await this.promptService.acknowledge();
        return;
    }
  }

  protected onApplicationBootstrap(): void {
    const resolved = this.csvFile;
    if (!existsSync(resolved)) {
      throw new InternalServerErrorException(`No file at path: ${resolved}`);
    }
    const contents = readFileSync(resolved, 'utf8');
    const [header, ...rows] = contents.trim().split(`\n`);
    const headers = header.split(',').map(i => i.trim()) as COLUMNS[];
    this.rows = rows.map(i => {
      const cells = i.split(',').map(c => c.trim());
      return Object.fromEntries(
        headers.map((header, index) => [header, cells[index]]),
      ) as Record<COLUMNS, string>;
    });
  }

  private async process(row: ROW): Promise<void> {
    // * Add form to cache + pre-create destination folders based on form name
    if (!this.forms.has(row.FormId)) {
      this.logger.debug(`Loading form {${row.FormId}}`);
      const form = await this.fetchService.fetch<FormDTO>({
        baseUrl: this.baseUrl,
        headers: { [REMOTE_TOKEN_HEADER]: this.remoteToken },
        url: `/form/${row.FormId}`,
      });
      this.forms.set(row.FormId, form);
    }
    const form = this.forms.get(row.FormId);
    const folder = `${form._id} - ${form.name}`;
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }

    // * Generate a download token for the pdf
    const submissionUrl = `/form/${form._id}/submission/${row.SubmissionId}`;
    this.logger.debug(
      { submissionUrl },
      `Retrieving pdf download token for {${row.SubmissionId}}`,
    );
    const endpoint = `${submissionUrl}/download`;
    const token = await this.fetchService.fetch<TOKEN_RESPONSE>({
      baseUrl: this.baseUrl,
      headers: {
        [REMOTE_TOKEN_HEADER]: this.remoteToken,
        'x-allow': `GET:${endpoint}`,
      },
      url: `/token`,
    });

    this.logger.info(`Downloading PDF {${row.SubmissionId}}`);
    // * Retrieve the created date of the submission to use in file name
    const { created } = await this.fetchService.fetch<SubmissionDTO>({
      baseUrl: this.baseUrl,
      headers: { [REMOTE_TOKEN_HEADER]: this.remoteToken },
      url: submissionUrl,
    });
    const file = `${row.EMRNumber}-${row.Pat_LastName}-${row.Pat_FirstName}-${created}.pdf`;
    const url = `${this.baseUrl}${endpoint}?token=${token.key}&project=${form.project}`;
    this.logger.debug(url);
    // * Use a curl call to download the pdf and output to it's final destination in 1 step
    await execa(`curl`, [url, '-o', join(folder, file)]);
  }
}
