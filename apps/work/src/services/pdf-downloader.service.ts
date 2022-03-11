import { AutoLogService, InjectConfig } from '@automagical/boilerplate';
import { FormDTO, FormioFetchService } from '@automagical/formio';
import {
  ApplicationManagerService,
  DONE,
  IsDone,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@automagical/tty';
import { START } from '@automagical/utilities';
import { InternalServerErrorException } from '@nestjs/common';
import execa from 'execa';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { API_URL, LOAD_FILE } from '../config';

type COLUMNS =
  | 'SubmissionId'
  | 'FormId'
  | 'Pat_DOB'
  | 'EMRNumber'
  | 'Pat_FirstName'
  | 'Pat_LastName';
type ROW = Record<COLUMNS, string>;

@Repl({
  category: '',
  name: 'PDF Exporter',
})
export class PDFDownloader {
  constructor(
    @InjectConfig(LOAD_FILE) private readonly csvFile: string,
    @InjectConfig(API_URL) private readonly apiUrl: string,
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
    private readonly fetchService: FormioFetchService,
  ) {}

  private forms = new Map<string, FormDTO>();
  private rows: ROW[];

  public async exec(): Promise<void> {
    this.app.setHeader('PDF Exporter');
    const response = await this.promptService.menu({
      keyMap: { d: ['Done', DONE] },
      right: ToMenuEntry([
        ['Print rows', 'print'],
        ['Process first row', 'first'],
      ]),
    });
    if (IsDone(response)) {
      return;
    }
    switch (response) {
      case 'print':
        console.log(this.rows);
        await this.promptService.acknowledge();
        return await this.exec();
      case 'first':
        await this.process(this.rows[START]);
        await this.promptService.acknowledge();
        return await this.exec();
    }
  }

  protected onModuleInit(): void {
    if (!existsSync(this.csvFile)) {
      throw new InternalServerErrorException(
        `No file at path: ${this.csvFile}`,
      );
    }
    const contents = readFileSync(this.csvFile, 'utf8');
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
    if (!this.forms.has(row.FormId)) {
      this.logger.debug(`Loading form {${row.FormId}}`);
      this.forms.set(
        row.FormId,
        await this.fetchService.fetch<FormDTO>({
          url: `/form/${row.FormId}`,
        }),
      );
    }
    const form = this.forms.get(row.FormId);
    const folder = `${form._id} - ${form.name}`;
    if (!existsSync(folder)) {
      mkdirSync(folder);
    }
    this.logger.debug(
      `Retrieving pdf download token for {${row.SubmissionId}}`,
    );
    const endpoint = `/project/${form.project}/form/${form._id}/submission/${row.SubmissionId}/download`;
    const token = await this.fetchService.fetch<{ key: string; token: string }>(
      {
        headers: { 'x-allow': `GET:${endpoint}` },
        url: `/token`,
      },
    );
    this.logger.info(`Downloading PDF {${row.SubmissionId}}`);
    const file = `${row.EMRNumber}-${row.Pat_LastName}-${row.Pat_FirstName}.pdf`;
    await execa(`curl`, [
      `${this.apiUrl}${endpoint}?token=${token.key}`,
      '-o',
      join(folder, file),
    ]);
  }
}
