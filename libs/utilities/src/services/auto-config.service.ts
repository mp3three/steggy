/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Inject, Injectable, Optional } from '@nestjs/common';
import JSON from 'comment-json';
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { decode, encode } from 'ini';
import yaml from 'js-yaml';
import minimist from 'minimist';
import { get, set } from 'object-path';
import { join } from 'path';
import { cwd } from 'process';

import { LIB_UTILS, LOG_LEVEL } from '../config';
import {
  AutomagicalMetadataDTO,
  ConfigItem,
  METADATA_FILE,
  USE_THIS_CONFIG,
} from '../contracts';
import {
  ACTIVE_APPLICATION,
  AutomagicalConfig,
} from '../contracts/meta/config';
import { deepExtend } from '../includes';
import { AutoLogService } from './auto-log.service';
import { WorkspaceService } from './workspace.service';

const extensions = ['json', 'ini', 'yaml'];
const INVERSE = -1;
const START = 0;

@Injectable()
export class AutoConfigService {
  public static DEFAULTS = new Map<string, Record<string, unknown>>();
  protected static USE_SCANNER_ASSETS = false;

  constructor(
    private readonly logger: AutoLogService,
    @Inject(ACTIVE_APPLICATION) private readonly APPLICATION: symbol,
    @Optional()
    @Inject(USE_THIS_CONFIG)
    private readonly overrideConfig: AutomagicalConfig,
    private readonly workspace: WorkspaceService,
  ) {
    this.earlyInit();
  }

  public config: AutomagicalConfig = {};
  public configFiles: string[];
  public loadedConfigFiles: string[];
  private loadedConfigPath: string;
  private metadata = new Map<string, AutomagicalMetadataDTO>();
  private switches = minimist(process.argv);

  public get<T extends unknown = string>(path: string | [symbol, string]): T {
    if (Array.isArray(path)) {
      path = ['libs', path[0].description, path[1]].join('.');
    }
    const value = get(this.config, path, this.getDefault(path));
    const config = this.getConfiguration(path);
    if (config.warnDefault && value === config.default) {
      this.logger.warn(
        `Configuration property {${path}} is using default value`,
      );
    }
    return value as T;
  }

  public getDefault<T extends unknown = unknown>(path: string): T {
    const configuration = this.getConfiguration(path);
    if (!configuration) {
      this.logger.fatal(
        { path },
        `Unknown configuration. Double check project.json assets + make sure property is included in metadata`,
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
    this.loadMetadata();
    if (this.overrideConfig) {
      return this.useOverrideConfig();
    }
    this.config = {};
    this.setDefaults();
    const fileConfig = this.loadFromFiles();
    fileConfig.forEach((config) => deepExtend(this.config, config));
    this.loadFromEnv();
    this.logger.setContext(LIB_UTILS, AutoConfigService);
    this.logger[
      'context'
    ] = `${LIB_UTILS.description}:${AutoConfigService.name}`;
    AutoLogService.logger.level = this.get([LIB_UTILS, LOG_LEVEL]);
    fileConfig.forEach((config, path) =>
      this.logger.debug(`Loaded configuration from {${path}}`),
    );
  }

  private getConfiguration(path: string): ConfigItem {
    const parts = path.split('.');
    if (parts.length === 2) {
      const metadata = this.metadata.get(this.APPLICATION.description);
      return metadata.configuration[parts[1]];
    }
    const [, library, property] = parts;
    const metadata = this.metadata.get(library);
    return metadata.configuration[property];
  }

  private loadFromEnv(): void {
    const { env } = process;
    this.metadata.forEach(({ configuration }, project) => {
      configuration ??= {};
      const cleanedProject = project.replace(new RegExp('-', 'g'), '_');
      const isApplication = this.APPLICATION.description === project;
      const environmentPrefix = isApplication
        ? 'application'
        : `libs_${cleanedProject}`;
      const configPrefix = isApplication
        ? 'application'
        : `libs.${cleanedProject}`;
      Object.keys(configuration).forEach((key) => {
        const noAppPath = `${environmentPrefix}_${key}`;
        const fullPath = `${this.APPLICATION.description}__${noAppPath}`;
        const full = env[fullPath] ?? this.switches[fullPath];
        const noApp = env[noAppPath] ?? this.switches[noAppPath];
        const lazy = env[key] ?? this.switches[key];
        const configPath = `${configPrefix}.${key}`;
        if (typeof full !== 'undefined') {
          set(
            this.config,
            configPath,
            this.cast(noApp, configuration[key].type),
          );
          return;
        }
        if (typeof noApp !== 'undefined') {
          set(
            this.config,
            configPath,
            this.cast(noApp, configuration[key].type),
          );
          return;
        }
        if (typeof lazy !== 'undefined') {
          set(
            this.config,
            configPath,
            this.cast(lazy, configuration[key].type),
          );
        }
      });
    });
  }

  private loadFromFile(out: Map<string, AutomagicalConfig>, filePath: string) {
    if (!existsSync(filePath)) {
      return;
    }
    this.loadedConfigPath = filePath;
    const fileContent = readFileSync(filePath, 'utf-8').trim();
    this.loadedConfigFiles.push(filePath);
    const hasExtension = extensions.some((extension) => {
      if (
        filePath.slice(extension.length * INVERSE).toLowerCase() === extension
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
            out.set(filePath, JSON.parse(fileContent));
            return true;
        }
      }
      return false;
    });
    if (hasExtension) {
      return;
    }
    // Guessing JSON
    if (fileContent[START] === '{') {
      out.set(filePath, JSON.parse(fileContent));
      return true;
    }
    // Guessing yaml
    try {
      const content = yaml.load(fileContent);
      if (typeof content === 'object' && content !== null) {
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

  private loadFromFiles(): Map<string, AutomagicalConfig> {
    this.configFiles = this.workspace.configFilePaths;
    if (this.switches.config) {
      this.configFiles.push(this.switches.config);
    }
    this.loadedConfigFiles = [];
    const out = new Map<string, AutomagicalConfig>();
    this.configFiles.forEach((filePath) => {
      this.loadFromFile(out, filePath);
    });

    return out;
  }

  private loadMetadata() {
    const path = this.workspace.IS_DEVELOPMENT
      ? join(
          cwd(),
          'dist',
          AutoConfigService.USE_SCANNER_ASSETS ? 'config-scanner' : 'apps',
          this.APPLICATION.description,
          'assets',
        )
      : join(join(__dirname, 'assets'));
    const contents = readdirSync(path);
    contents.forEach((folder) => {
      const maybeFolder = join(path, folder);
      if (!lstatSync(maybeFolder).isDirectory()) {
        return;
      }
      const json = readFileSync(join(maybeFolder, METADATA_FILE), 'utf-8');
      this.metadata.set(folder, JSON.parse(json));
    });
  }

  private setDefaults(): void {
    this.metadata.forEach(({ configuration }, project) => {
      const isApplication = this.APPLICATION.description === project;
      Object.keys(configuration).forEach((key) => {
        if (typeof configuration[key].default !== 'undefined') {
          set(
            this.config,
            `${isApplication ? 'application' : `libs.${project}`}.${key}`,
            configuration[key].default,
          );
        }
      });
    });
  }

  private useOverrideConfig(): void {
    this.logger.setContext(LIB_UTILS, AutoConfigService);
    this.logger[
      'context'
    ] = `${LIB_UTILS.description}:${AutoConfigService.name}`;
    AutoLogService.logger.level = this.get([LIB_UTILS, LOG_LEVEL]);
    this.logger.warn(`Using override config`);
  }
}
