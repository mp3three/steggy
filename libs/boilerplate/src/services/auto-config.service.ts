/* eslint-disable radar/no-identical-functions*/
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Optional,
} from '@nestjs/common';
import { deepExtend, is, LABEL, PAIR, SINGLE, VALUE } from '@steggy/utilities';
import { writeFileSync } from 'fs';
import { encode } from 'ini';
import minimist from 'minimist';
import { get, set } from 'object-path';
import { resolve } from 'path';
import { argv, env, exit } from 'process';

import { LIB_BOILERPLATE, LOG_LEVEL } from '../config';
import {
  AbstractConfig,
  ACTIVE_APPLICATION,
  CONFIG_DEFAULTS,
  ConfigItem,
  NO_USER_CONFIG,
} from '../contracts';
import { LibraryModule, MESSY_INJECTED_CONFIGS } from '../decorators';
import { AutoLogService } from './auto-log.service';
import { WorkspaceService } from './workspace.service';

/**
 * Configuration and environment variable management service.
 * Merges configurations from environment variables, file based configurations, and command line switches.
 *
 * This class should not be needed for most situations. The intended way to retrieve configurations is via DI w/ `@InjectConfig()`
 */
@Injectable()
export class AutoConfigService {
  constructor(
    /**
     * Override defaults provided by Bootstrap
     */
    @Inject(CONFIG_DEFAULTS)
    private readonly configDefaults: AbstractConfig,
    @Inject(ACTIVE_APPLICATION) private readonly APPLICATION: symbol,
    @Optional()
    @Inject(NO_USER_CONFIG)
    private readonly noUserConfig: boolean,
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
  ) {
    // AutoConfig is one of the first services to initialize
    // Running it here will force load the configuration at the earliest possible time
    //
    // Needs to happen ASAP in order to provide values for @InjectConfig, and any direct loading of this class to work as intended
    //
    this.earlyInit();
    AutoLogService.logger.level = this.get([LIB_BOILERPLATE, LOG_LEVEL]);
  }

  public configFiles: string[];
  public loadedConfigFiles: string[];
  private config: AbstractConfig = {};
  private loadedConfigPath: string;
  private switches = minimist(argv);

  private get appName(): string {
    return this.APPLICATION.description;
  }

  public get<T extends unknown = string>(path: string | [symbol, string]): T {
    if (Array.isArray(path)) {
      path =
        path[LABEL].description === this.APPLICATION.description
          ? ['application', path[VALUE]].join('.')
          : ['libs', path[LABEL].description, path[VALUE]].join('.');
    }
    const value =
      get(this.config, path) ?? this.getConfiguration(path)?.default;
    const config = this.getConfiguration(path);

    return this.cast(value, config.type) as T;
  }

  public getDefault<T extends unknown = unknown>(path: string): T | never {
    const override = get(this.configDefaults ?? {}, path);
    if (!is.undefined(override)) {
      return override;
    }
    const configuration = this.getConfiguration(path);
    if (!configuration) {
      this.logger.fatal(
        { path },
        `Unknown configuration. Double check {project.json} assets + make sure property is included in metadata`,
      );
      exit();
    }
    return configuration.default as T;
  }

  public set(
    path: string | [symbol, string],
    value: unknown,
    write = false,
  ): void {
    if (Array.isArray(path)) {
      path = ['libs', path[LABEL].description, path[VALUE]].join('.');
    }
    set(this.config, path, value);
    if (write) {
      writeFileSync(this.loadedConfigPath, encode(this.config));
    }
  }

  protected onPreInit(): void {
    this.sanityCheck();
  }

  private cast(data: string, type: string): unknown {
    switch (type) {
      case 'boolean':
        data ??= '';
        return is.boolean(data)
          ? data
          : ['true', 'y', '1'].includes(data.toLowerCase());
      case 'number':
        return Number(data);
      case 'string[]':
        if (is.undefined(data)) {
          return [];
        }
        if (Array.isArray(data)) {
          return data.map(String);
        }
        // This occurs with cli switches
        // If only 1 is passed, it'll get the value
        // ex: --foo=bar  ==== {foo:'bar'}
        // If duplicates are passed, will receive array
        // ex: --foo=bar --foo=baz === {foo:['bar','baz']}
        return [String(data)];
    }
    return data;
  }

  /**
   * Build up `this.config` with the fully resolved configuration data for this run.
   * Start with an empty object, and fill in values in descending order (later items replace earlier).
   *
   * - values provided via module definitions
   * - values provided via bootstrap
   * - values loaded from configuration files
   * - values loaded from environment variables
   * - values loaded from command line switches
   */
  private earlyInit(): void {
    this.config = {};
    this.setDefaults();
    deepExtend(this.config, this.configDefaults ?? {});
    this.logger.setContext(LIB_BOILERPLATE, AutoConfigService);
    this.logger['context'] = [
      LIB_BOILERPLATE.description,
      AutoConfigService.name,
    ].join(':');
    if (this.noUserConfig) {
      this.configFiles = [];
      return;
    }
    const [fileConfig, files] = this.workspace.loadMergedConfig(
      this.switches['config']
        ? [resolve(this.switches['config'])]
        : this.workspace.configFilePaths(this.appName),
    );
    this.configFiles = files;
    fileConfig.forEach(config => deepExtend(this.config, config));
    this.loadFromEnv();
    fileConfig.forEach((config, path) =>
      this.logger.debug(`Loaded configuration from {${path}}`),
    );
  }

  private getConfiguration(path: string): ConfigItem {
    const { configs } = LibraryModule;
    const parts = path.split('.');
    if (parts.length === SINGLE) {
      parts.unshift(this.appName);
    }
    if (parts.length === PAIR) {
      const metadata = configs.get(this.appName);
      const config =
        metadata.configuration[parts[VALUE]] ??
        MESSY_INJECTED_CONFIGS.get(parts[VALUE]);
      if (!is.empty(Object.keys(config ?? {}))) {
        return config;
      }
      const defaultValue = this.loadAppDefault(parts[VALUE]) as string;
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
    const result =
      env[property] ??
      env[property.toLowerCase()] ??
      this.switches[property] ??
      this.switches[property.toLowerCase()];
    return result;
  }

  /**
   * Merge in both environment variables, and command line switches. Both of these are operate under unique rules.
   * The "full name" of an environment variable is formatted like this:
   * - "[appName]__[path]_[to]_[property]"
   *
   * Where 2x underscores separate app name from property path, with single underscores replacing the dots for the object path.
   * Original logic for this is based off the `rc` library.
   *
   * This is super verbose, and a massive pain to use in the real world. This function allows for several other ways of providing the variable:
   *
   * - without app reference "[path]_[to]_[property]"
   * - minimum "[property]"
   *
   * The minimum option is the injected key the application / library uses (Ex: "MONGO" / "BASE_URL" / etc).
   * What it gains in easy readability it loses in precision, and the ability to potentially have conflicts between libraries.
   *
   * Configuration property names here attempt to snag anything that seems close to the correct thing.
   * They are treated as case insensitive, and dashes / underscores are both interchangable and optional.
   * The default suggestion will use the same case as provided in the original value.
   *
   * Pulling switches from argv operates on similar rules
   */
  private loadFromEnv(): void {
    const environmentKeys = Object.keys(env);
    const switchKeys = Object.keys(this.switches);
    const configs = LibraryModule.configs;
    configs.forEach(({ configuration }, project) => {
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
        const search = [
          `${this.APPLICATION.description}__${noAppPath}`,
          noAppPath,
          key,
        ];
        const configPath = `${configPrefix}.${key}`;
        // Find an applicable switch
        const flag =
          // Find an exact match (if available) first
          search.find(line => switchKeys.includes(line)) ||
          // Do case insensitive searches
          search.find(line => {
            const match = new RegExp(
              `^${line.replaceAll(new RegExp('[-_]', 'gi'), '[-_]?')}$`,
              'gi',
            );
            return switchKeys.some(item => item.match(match));
          });
        if (flag) {
          const formattedFlag = switchKeys.find(key =>
            search.some(line =>
              key.match(
                new RegExp(
                  `^${line.replaceAll(new RegExp('[-_]', 'gi'), '[-_]?')}$`,
                  'gi',
                ),
              ),
            ),
          );
          set(this.config, configPath, this.switches[formattedFlag]);
          return;
        }
        // Find an environment variable
        const environment =
          // Find an exact match (if available) first
          search.find(line => environmentKeys.includes(line)) ||
          // Do case insensitive searches
          search.find(line => {
            const match = new RegExp(
              `^${line.replaceAll(new RegExp('[-_]', 'gi'), '[-_]?')}$`,
              'gi',
            );
            return environmentKeys.some(item => item.match(match));
          });
        if (is.empty(environment)) {
          return;
        }
        const environmentName = environmentKeys.find(key =>
          search.some(line =>
            key.match(
              new RegExp(
                `^${line.replaceAll(new RegExp('[-_]', 'gi'), '[-_]?')}$`,
                'gi',
              ),
            ),
          ),
        );
        set(this.config, configPath, env[environmentName]);
      });
    });
  }

  private sanityCheck(): void | never {
    const configs = LibraryModule.configs;
    configs.forEach(({ configuration }, project) => {
      configuration ??= {};
      Object.entries(configuration).forEach(([name, definition]) => {
        // It's fine that this symbol isn't the same as the real one
        // Just going to get turned back into a string anyways
        const value = this.get([Symbol.for(project), name]);
        if (definition.warnDefault) {
          if (value === definition.default) {
            this.logger.warn(
              `[${project}] configuration {${name}} is using using the default value. This value should be overridden for best practices.`,
            );
          }
          return;
        }
        if (definition.required && is.undefined(value)) {
          this.logger.fatal(
            { ...definition },
            `Project [${project}] requires {${name}} to be provided`,
          );
          exit();
        }
      });
    });
  }

  private setDefaults(): void {
    LibraryModule.configs.forEach(({ configuration }, project) => {
      const isApplication = this.appName === project;
      Object.keys(configuration).forEach(key => {
        if (!is.undefined(configuration[key].default)) {
          let defaultValue = configuration[key].default;
          if (Array.isArray(defaultValue)) {
            defaultValue = [...defaultValue];
          } else
            defaultValue = is.object(defaultValue)
              ? { ...defaultValue }
              : defaultValue;
          set(
            this.config,
            `${isApplication ? 'application' : `libs.${project}`}.${key}`,
            defaultValue,
          );
        }
      });
    });
  }
}
