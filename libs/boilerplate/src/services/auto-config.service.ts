/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { deepExtend, INVERT_VALUE, is, START } from '@steggy/utilities';
import JSON from 'comment-json';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { decode, encode } from 'ini';
import yaml from 'js-yaml';
import minimist from 'minimist';
import { get, set } from 'object-path';
import { resolve } from 'path';

import { LIB_UTILS, LOG_LEVEL } from '../config';
import { ConfigItem, USE_THIS_CONFIG } from '../contracts';
import { AbstractConfig, ACTIVE_APPLICATION } from '../contracts/meta/config';
import { LibraryModule } from '../decorators';
import { AutoLogService } from './auto-log.service';
import { WorkspaceService } from './workspace.service';

const extensions = ['json', 'ini', 'yaml'];

@Injectable()
export class AutoConfigService {
  public static DEFAULTS = new Map<string, Record<string, unknown>>();
  public static NX_PROJECT?: string;
  protected static USE_SCANNER_ASSETS = false;

  constructor(
    private readonly logger: AutoLogService,
    @Inject(ACTIVE_APPLICATION) private readonly APPLICATION: symbol,
    @Optional()
    @Inject(USE_THIS_CONFIG)
    private readonly overrideConfig: AbstractConfig,
    private readonly workspace: WorkspaceService,
  ) {
    this.earlyInit();
  }

  public config: AbstractConfig = {};
  public configFiles: string[];
  public loadedConfigFiles: string[];
  private loadedConfigPath: string;
  private switches = minimist(process.argv);

  private get appName(): string {
    return this.APPLICATION.description;
  }

  public get<T extends unknown = string>(path: string | [symbol, string]): T {
    if (Array.isArray(path)) {
      path = ['libs', path[0].description, path[1]].join('.');
    }
    let value = get(this.config, path) ?? this.getConfiguration(path)?.default;
    const config = this.getConfiguration(path);
    if (config.warnDefault && value === config.default) {
      this.logger.warn(
        `Configuration property {${path}} is using default value`,
      );
    }
    switch (config.type) {
      case 'number':
        return Number(value) as T;
      case 'boolean':
        if (is.string(value)) {
          value = ['false', 'n'].includes(value.toLowerCase());
          return value as T;
        }
        return Boolean(value) as T;
    }
    return value as T;
  }

  public getDefault<T extends unknown = unknown>(path: string): T {
    const override = get(this.overrideConfig ?? {}, path);
    if (!is.undefined(override)) {
      return override;
    }
    const configuration = this.getConfiguration(path);
    if (!configuration) {
      this.logger.fatal(
        { path },
        `Unknown configuration. Double check {project.json} assets + make sure property is included in metadata`,
      );
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit();
    }
    return configuration.default as T;
  }

  public set(
    path: string | [symbol, string],
    value: unknown,
    write = false,
  ): void {
    if (Array.isArray(path)) {
      path = ['libs', path[0].description, path[1]].join('.');
    }
    set(this.config, path, value);
    if (write) {
      writeFileSync(this.loadedConfigPath, encode(this.config));
    }
  }

  private cast(data: string, type: string): unknown {
    switch (type) {
      case 'boolean':
        return (
          data.toLowerCase() === 'true' ||
          data.toLowerCase() === 'y' ||
          data === '1'
        );
      case 'number':
        return Number(data);
    }
    return data;
  }

  private earlyInit(): void {
    this.config = {};
    this.setDefaults();
    const fileConfig = this.loadFromFiles();
    fileConfig.forEach(config => deepExtend(this.config, config));
    deepExtend(this.config, this.overrideConfig ?? {});
    this.loadFromEnv();
    this.logger.setContext(LIB_UTILS, AutoConfigService);
    this.logger[
      'context'
    ] = `${LIB_UTILS.description}:${AutoConfigService.name}`;
    AutoLogService.logger.level = this.get([LIB_UTILS, LOG_LEVEL]);
    fileConfig.forEach((config, path) =>
      this.logger.info(`Loaded configuration from {${path}}`),
    );
  }

  private getConfiguration(path: string): ConfigItem {
    const { configs } = LibraryModule;
    const parts = path.split('.');
    if (parts.length === 1) {
      parts.unshift(this.appName);
    }
    if (parts.length === 2) {
      const metadata = configs.get(this.appName);
      const config = metadata.configuration[parts[1]];
      if (!is.empty(Object.keys(config ?? {}))) {
        return config;
      }
      const defaultValue = this.loadAppDefault(parts[1]) as string;
      return {
        // Applications can yolo a bit harder than libraries
        default: defaultValue,
        type: 'string',
        warnDefault: false,
      };
    }
    const [, library, property] = parts;
    const metadata = configs.get(library);
    if (!metadata) {
      throw new InternalServerErrorException(
        `Missing metadata asset for ${library} (via ${path})`,
      );
    }
    return metadata.configuration[property];
  }

  private loadAppDefault(property: string): unknown {
    const { env } = process;
    const result =
      env[property] ??
      env[property.toLowerCase()] ??
      this.switches[property] ??
      this.switches[property.toLowerCase()];
    return result;
  }

  private loadFromEnv(): void {
    const { env } = process;
    LibraryModule.configs.forEach(({ configuration }, project) => {
      configuration ??= {};
      const cleanedProject = (
        project ?? this.APPLICATION.description
      ).replaceAll('-', '_');
      const isApplication = this.APPLICATION.description === project;
      const environmentPrefix = isApplication
        ? 'application'
        : `libs_${cleanedProject}`;
      const configPrefix = isApplication
        ? 'application'
        : `libs.${cleanedProject}`;
      Object.keys(configuration).forEach(key => {
        const noAppPath = `${environmentPrefix}_${key}`;
        const fullPath = `${this.APPLICATION.description}__${noAppPath}`;
        const full = env[fullPath] ?? this.switches[fullPath];
        const noApp = env[noAppPath] ?? this.switches[noAppPath];
        const lazy =
          env[key] ?? this.switches[key] ?? this.switches[key.toLowerCase()];
        const configPath = `${configPrefix}.${key}`;
        if (!is.undefined(full)) {
          set(
            this.config,
            configPath,
            this.cast(noApp, configuration[key].type),
          );
          return;
        }
        if (!is.undefined(noApp)) {
          set(
            this.config,
            configPath,
            this.cast(noApp, configuration[key].type),
          );
          return;
        }
        if (!is.undefined(lazy)) {
          set(
            this.config,
            configPath,
            this.cast(lazy, configuration[key].type),
          );
        }
      });
    });
  }

  private loadFromFile(out: Map<string, AbstractConfig>, filePath: string) {
    if (!existsSync(filePath)) {
      return undefined;
    }
    this.loadedConfigPath = filePath;
    const fileContent = readFileSync(filePath, 'utf8').trim();
    this.loadedConfigFiles.push(filePath);
    const hasExtension = extensions.some(extension => {
      if (
        filePath.slice(extension.length * INVERT_VALUE).toLowerCase() ===
        extension
      ) {
        switch (extension) {
          case 'ini':
            out.set(filePath, decode(fileContent));
            return true;
          case 'yaml':
          case 'yml':
            out.set(filePath, yaml.load(fileContent));
            return true;
          case 'json':
            out.set(filePath, JSON.parse(fileContent) as AbstractConfig);
            return true;
        }
      }
      return false;
    });
    if (hasExtension) {
      return undefined;
    }
    // Guessing JSON
    if (fileContent[START] === '{') {
      out.set(filePath, JSON.parse(fileContent) as AbstractConfig);
      return true;
    }
    // Guessing yaml
    try {
      const content = yaml.load(fileContent);
      if (is.object(content)) {
        out.set(filePath, content);
        return true;
      }
    } catch {
      // Is not a yaml file
    }
    // Final fallback: INI
    out.set(filePath, decode(fileContent));
    return true;
  }

  private loadFromFiles(): Map<string, AbstractConfig> {
    this.configFiles = this.workspace.configFilePaths;
    if (this.switches['config']) {
      this.configFiles.push(resolve(this.switches['config']));
    }
    this.loadedConfigFiles = [];
    const out = new Map<string, AbstractConfig>();
    this.configFiles.forEach(filePath => {
      this.loadFromFile(out, filePath);
    });

    return out;
  }

  private setDefaults(): void {
    LibraryModule.configs.forEach(({ configuration }, project) => {
      const isApplication = this.appName === project;
      Object.keys(configuration).forEach(key => {
        if (!is.undefined(configuration[key].default)) {
          set(
            this.config,
            `${isApplication ? 'application' : `libs.${project}`}.${key}`,
            configuration[key].default,
          );
        }
      });
    });
  }
}
