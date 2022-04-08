import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import {
  FormDTO,
  FormioFetchService,
  FormioSdkModule,
} from '@steggy/formio';
import {
  ApplicationManagerService,
  PromptService,
  QuickScript,
  ToMenuEntry,
} from '@steggy/tty';

/* eslint-disable @typescript-eslint/no-unused-vars */

@QuickScript({
  application: Symbol('form-migrations'),
  imports: [FormioSdkModule],
})
export class FormMigrator {
  constructor(
    @InjectConfig('SOURCE_PROJECT') private readonly sourceProject: string,
    @InjectConfig('TARGET_PROJECT') private readonly targetProject: string,
    @InjectConfig('SOURCE_API_KEY') private readonly sourceKey: string,
    @InjectConfig('TARGET_API_KEY') private readonly targetKey: string,
    private readonly app: ApplicationManagerService,
    private readonly fetchService: FormioFetchService,
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(): Promise<void> {
    this.app.setHeader('Form Migrations');

    const response = await this.promptService.menu({
      hideSearch: true,
      right: ToMenuEntry([
        ['List Forms on Source', 'list'],
        ['Migrate', 'migrate'],
      ]),
    });
    switch (response) {
      case 'list':
        await this.listSourceForms();
        return await this.exec();
      case 'migrate':
        return;
    }
  }

  private async listSourceForms(): Promise<void> {
    const forms = await this.fetchService.fetch<FormDTO[]>({
      apiKey: this.sourceKey,
      baseUrl: this.sourceProject,
      control: { limit: 10_000, select: ['name'] },
      url: `/form`,
    });
    if (!Array.isArray(forms)) {
      this.logger.error(
        `Did not return list of forms. Check source target / keys`,
      );
      return await this.promptService.acknowledge();
    }
    this.logger.info(`${forms.length} items`);
    forms.forEach(form => this.logger.info(`[${form.name}] {${form._id}}`));
    return await this.promptService.acknowledge();
  }

  private async migrateForm(form: FormDTO): Promise<void> {
    const destination = await this.fetchService.fetch<FormDTO>({
      apiKey: this.targetKey,
      baseUrl: this.targetProject,
      control: { select: ['name', 'updated'] },
      url: `/form/${form._id}`,
    });
    if (!destination?._id) {
      const { _id, created, modified, ...body } = form;
      await this.fetchService.fetch({
        apiKey: this.targetKey,
        baseUrl: this.targetProject,
        body,
        method: 'post',
        url: `/form`,
      });
      return;
    }
    await this.fetchService.fetch({
      apiKey: this.targetKey,
      baseUrl: this.targetProject,
      body: form,
      method: 'put',
      url: `/form/${form._id}`,
    });
  }
}
