import {
  ALGORITHM,
  DB_SECRET,
  DEFAULT_LICENSE_SERVER,
  LICENSE_SERVER,
} from '@automagical/config';
import { ProjectCRUD } from '@automagical/contracts';
import {
  BaseComponentDTO,
  BaseInputComponentDTO,
} from '@automagical/contracts/components';
import { LIB_PERSISTENCE } from '@automagical/contracts/constants';
import {
  FlattenedComponents,
  FormDTO,
  ProjectDTO,
  ProjectSettingsDTO,
  SubmissionDTO,
} from '@automagical/contracts/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Binary } from 'bson';
import { createCipher, createDecipher, randomBytes } from 'crypto';
import { PinoLogger } from 'nestjs-pino';
import { get, has, set } from 'object-path';

const SALT_LENGTH = 40;

@Injectable()
export class EncryptionService {
  // #region Constructors

  constructor(
    @InjectLogger(EncryptionService, LIB_PERSISTENCE)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => ProjectCRUD))
    private readonly projectService: ProjectCRUD,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public decrypt<T extends Record<never, unknown> = Record<string, unknown>>(
    cipherbuffer: Buffer | Binary,
    secret?: string,
  ): T {
    if (
      !cipherbuffer ||
      !(
        cipherbuffer instanceof Buffer ||
        typeof cipherbuffer.buffer !== undefined
      )
    ) {
      return cipherbuffer as unknown as T;
    }
    cipherbuffer = (
      Buffer.isBuffer(cipherbuffer) ? cipherbuffer : cipherbuffer.buffer
    ) as Buffer;
    secret ??= this.configService.get(DB_SECRET);
    const decipher = createDecipher(this.configService.get(ALGORITHM), secret);
    const decryptedJSON = Buffer.concat([
      decipher.update(cipherbuffer), // Buffer contains encrypted utf8
      decipher.final(),
    ]).toString();

    return JSON.parse(decryptedJSON.slice(0, -SALT_LENGTH));
  }

  @Trace()
  public encrypt(data: ProjectSettingsDTO, secret?: string): Buffer {
    if (!data) {
      return;
    }
    secret ??= this.configService.get(DB_SECRET);
    const cipher = createCipher(this.configService.get(ALGORITHM), secret);
    const salt = randomBytes(SALT_LENGTH)
      .toString('hex')
      .slice(0, Math.max(0, SALT_LENGTH));
    const saveValue = JSON.stringify(data) + salt;
    return Buffer.concat([cipher.update(saveValue), cipher.final()]);
  }

  @Trace()
  public setSubmissionEncryption<T extends SubmissionDTO = SubmissionDTO>(
    submission: T,
    form: FormDTO,
    project: ProjectDTO,
    state: boolean,
  ): T {
    project.settings ??= {};
    const secret = project.settings.secret ?? this.configService.get(DB_SECRET);
    const components = this.encryptedComponents(form);
    components.forEach(({ component, path, parent }) => {
      const pathParts = path.split('.');
      pathParts.pop();

      // Skip component if parent already encrypted.
      if (
        parent &&
        this.containerBasedComponent(parent) &&
        this.isEncryptedComponent(parent as BaseInputComponentDTO)
      ) {
        return;
      }

      // Handle array-based components.
      if (parent && this.arrayBasedComponent(parent)) {
        const current = get(submission.data, pathParts.join('.')) as Record<
          string,
          NodeJS.ArrayBufferView
        >[];

        set(
          submission.data,
          pathParts.join('.'),
          current.map((item) => {
            if (item[component.key]) {
              item[component.key] = this.setEncryption(
                item[component.key],
                state,
                secret,
              );
            }
          }),
        );
        return;
      }
      if (
        has(submission.data, path) &&
        this.isEncryptedComponent(component as BaseInputComponentDTO)
      ) {
        // Handle other components including Container, which is object-based.
        set(
          submission.data,
          path,
          this.setEncryption(get(submission.data, path), state, secret),
        );
      }
    });
    return submission;
  }

  // #endregion Public Methods

  // #region Private Methods

  private arrayBasedComponent(component: BaseComponentDTO) {
    return ['datagrid', 'editgrid'].includes(component.type);
  }

  private containerBasedComponent(component: BaseComponentDTO) {
    return (
      this.arrayBasedComponent(component) ||
      this.objectBasedComponent(component)
    );
  }

  private encryptedComponents(form: FormDTO): FlattenedComponents {
    const flatComponents = FormDTO.flattenComponents(form);
    const out = new Set<{
      path: string;
      component: BaseComponentDTO;
    }>();
    flatComponents.forEach((flattened) => {
      const component = flattened.component as BaseInputComponentDTO;
      if (this.isEncryptedComponent(component)) {
        out.add(flattened);
      }
    });
    return out;
  }

  private isEncryptedComponent(component: BaseInputComponentDTO) {
    return (
      component.encrypted &&
      (typeof component.persistent === 'undefined' || component.persistent)
    );
  }

  private objectBasedComponent(component: BaseComponentDTO) {
    return ['container'].includes(component.type);
  }

  private onModuleInit() {
    if (this.configService.get(LICENSE_SERVER) !== DEFAULT_LICENSE_SERVER) {
      this.logger.warn(`Modified license server detected`);
    }
  }

  private setEncryption(
    value: unknown,
    state: boolean,
    secret: string,
  ): NodeJS.ArrayBufferView {
    if (state) {
      return this.encrypt(value, secret);
    }
    return this.decrypt(value as Buffer, secret);
  }

  // #endregion Private Methods
}
