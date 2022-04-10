/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/devtools/src/entrypoints/build-pipeline.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BuildPipelineService = void 0;
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const tty_1 = __webpack_require__("./libs/tty/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const execa_1 = __importDefault(__webpack_require__("execa"));
const fs_1 = __webpack_require__("fs");
const path_1 = __webpack_require__("path");
const semver_1 = __webpack_require__("semver");
/**
 * Basic build pipeline.
 * Assume that all the affected packages need a patch version bump, and to be re-published
 */
let BuildPipelineService = class BuildPipelineService {
    dryRun;
    parallel;
    logger;
    constructor(dryRun = false, parallel = utilities_1.SINGLE, logger) {
        this.dryRun = dryRun;
        this.parallel = parallel;
        this.logger = logger;
    }
    async exec() {
        const affected = await this.listAffected();
        if (this.dryRun) {
            this.logger.info({ affected });
            return;
        }
        // Bump relevant package.json versions
        this.bump(affected);
        this.logger.info(`Publishing NPM Packages`);
        const publish = (0, execa_1.default)(`npx`, [
            `nx`,
            `affected`,
            `--target=publish`,
            `--parallel=${this.parallel}`,
        ]);
        publish.stdout.pipe(process.stdout);
        await publish;
        this.logger.info(`Publishing Docker Images`);
        const buildDocker = (0, execa_1.default)(`npx`, [
            `nx`,
            `affected`,
            `--target=build-docker`,
            `--parallel=${this.parallel}`,
        ]);
        buildDocker.stdout.pipe(process.stdout);
        await buildDocker;
    }
    bump(affected) {
        affected.libs.forEach(library => {
            this.logger.info(`Bumping {${library}}`);
            const file = (0, path_1.join)('libs', library, 'package.json');
            const packageJSON = JSON.parse((0, fs_1.readFileSync)(file, 'utf8'));
            packageJSON.version = (0, semver_1.inc)(packageJSON.version, 'patch');
            (0, fs_1.writeFileSync)(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
        });
        affected.apps.forEach(application => {
            this.logger.info(`Bumping {${application}}`);
            const file = (0, path_1.join)('apps', application, 'package.json');
            if (!(0, fs_1.existsSync)(file)) {
                return;
            }
            const packageJSON = JSON.parse((0, fs_1.readFileSync)(file, 'utf8'));
            if (!utilities_1.is.string(packageJSON.version)) {
                return;
            }
            packageJSON.version = (0, semver_1.inc)(packageJSON.version, 'patch');
            (0, fs_1.writeFileSync)(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
        });
    }
    async listAffected() {
        const rawApps = await (0, execa_1.default)(`npx`, ['nx', 'affected:apps', '--plain']);
        const rawLibs = await (0, execa_1.default)(`npx`, ['nx', 'affected:libs', '--plain']);
        const libs = rawLibs.stdout.split(' ');
        const apps = rawApps.stdout.split(' ');
        return {
            apps,
            libs,
        };
    }
};
BuildPipelineService = __decorate([
    (0, tty_1.QuickScript)({
        application: Symbol('build-pipeline'),
    }),
    __param(0, (0, boilerplate_1.InjectConfig)('DRY')),
    __param(1, (0, boilerplate_1.InjectConfig)('PARALLEL')),
    __metadata("design:paramtypes", [Boolean, Number, typeof (_a = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _a : Object])
], BuildPipelineService);
exports.BuildPipelineService = BuildPipelineService;


/***/ }),

/***/ "./libs/boilerplate/src/config.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FORCE_APP_PATH = exports.LIB_UTILS = exports.REDIS_DEFAULT_TTL = exports.REDIS_PORT = exports.REDIS_HOST = exports.CACHE_PROVIDER = exports.LOG_LEVEL = void 0;
exports.LOG_LEVEL = 'LOG_LEVEL';
exports.CACHE_PROVIDER = 'CACHE_PROVIDER';
exports.REDIS_HOST = 'REDIS_HOST';
exports.REDIS_PORT = 'REDIS_PORT';
exports.REDIS_DEFAULT_TTL = 'REDIS_DEFAULT_TTL';
exports.LIB_UTILS = Symbol('boilerplate');
exports.FORCE_APP_PATH = Symbol('FORCE_APP_PATH');


/***/ }),

/***/ "./libs/boilerplate/src/contracts/aws/eb-application.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EBApplicationDTO = void 0;
class Rule {
    DeletedSourceFromS3;
    Enabled;
    MaxCount;
}
class EBApplicationDTO {
    ApplicationArn;
    ApplicationName;
    DateCreated;
    DateUpdated;
    ResourceLifecycleConfig;
    Versions;
}
exports.EBApplicationDTO = EBApplicationDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/aws/eb-environment.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EBEnvironmentDTO = void 0;
class EBEnvironmentDTO {
    AbortableOperationInProgress;
    ApplicationName;
    CNAME;
    DateCreated;
    DateUpdated;
    EndpointURL;
    EnvironmentArn;
    EnvironmentId;
    EnvironmentLinks;
    EnvironmentName;
    Health;
    PlatformArn;
    SolutionStackName;
    Status;
    Tier;
    VersionLabel;
}
exports.EBEnvironmentDTO = EBEnvironmentDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/aws/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/aws/eb-application.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/aws/eb-environment.dto.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/contracts/config.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigTypeDTO = exports.USE_THIS_CONFIG = exports.CONSUMES_CONFIG = void 0;
exports.CONSUMES_CONFIG = Symbol('CONSUMES_CONFIG');
exports.USE_THIS_CONFIG = Symbol('USE_THIS_CONFIG');
class ConfigTypeDTO {
    default;
    library;
    metadata;
    property;
}
exports.ConfigTypeDTO = ConfigTypeDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/email.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NunjucksRenderDTO = void 0;
class NunjucksRenderDTO {
    bcc;
    cc;
    from;
    html;
    messageTransport;
    subject;
    to;
    transport;
}
exports.NunjucksRenderDTO = NunjucksRenderDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/generic-version.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GenericVersionDTO = void 0;
class GenericVersionDTO {
    projects;
    rootVersion;
    version;
}
exports.GenericVersionDTO = GenericVersionDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/aws/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/config.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/email.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/generic-version.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/interfaces/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/lifecycle.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/logger/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/meta/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/nx-workspace.dto.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/contracts/interfaces/i-logger.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/boilerplate/src/contracts/interfaces/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/interfaces/i-logger.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/contracts/lifecycle.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/boilerplate/src/contracts/logger/constants.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DESCRIPTOR = exports.MISSING_CONTEXT = exports.WARNING_LOG = exports.DEBUG_LOG = exports.TRACE_LOG = exports.LOG_CONTEXT = exports.LOGGER_LIBRARY = void 0;
exports.LOGGER_LIBRARY = Symbol('LOGGER_LIBRARY');
exports.LOG_CONTEXT = Symbol('LOG_CONTEXT');
exports.TRACE_LOG = Symbol('TRACE_LOG');
exports.DEBUG_LOG = Symbol('DEBUG_LOG');
exports.WARNING_LOG = Symbol('WARNING_LOG');
exports.MISSING_CONTEXT = 'MISSING CONTEXT';
exports.DESCRIPTOR = Symbol('DESCRIPTOR');


/***/ }),

/***/ "./libs/boilerplate/src/contracts/logger/debug-log.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DebugLogDTO = void 0;
class DebugLogDTO {
    includeReturn;
    message;
}
exports.DebugLogDTO = DebugLogDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/logger/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/logger/constants.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/logger/debug-log.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/logger/trace-log.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/logger/warning-log.dto.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/contracts/logger/trace-log.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TraceLogDTO = void 0;
class TraceLogDTO {
    message;
}
exports.TraceLogDTO = TraceLogDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/logger/warning-log.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WarningLogDTO = void 0;
class WarningLogDTO {
    message;
}
exports.WarningLogDTO = WarningLogDTO;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/meta/config/index.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ACTIVE_APPLICATION = exports.AbstractConfig = void 0;
/**
 * Top level configuration object
 *
 * Extends the global common config, adding a section for the top level application to chuck in data without affecting things
 * Also provides dedicated sections for libraries to store their own configuration options
 */
class AbstractConfig {
    PRINT_CONFIG_AT_STARTUP;
    application;
    libs;
    config;
    configs;
}
exports.AbstractConfig = AbstractConfig;
exports.ACTIVE_APPLICATION = Symbol('ACTIVE_APPLICATION');


/***/ }),

/***/ "./libs/boilerplate/src/contracts/meta/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/meta/config/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/meta/meta/index.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/contracts/meta/meta/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IS_MODULE = void 0;
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/meta/meta/metadata.schema.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/meta/meta/package.schema.ts"), exports);
exports.IS_MODULE = Symbol('IS_MODULE');


/***/ }),

/***/ "./libs/boilerplate/src/contracts/meta/meta/metadata.schema.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StringArrayConfig = exports.RecordConfig = exports.UrlConfig = exports.PasswordConfig = exports.NumberConfig = exports.InternalConfig = exports.BooleanConfig = exports.StringConfig = exports.RepoMetadataDTO = void 0;
// JSON schema at schemas/json/metadata.schema.json
class RepoMetadataDTO {
    configuration;
}
exports.RepoMetadataDTO = RepoMetadataDTO;
class WarnDefault {
    careful;
    required;
    warnDefault;
}
class StringConfig extends WarnDefault {
    default;
    enum;
    type;
}
exports.StringConfig = StringConfig;
class BooleanConfig extends WarnDefault {
    default;
    type;
}
exports.BooleanConfig = BooleanConfig;
class InternalConfig extends WarnDefault {
    default;
    type;
}
exports.InternalConfig = InternalConfig;
class NumberConfig extends WarnDefault {
    default;
    type;
}
exports.NumberConfig = NumberConfig;
class PasswordConfig extends WarnDefault {
    type;
}
exports.PasswordConfig = PasswordConfig;
class UrlConfig extends WarnDefault {
    default;
    type;
}
exports.UrlConfig = UrlConfig;
class RecordConfig extends WarnDefault {
    type;
}
exports.RecordConfig = RecordConfig;
class StringArrayConfig extends WarnDefault {
    type;
}
exports.StringArrayConfig = StringArrayConfig;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/meta/meta/package.schema.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PACKAGE_FILE = exports.PackageJsonDTO = void 0;
class PackageJsonDTO {
    description;
    displayName;
    name;
    version;
}
exports.PackageJsonDTO = PackageJsonDTO;
exports.PACKAGE_FILE = `package.json`;


/***/ }),

/***/ "./libs/boilerplate/src/contracts/nx-workspace.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NXMetadata = exports.SCAN_CONFIG_CONFIGURATION = exports.NX_WORKSPACE_FILE = exports.NXWorkspaceDTO = exports.NXApplicationOptions = exports.NXProjectTarget = exports.NXProjectDTO = void 0;
class NXProjectDTO {
    projectType;
    root;
    sourceRoot;
    targets;
}
exports.NXProjectDTO = NXProjectDTO;
class NXProjectTarget {
    configurations;
    executor;
    options;
}
exports.NXProjectTarget = NXProjectTarget;
class NXApplicationOptions {
    extractLicenses;
    fileReplacements;
    generatePackageJson;
    inspect;
    main;
    optimization;
    outputPath;
    tsConfig;
}
exports.NXApplicationOptions = NXApplicationOptions;
class NXWorkspaceDTO {
    projects;
}
exports.NXWorkspaceDTO = NXWorkspaceDTO;
exports.NX_WORKSPACE_FILE = 'workspace.json';
exports.SCAN_CONFIG_CONFIGURATION = 'scan-config';
class NXMetadata {
    affected;
    implicitDependencies;
    npmScope;
    projects;
    targetDependencies;
    taskRunnerOptions;
    workspaceLayout;
}
exports.NXMetadata = NXMetadata;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/application-module.decorator.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationModule = void 0;
const eventemitter3_1 = __importDefault(__webpack_require__("eventemitter3"));
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
const constants_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/constants.ts");
const config_1 = __webpack_require__("./libs/boilerplate/src/contracts/meta/config/index.ts");
const includes_1 = __webpack_require__("./libs/boilerplate/src/includes/index.ts");
const modules_1 = __webpack_require__("./libs/boilerplate/src/modules/index.ts");
const library_module_decorator_1 = __webpack_require__("./libs/boilerplate/src/decorators/library-module.decorator.ts");
let useThisConfig;
/**
 * Intended to extend on the logic of nest's `@Controller` annotation.
 * This annotation will replace that one, and is intended for modules living in the apps folder.
 */
function ApplicationModule(metadata) {
    const propertiesKeys = Object.keys(metadata);
    metadata.imports ??= [];
    metadata.providers ??= [];
    metadata.globals ??= [];
    metadata.controllers ??= [];
    [...metadata.providers, ...metadata.controllers].forEach(provider => {
        provider[constants_1.LOGGER_LIBRARY] = metadata.application.description;
    });
    const GLOBAL_SYMBOLS = [
        {
            provide: config_1.ACTIVE_APPLICATION,
            useValue: metadata.application,
        },
        {
            provide: eventemitter3_1.default,
            useFactory() {
                return new eventemitter3_1.default();
            },
        },
        ...metadata.globals,
    ];
    if (useThisConfig) {
        GLOBAL_SYMBOLS.push({
            provide: contracts_1.USE_THIS_CONFIG,
            useValue: useThisConfig,
        });
    }
    metadata.imports = [
        modules_1.UtilitiesModule.forRoot(),
        {
            exports: GLOBAL_SYMBOLS,
            global: true,
            module: class {
            },
            providers: GLOBAL_SYMBOLS,
        },
        (0, includes_1.RegisterCache)(),
        ...metadata.imports,
    ];
    library_module_decorator_1.LibraryModule.configs.set(metadata.application.description, {
        configuration: metadata.configuration ?? {},
    });
    return target => {
        target[constants_1.LOGGER_LIBRARY] = metadata.application.description;
        propertiesKeys.forEach(property => {
            Reflect.defineMetadata(property, metadata[property], target);
        });
        return target;
    };
}
exports.ApplicationModule = ApplicationModule;
ApplicationModule.useThisConfig = function (config) {
    useThisConfig = config;
};


/***/ }),

/***/ "./libs/boilerplate/src/decorators/cast-result.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CastResult = void 0;
const class_transformer_1 = __webpack_require__("class-transformer");
/**
 * Force the return result of the annotated function into the indicated type
 * If return result is an array, map all items to type
 *
 * Primarily used for forcing object ids to strings
 */
function CastResult(dto, { record } = {}) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = async function (...parameters) {
            const result = await Reflect.apply(original, this, parameters);
            if (!result) {
                return result;
            }
            if (record) {
                return Object.fromEntries(Object.entries(result).map(([key, value]) => [
                    key,
                    (0, class_transformer_1.plainToInstance)(dto, value),
                ]));
            }
            if (Array.isArray(result)) {
                return result.map(item => {
                    if (item._id) {
                        item._id = item._id.toString();
                    }
                    return (0, class_transformer_1.plainToInstance)(dto, item);
                });
            }
            if (result._id) {
                result._id = result._id.toString();
            }
            return (0, class_transformer_1.plainToInstance)(dto, result);
        };
        return descriptor;
    };
}
exports.CastResult = CastResult;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/emit-after.decorator.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EmitAfter = void 0;
function EmitAfter(eventName, { emitData, onlyTruthyResults } = {}) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...parameters) {
            const out = Reflect.apply(original, this, parameters);
            process.nextTick(async () => {
                const result = await out;
                let data;
                if (onlyTruthyResults && !result) {
                    return;
                }
                if (emitData === 'result') {
                    data = result;
                }
                if (emitData === 'parameters') {
                    data = parameters;
                }
                if (!this.eventEmitter) {
                    return;
                }
                this.eventEmitter.emit(eventName, data);
            });
            return out;
        };
        return descriptor;
    };
}
exports.EmitAfter = EmitAfter;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/events.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnEventMetadata = exports.OnEvent = exports.EVENT_LISTENER_METADATA = void 0;
const common_1 = __webpack_require__("@nestjs/common");
exports.EVENT_LISTENER_METADATA = 'EVENT_LISTENER_METADATA';
/**
 * Event listener decorator.
 * Subscribes to events based on the specified name(s).
 */
function OnEvent(event) {
    return (0, common_1.SetMetadata)(exports.EVENT_LISTENER_METADATA, {
        event,
    });
}
exports.OnEvent = OnEvent;
class OnEventMetadata {
    /**
     * Event (name or pattern) to subscribe to.
     */
    event;
}
exports.OnEventMetadata = OnEventMetadata;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/fill-defaults.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FillDefaults = void 0;
const class_transformer_1 = __webpack_require__("class-transformer");
function FillDefaults(constructor) {
    return function (target, key, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (data) {
            data = (0, class_transformer_1.plainToInstance)(constructor, data, {
                exposeDefaultValues: true,
            });
            return original.apply(this, data);
        };
        return descriptor;
    };
}
exports.FillDefaults = FillDefaults;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/application-module.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/cast-result.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/emit-after.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/events.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/fill-defaults.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/injectors/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/library-module.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/once-is-enough.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/schedule.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/single-call.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/string.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/try-catch.decorator.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/decorators/injectors/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/injectors/inject-cache.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/injectors/inject-config.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/injectors/inject-logger.decorator.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/decorators/injectors/inject-cache.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InjectCache = void 0;
const common_1 = __webpack_require__("@nestjs/common");
function InjectCache() {
    return (0, common_1.Inject)(common_1.CACHE_MANAGER);
}
exports.InjectCache = InjectCache;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/injectors/inject-config.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InjectConfig = exports.CONFIG_PROVIDERS = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const uuid_1 = __webpack_require__("uuid");
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
exports.CONFIG_PROVIDERS = new Set();
function InjectConfig(path, from) {
    return function (target, key, index) {
        target[contracts_1.CONSUMES_CONFIG] ??= [];
        target[contracts_1.CONSUMES_CONFIG].push(path);
        const id = (0, uuid_1.v4)();
        exports.CONFIG_PROVIDERS.add({
            inject: [services_1.AutoConfigService, contracts_1.ACTIVE_APPLICATION],
            provide: id,
            useFactory(config, application) {
                const configPath = [];
                const library = from
                    ? from.description
                    : target[contracts_1.LOGGER_LIBRARY];
                if (library && library !== application.description) {
                    configPath.push('libs', library);
                }
                else {
                    configPath.push('application');
                }
                configPath.push(path);
                return config.get(configPath.join('.'));
            },
        });
        return (0, common_1.Inject)(id)(target, key, index);
    };
}
exports.InjectConfig = InjectConfig;
InjectConfig.inject = function (path, from) {
    const id = (0, uuid_1.v4)();
    exports.CONFIG_PROVIDERS.add({
        inject: [services_1.AutoConfigService, contracts_1.ACTIVE_APPLICATION],
        provide: id,
        useFactory(config) {
            const configPath = [];
            if (from) {
                configPath.push('libs', from.description);
            }
            else {
                configPath.push('application');
            }
            configPath.push(path);
            return config.get(configPath.join('.'));
        },
    });
    return id;
};


/***/ }),

/***/ "./libs/boilerplate/src/decorators/injectors/inject-logger.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InjectLogger = exports.mappedContexts = exports.LOGGER_PROVIDERS = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const uuid_1 = __webpack_require__("uuid");
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
exports.LOGGER_PROVIDERS = new Set();
exports.mappedContexts = new Map();
function InjectLogger() {
    const provide = (0, uuid_1.v4)();
    exports.LOGGER_PROVIDERS.add({
        inject: [services_1.AutoLogService],
        provide,
        useFactory(logger) {
            logger['contextId'] = provide;
            return logger;
        },
    });
    return function (target, property, index) {
        exports.mappedContexts.set(provide, target.name);
        return (0, common_1.Inject)(provide)(target, property, index);
    };
}
exports.InjectLogger = InjectLogger;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/library-module.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LibraryModule = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
function LibraryModule(metadata) {
    const propertiesKeys = Object.keys(metadata);
    const library = metadata.library.description;
    LibraryModule.configs.set(library, { configuration: metadata.configuration });
    return target => {
        target[contracts_1.LOGGER_LIBRARY] = library;
        metadata.providers ??= [];
        metadata.providers.forEach(provider => {
            provider[contracts_1.LOGGER_LIBRARY] = library;
        });
        if (!metadata.local) {
            (0, common_1.Global)()(target);
        }
        delete metadata.local;
        propertiesKeys.forEach(property => {
            Reflect.defineMetadata(property, metadata[property], target);
        });
    };
}
exports.LibraryModule = LibraryModule;
LibraryModule.configs = new Map();


/***/ }),

/***/ "./libs/boilerplate/src/decorators/once-is-enough.decorator.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OnceIsEnough = void 0;
/**
 * Why execute the method again if the result isn't gonna change?
 * Not a replacement for caching
 *
 * Capture the result from the first call, and return on all followup calls.
 * Not intended for use with functions that have parameters.
 */
function OnceIsEnough() {
    let value;
    let run = false;
    return function (target, key, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...parameters) {
            if (run === true) {
                return value;
            }
            value = Reflect.apply(original, this, parameters);
            run = true;
            return value;
        };
        return descriptor;
    };
}
exports.OnceIsEnough = OnceIsEnough;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/schedule.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Cron = exports.CronObject = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
var CronObject;
(function (CronObject) {
    CronObject[CronObject["second"] = 0] = "second";
    CronObject[CronObject["minute"] = 1] = "minute";
    CronObject[CronObject["hour"] = 2] = "hour";
    CronObject[CronObject["dayOfMonth"] = 3] = "dayOfMonth";
    CronObject[CronObject["month"] = 4] = "month";
    CronObject[CronObject["dayOfWeek"] = 5] = "dayOfWeek";
})(CronObject = exports.CronObject || (exports.CronObject = {}));
/**
 * CronExpression | string
 */
function Cron(schedule) {
    return (0, common_1.SetMetadata)(utilities_1.CRON_SCHEDULE, utilities_1.is.string(schedule)
        ? schedule
        : Object.keys(CronObject)
            .map(key => schedule[key] ?? '*')
            .join(' '));
}
exports.Cron = Cron;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/single-call.decorator.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SingleCall = void 0;
function SingleCall({ emitAfter, } = {}) {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        let promise;
        descriptor.value = function (...parameters) {
            if (promise) {
                return promise;
            }
            promise = new Promise(async (done) => {
                const result = await Reflect.apply(original, this, parameters);
                promise = undefined;
                done(result);
                if (emitAfter) {
                    this.eventEmitter.emit(emitAfter, result);
                }
            });
            return promise;
        };
        return descriptor;
    };
}
exports.SingleCall = SingleCall;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/string.decorator.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SliceLines = void 0;
function SliceLines(start, end) {
    return function (target, key, descriptor) {
        const original = descriptor.value;
        descriptor.value = async function (...parameters) {
            const result = await Reflect.apply(original, this, parameters);
            return result.split(`\n`).slice(start, end).join(`\n`);
        };
        return descriptor;
    };
}
exports.SliceLines = SliceLines;


/***/ }),

/***/ "./libs/boilerplate/src/decorators/try-catch.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TryCatch = void 0;
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
function TryCatch() {
    return function (target, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...parameters) {
            try {
                return Reflect.apply(original, this, parameters);
            }
            catch (error) {
                services_1.AutoLogService.call('error', `TryCatch:Annotation:FIXME`, { error }, 'Caught error');
            }
        };
        return descriptor;
    };
}
exports.TryCatch = TryCatch;


/***/ }),

/***/ "./libs/boilerplate/src/includes/bootstrap.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bootstrap = void 0;
const core_1 = __webpack_require__("@nestjs/core");
const platform_express_1 = __webpack_require__("@nestjs/platform-express");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const express_1 = __importDefault(__webpack_require__("express"));
/**
 * Standardized init process
 */
async function Bootstrap(module, bootOptions) {
    // Environment files can append extra modules
    if (!utilities_1.is.empty(bootOptions.imports)) {
        const current = Reflect.getMetadata('imports', module) ?? [];
        current.push(...bootOptions.imports);
        Reflect.defineMetadata('imports', current, module);
    }
    let { preInit, postInit } = bootOptions;
    const { prettyLog, nestNoopLogger, http, noGlobalError } = bootOptions;
    if (prettyLog && chalk_1.default.supportsColor) {
        (0, boilerplate_1.UsePrettyLogger)();
    }
    let server;
    const options = {
        logger: nestNoopLogger ? boilerplate_1.NEST_NOOP_LOGGER : boilerplate_1.AutoLogService.nestLogger,
    };
    let app;
    if (http) {
        server = (0, express_1.default)();
        app = await core_1.NestFactory.create(module, new platform_express_1.ExpressAdapter(server), {
            ...options,
            cors: true,
        });
    }
    else {
        app = await core_1.NestFactory.create(module, options);
    }
    const lifecycle = app.get(boilerplate_1.LifecycleService);
    const logger = await app.resolve(boilerplate_1.AutoLogService);
    logger.setContext(boilerplate_1.LIB_UTILS, { name: 'Bootstrap' });
    // onPreInit
    preInit ??= [];
    if (noGlobalError !== true) {
        preInit.push(boilerplate_1.GlobalErrorInit);
    }
    await (0, utilities_1.eachSeries)(preInit, async (item) => {
        await item(app, server, bootOptions);
    });
    await lifecycle.preInit(app, { options: bootOptions, server });
    // ...init
    // onModuleCreate
    // onApplicationBootstrap
    await app.init();
    // onPostInit
    postInit ??= [];
    await (0, utilities_1.eachSeries)(postInit, async (item) => {
        await item(app, server, bootOptions);
    });
    await lifecycle.postInit(app, { options: bootOptions, server });
}
exports.Bootstrap = Bootstrap;


/***/ }),

/***/ "./libs/boilerplate/src/includes/cache.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterCache = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
function RegisterCache() {
    return common_1.CacheModule.registerAsync({
        inject: [services_1.CacheProviderService],
        useFactory(configService) {
            return configService.getConfig();
        },
    });
}
exports.RegisterCache = RegisterCache;


/***/ }),

/***/ "./libs/boilerplate/src/includes/config-scanner.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScanConfig = void 0;
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
const config_1 = __webpack_require__("./libs/boilerplate/src/contracts/config.ts");
const constants_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/constants.ts");
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
function ScanConfig(app) {
    const configService = app.get(services_1.AutoConfigService);
    const scanner = app.get(services_1.ModuleScannerService);
    const application = app.get(contracts_1.ACTIVE_APPLICATION);
    const used = new Set();
    const map = scanner.findWithSymbol(config_1.CONSUMES_CONFIG);
    const out = [];
    map.forEach((config, instance) => {
        const ctor = instance.constructor;
        const library = ctor[constants_1.LOGGER_LIBRARY] || 'application';
        config.forEach((property) => {
            const joined = [library, property].join('.');
            if (used.has(joined)) {
                return;
            }
            used.add(joined);
            const metadata = configService['metadata'].get(library === 'application' ? application.description : library).configuration[property];
            out.push({
                default: metadata.default,
                library,
                metadata,
                property,
            });
        });
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(out, undefined, '  '));
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
}
exports.ScanConfig = ScanConfig;


/***/ }),

/***/ "./libs/boilerplate/src/includes/global-error.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalErrorInit = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
/* eslint-disable no-console, unicorn/no-process-exit */
let logger;
let prettyLog;
const EXTRA_PREFIX = 4;
const LINE_NUMBER = 8;
const basicError = (error) => {
    console.error(error.name);
    console.error(error.message);
    console.error(error.stack);
    process.exit();
};
// eslint-disable-next-line radar/cognitive-complexity
const prettyError = (error) => {
    const stack = error.stack.split(`\n`).slice(utilities_1.FIRST);
    console.log();
    console.log(chalk_1.default.bgRedBright.white ` 👻 FATAL ERROR 👻 `);
    const lines = [];
    let maxMethod = 0;
    let maxPath = 0;
    let maxLine = 0;
    if (stack[utilities_1.START].startsWith('TypeError: ')) {
        stack.shift();
    }
    stack.forEach(line => {
        line = line.trim();
        line = line.slice(line.indexOf(' ')).trim();
        const hasMethod = line.indexOf(' ') > line.indexOf('/') || line.includes('(');
        const method = !hasMethod ? '' : line.slice(utilities_1.START, line.indexOf(' '));
        if (hasMethod) {
            line = line.slice(hasMethod ? line.indexOf(' ') : utilities_1.START);
        }
        const parts = line.trim().replace('(', '').replace(')', '').split(':');
        const PA = 'Promise.all';
        if (parts[utilities_1.START] === '<anonymous>' ||
            parts[utilities_1.START] === 'Promise <anonymous>' ||
            parts[utilities_1.START] === 'Function <anonymous>' ||
            parts[utilities_1.START].slice(utilities_1.START, PA.length) === PA) {
            maxMethod = Math.max(parts[utilities_1.START].length, maxMethod);
            lines.push([method, [parts[utilities_1.START], '', ''], false]);
            return;
        }
        let localItem = false;
        if (parts.length === EXTRA_PREFIX) {
            const start = parts.shift();
            localItem = start !== 'node';
            if (start === 'node') {
                parts[utilities_1.START] = `${start}:${parts[utilities_1.START]}`;
            }
        }
        if (parts[utilities_1.START].includes('node_modules')) {
            // These paths go to system root
            // Slice them off to start as "node_modules"
            parts[utilities_1.START] = parts[utilities_1.START].slice(parts[utilities_1.START].indexOf('node_modules'));
        }
        maxMethod = Math.max(maxMethod, method.length);
        maxPath = Math.max(maxPath, parts[utilities_1.START].length);
        maxLine = Math.max(maxLine, parts[utilities_1.FIRST].length);
        lines.push([method, parts, localItem]);
    });
    let foundMostRecent = false;
    console.log(chalk_1.default.red(lines
        .map(([method, parts, isLocal], index) => {
        let color = '';
        if (isLocal && !foundMostRecent) {
            foundMostRecent = true;
            color += '.inverse';
        }
        return (0, chalk_1.default) `  {cyan${color} ${index})} {${isLocal ? 'bold' : 'dim'} ${method.padEnd(maxMethod, ' ')}} ${parts
            .shift()
            .padEnd(maxPath, ' ')
            .replace('node_modules', chalk_1.default.dim('node_modules'))} {cyan.bold${color} ${parts.shift().padStart(LINE_NUMBER, ' ')}}${parts[utilities_1.START] ? (0, chalk_1.default) `{white :}{cyan${color} ${parts.shift()}}` : ``}`;
    })
        .join(`\n`)));
    process.exit();
};
process.on('uncaughtException', function (error) {
    if (logger) {
        logger.error(`[${error.name}] ${error.message}`);
        if (prettyLog && error.stack) {
            prettyError(error);
        }
    }
    basicError(error);
});
async function GlobalErrorInit(app, server, options) {
    logger = await app.resolve(services_1.AutoLogService);
    prettyLog = options.prettyLog;
}
exports.GlobalErrorInit = GlobalErrorInit;


/***/ }),

/***/ "./libs/boilerplate/src/includes/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/bootstrap.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/cache.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/config-scanner.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/global-error.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/logger.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/pino-serializers.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/pretty-logger.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/storage.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/includes/logger.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getLogContext = void 0;
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
function getLogContext(instance) {
    return `${instance.constructor[contracts_1.LOGGER_LIBRARY]}:${instance.constructor.name}`;
}
exports.getLogContext = getLogContext;


/***/ }),

/***/ "./libs/boilerplate/src/includes/pino-serializers.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// import { APIRequest, APIResponse } from '@steggy/server';
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PINO_SERIALIZERS = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
exports.PINO_SERIALIZERS = {
    parameters(parameters) {
        return parameters.map(item => {
            if (utilities_1.is.object(item)) {
                if (!utilities_1.is.undefined(item['_parsedUrl'])) {
                    return 'APIRequest';
                }
                return item;
            }
            return item;
        });
    },
    req(request) {
        return {
            id: request['id'],
            method: request['method'],
            url: request['url'],
        };
    },
    res(response) {
        return {
            statusCode: response['statusCode'],
        };
    },
};


/***/ }),

/***/ "./libs/boilerplate/src/includes/pretty-logger.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/* eslint-disable @typescript-eslint/no-magic-numbers, radar/no-duplicate-string */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsePrettyLogger = exports.PrettyNestLogger = exports.prettyFormatMessage = exports.methodColors = exports.highlightContext = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const pino_1 = __importDefault(__webpack_require__("pino"));
const process_1 = __webpack_require__("process");
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
const logger = (0, pino_1.default)({
    level: auto_log_service_1.AutoLogService.logger.level,
    transport: {
        options: {
            colorize: true,
            crlf: false,
            customPrettifiers: {},
            errorLikeObjectKeys: ['err', 'error'],
            errorProps: '',
            hideObject: false,
            ignore: 'pid,hostname',
            levelKey: ``,
            messageKey: 'msg',
            singleLine: true,
            timestampKey: 'time',
            translateTime: 'SYS:ddd hh:MM:ss.l',
        },
        target: 'pino-pretty',
    },
}, pino_1.default.destination({ sync: true }));
const highlightContext = (context, level) => (0, chalk_1.default) `{bold.${level.slice(2).toLowerCase()} [${context}]}`;
exports.highlightContext = highlightContext;
const NEST = '@nestjs';
exports.methodColors = new Map([
    ['trace', 'bgGrey'],
    ['debug', 'bgBlue.dim'],
    ['warn', 'bgYellow.dim'],
    ['error', 'bgRed'],
    ['info', 'bgGreen'],
    ['fatal', 'bgMagenta'],
]);
const prettyFormatMessage = (message) => {
    if (!message) {
        return ``;
    }
    message = message
        .replace(new RegExp('([^ ]+#[^ ]+)', 'g'), i => chalk_1.default.bold(i))
        .replace(new RegExp('(\\[[^\\]]+\\])', 'g'), i => chalk_1.default.bold.magenta(i.slice(1, -1)))
        .replace(new RegExp('(\\{[^\\]}]+\\})', 'g'), i => chalk_1.default.bold.gray(i.slice(1, -1)));
    const frontDash = ' - ';
    if (message.slice(0, frontDash.length) === frontDash) {
        message = `${chalk_1.default.yellowBright ` - `}${message.slice(frontDash.length)}`;
    }
    return message;
};
exports.prettyFormatMessage = prettyFormatMessage;
/**
 * Re-written error message, with syntax highlighting! Don't judge my boredom
 */
const prettyErrorMessage = (message) => {
    if (!message) {
        return ``;
    }
    const lines = message.split(`\n`);
    const prefix = 'dependencies of the ';
    if (lines[0].includes(prefix)) {
        // eslint-disable-next-line prefer-const
        let [service, module] = lines[0].split('.');
        service = service.slice(service.indexOf(prefix) + prefix.length);
        const PROVIDER = service.slice(0, service.indexOf(' '));
        service = service.slice(service.indexOf(' ') + 1);
        const ctorArguments = service
            .slice(1, -1)
            .split(',')
            .map(item => item.trim());
        const match = module.match(new RegExp('in the ([^ ]+) context'));
        const [, name] = module.match(new RegExp('the argument ([^ ]+) at'));
        const coloredName = chalk_1.default.red.bold(name);
        const importWord = chalk_1.default.yellow('import');
        const fromWord = chalk_1.default.yellow(`from`);
        const left = chalk_1.default.blueBright(`{`);
        const right = chalk_1.default.blueBright(`}`);
        let found = false;
        const stack = message.split(`\n\n`)[2];
        const coloredArguments = ctorArguments.map(parameter => {
            if (found === false) {
                if (parameter === '?') {
                    found = true;
                    return coloredName;
                }
                return chalk_1.default.greenBright.bold(parameter);
            }
            return chalk_1.default.bold.yellow(parameter);
        });
        message = [
            ``,
            chalk_1.default.white
                .bold `Nest cannot resolve the dependencies of {bold.underline.magenta ${match[1]}}:{cyanBright.underline ${PROVIDER}}`,
            ``,
            chalk_1.default.magenta `@Injectable()`,
            `${chalk_1.default.yellow('export class')} ${PROVIDER} ${left}`,
            chalk_1.default.gray `  ...`,
            `  ${chalk_1.default.yellow('constructor')} ${chalk_1.default.blueBright(`(`)}`,
            ...coloredArguments.map(line => `    ${line},`),
            chalk_1.default.blueBright(` ) {}`),
            chalk_1.default.gray ` ...`,
            right,
            ``,
            chalk_1.default.white.bold `Potential solutions:`,
            chalk_1.default.whiteBright ` - If ${coloredName} is a provider, is it part of the current {bold.magenta ${match[1]}}?`,
            chalk_1.default.whiteBright ` - If ${coloredName} is exported from a separate {bold.magenta @Module}, is that module imported within {bold.magenta ${match[1]}}?`,
            `${chalk_1.default.magenta('@Module')} ${chalk_1.default.blueBright('({')} `,
            `  ${chalk_1.default.white('imports')}: [ `,
            chalk_1.default.gray `    /* the {magenta.bold Module} containing ${coloredName} */`,
            `  ] `,
            chalk_1.default.blueBright(`})`),
            chalk_1.default.whiteBright ` - Circular references`,
            chalk_1.default.gray ` ...`,
            `  ${chalk_1.default.yellow('constructor')} ${chalk_1.default.blueBright(`(`)}`,
            ...coloredArguments
                .map(item => {
                if (item === coloredName) {
                    return `${chalk_1.default.magenta(`@Inject`)}${chalk_1.default.blueBright('(')}${chalk_1.default.yellow('forwardRef')}${chalk_1.default.blueBright('(()')} => ${coloredName}${chalk_1.default.blueBright('))')} ${item}`;
                }
                return item;
            })
                .map(line => `    ${line},`),
            chalk_1.default.blueBright(` ) {}`),
            chalk_1.default.gray ` ...`,
            chalk_1.default.whiteBright ` - Verify import statement follows these standards`,
            chalk_1.default.gray `// Good imports 👍`,
            ...['"@another/library"', '"./file"', '"../directory"'].map(statement => `${importWord} ${left} ${coloredName} ${right} ${fromWord} ${chalk_1.default.green(statement)};`),
            chalk_1.default.gray `// Breaking imports 👎`,
            ...['"."', '".."', '"../.."'].map(statement => `${importWord} ${left} ${coloredName} ${right} ${fromWord} ${chalk_1.default.red(statement)};`),
            chalk_1.default.gray `// Oops import 🤔`,
            `${chalk_1.default.yellow(`import type`)} ${left} ${coloredName} ${right} ${chalk_1.default.yellow(`from`)} ....`,
            ``,
            ``,
            chalk_1.default.white.bold `Stack Trace`,
            stack.replaceAll((0, process_1.cwd)(), chalk_1.default.underline `workspace`),
        ].join(`\n`);
    }
    return message;
};
exports.PrettyNestLogger = {
    debug: (message, context) => {
        context = `${NEST}:${context}`;
        if (context === `${NEST}:InstanceLoader`) {
            message = (0, exports.prettyFormatMessage)(message
                .split(' ')
                .map((item, index) => (index === 0 ? `[${item}]` : item))
                .join(' '));
        }
        // Never actually seen this come through
        // Using magenta to make it obvious if it happens, but will change to blue later
        logger.debug(`${(0, exports.highlightContext)(context, 'bgMagenta')} ${message}`);
    },
    error: (message, context) => {
        context = `${NEST}:${context}`;
        if (context.length > 20) {
            // Context contains the stack trace of the nest injector
            // Nothing actually useful for debugging
            message = prettyErrorMessage(context);
            // 🚩 I hereby stake my claim on this error message 🚩
            context = `@steggy:BootErrorMessage`;
        }
        logger.error(`${(0, exports.highlightContext)(context, 'bgRed')} ${message ?? 'ERROR MESSAGE NOT PROVIDED'}`);
    },
    log: (message, context) => {
        let method = 'debug';
        let bgColor = 'bgGreen';
        context = `${NEST}:${context}`;
        if (context === `${NEST}:InstanceLoader`) {
            message = (0, exports.prettyFormatMessage)(message
                .split(' ')
                .map((item, index) => (index === 0 ? `[${item}]` : item))
                .join(' '));
        }
        if (context === `${NEST}:RoutesResolver`) {
            const parts = message.split(' ');
            message = (0, exports.prettyFormatMessage)([`[${parts[0]}]`, parts[1]].join(' ').slice(0, -1));
        }
        if (context === `${NEST}:NestApplication` && message.includes('started')) {
            // Don't judge me for rewriting messages to add emoji
            message = `🐣 ${message} 🐣`;
        }
        if (context === `${NEST}:RouterExplorer`) {
            const [parts] = message.match(new RegExp('(\\{[^\\]]+\\})'));
            const [path, routeMethod] = parts.slice(1, -1).split(', ');
            message = (0, exports.prettyFormatMessage)(` - [${routeMethod}] {${path}}`);
            method = 'debug';
            bgColor = 'bgBlue.dim';
            // if (matches) {
            //   message = message.replace(
            //     matches[0],
            //     chalk`{bold.gray ${matches[0].slice(1, -1)}}`,
            //   );
            // }
            // const parts = message.split(' ');
            // message = prettyFormatMessage(
            //   [`[${parts[0]}]`, parts[1]].join(' ').slice(0, -1),
            // );
        }
        logger[method](`${(0, exports.highlightContext)(context, bgColor)} ${message}`);
    },
    verbose: (message, context) => {
        exports.PrettyNestLogger.debug(message, context);
    },
    warn: (message, context) => {
        logger.warn(`${(0, exports.highlightContext)(`${NEST}:${context}`, 'bgYellow.dim')} ${message}`);
    },
};
function UsePrettyLogger() {
    auto_log_service_1.AutoLogService.logger = logger;
    auto_log_service_1.AutoLogService.prettyLogger = true;
    auto_log_service_1.AutoLogService.nestLogger = exports.PrettyNestLogger;
    auto_log_service_1.AutoLogService.logger = logger;
    auto_log_service_1.AutoLogService.call = function (method, context, ...parameters) {
        if (method === 'trace' && auto_log_service_1.AutoLogService.logger.level !== 'trace') {
            // early shortcut for an over used call
            return;
        }
        const logger = auto_log_service_1.AutoLogService.getLogger();
        if (utilities_1.is.object(parameters[0])) {
            logger[method](parameters.shift(), `${(0, exports.highlightContext)(context, exports.methodColors.get(method))} ${(0, exports.prettyFormatMessage)(parameters.shift())}`, ...parameters);
            return;
        }
        logger[method](`${(0, exports.highlightContext)(context, exports.methodColors.get(method))} ${(0, exports.prettyFormatMessage)(parameters.shift())}`, ...parameters);
    };
}
exports.UsePrettyLogger = UsePrettyLogger;


/***/ }),

/***/ "./libs/boilerplate/src/includes/storage.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.storage = void 0;
const async_hooks_1 = __webpack_require__("async_hooks");
exports.storage = new async_hooks_1.AsyncLocalStorage();


/***/ }),

/***/ "./libs/boilerplate/src/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/config.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/contracts/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/decorators/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/includes/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/modules/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/index.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/modules/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/modules/utilities.module.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/modules/utilities.module.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UtilitiesModule_1, _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UtilitiesModule = void 0;
const core_1 = __webpack_require__("@nestjs/core");
const config_1 = __webpack_require__("./libs/boilerplate/src/config.ts");
const injectors_1 = __webpack_require__("./libs/boilerplate/src/decorators/injectors/index.ts");
const inject_config_decorator_1 = __webpack_require__("./libs/boilerplate/src/decorators/injectors/inject-config.decorator.ts");
const library_module_decorator_1 = __webpack_require__("./libs/boilerplate/src/decorators/library-module.decorator.ts");
const includes_1 = __webpack_require__("./libs/boilerplate/src/includes/index.ts");
const services_1 = __webpack_require__("./libs/boilerplate/src/services/index.ts");
let UtilitiesModule = UtilitiesModule_1 = class UtilitiesModule {
    discoveryService;
    logger;
    static RegisterCache = includes_1.RegisterCache;
    static forRoot(extra = []) {
        // @InjectConfig()
        const config = [...inject_config_decorator_1.CONFIG_PROVIDERS.values()];
        // @InjectLogger()
        const loggers = [...injectors_1.LOGGER_PROVIDERS.values()];
        return {
            exports: [
                ...extra,
                ...config,
                ...loggers,
                services_1.AutoConfigService,
                services_1.AutoLogService,
                services_1.CacheProviderService,
                services_1.FetchService,
                services_1.JSONFilterService,
                services_1.ModuleScannerService,
                services_1.WorkspaceService,
            ],
            global: true,
            imports: [(0, includes_1.RegisterCache)(), core_1.DiscoveryModule],
            module: UtilitiesModule_1,
            providers: [
                ...extra,
                ...config,
                ...loggers,
                services_1.AutoConfigService,
                services_1.AutoLogService,
                services_1.CacheProviderService,
                services_1.EventsExplorerService,
                services_1.FetchService,
                services_1.JSONFilterService,
                services_1.LifecycleService,
                services_1.LogExplorerService,
                services_1.ModuleScannerService,
                services_1.ScheduleExplorerService,
                services_1.WorkspaceService,
            ],
        };
    }
    constructor(discoveryService, logger) {
        this.discoveryService = discoveryService;
        this.logger = logger;
    }
    configure() {
        this.discoveryService.load();
    }
};
UtilitiesModule = UtilitiesModule_1 = __decorate([
    (0, library_module_decorator_1.LibraryModule)({
        configuration: {
            [config_1.CACHE_PROVIDER]: {
                default: 'memory',
                description: 'Redis is preferred if available',
                enum: ['redis', 'memory'],
                type: 'string',
            },
            [config_1.LOG_LEVEL]: {
                default: 'info',
                description: 'Minimum log level to process',
                enum: ['info', 'warn', 'debug'],
                type: 'string',
            },
            [config_1.REDIS_DEFAULT_TTL]: {
                careful: true,
                default: 86_400,
                description: 'Configuration property for redis connection',
                type: 'number',
            },
            [config_1.REDIS_HOST]: {
                default: 'localhost',
                description: 'Configuration property for redis connection',
                type: 'string',
            },
            [config_1.REDIS_PORT]: {
                default: 6379,
                description: 'Configuration property for redis connection',
                type: 'number',
            },
        },
        exports: [
            services_1.AutoConfigService,
            services_1.AutoLogService,
            services_1.CacheProviderService,
            services_1.FetchService,
            services_1.JSONFilterService,
            services_1.WorkspaceService,
        ],
        imports: [(0, includes_1.RegisterCache)(), core_1.DiscoveryModule],
        library: config_1.LIB_UTILS,
        providers: [
            services_1.AutoConfigService,
            services_1.AutoLogService,
            services_1.CacheProviderService,
            services_1.EventsExplorerService,
            services_1.FetchService,
            services_1.JSONFilterService,
            services_1.LifecycleService,
            services_1.LogExplorerService,
            services_1.ModuleScannerService,
            services_1.ScheduleExplorerService,
            services_1.WorkspaceService,
        ],
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof services_1.LogExplorerService !== "undefined" && services_1.LogExplorerService) === "function" ? _a : Object, typeof (_b = typeof services_1.AutoLogService !== "undefined" && services_1.AutoLogService) === "function" ? _b : Object])
], UtilitiesModule);
exports.UtilitiesModule = UtilitiesModule;


/***/ }),

/***/ "./libs/boilerplate/src/services/auto-config.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AutoConfigService_1, _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AutoConfigService = void 0;
/* eslint-disable @typescript-eslint/no-magic-numbers */
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const comment_json_1 = __importDefault(__webpack_require__("comment-json"));
const fs_1 = __webpack_require__("fs");
const ini_1 = __webpack_require__("ini");
const js_yaml_1 = __importDefault(__webpack_require__("js-yaml"));
const minimist_1 = __importDefault(__webpack_require__("minimist"));
const object_path_1 = __webpack_require__("object-path");
const path_1 = __webpack_require__("path");
const config_1 = __webpack_require__("./libs/boilerplate/src/config.ts");
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
const config_2 = __webpack_require__("./libs/boilerplate/src/contracts/meta/config/index.ts");
const decorators_1 = __webpack_require__("./libs/boilerplate/src/decorators/index.ts");
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
const workspace_service_1 = __webpack_require__("./libs/boilerplate/src/services/workspace.service.ts");
const extensions = ['json', 'ini', 'yaml'];
let AutoConfigService = AutoConfigService_1 = class AutoConfigService {
    logger;
    APPLICATION;
    overrideConfig;
    workspace;
    static DEFAULTS = new Map();
    static NX_PROJECT;
    static USE_SCANNER_ASSETS = false;
    constructor(logger, APPLICATION, overrideConfig, workspace) {
        this.logger = logger;
        this.APPLICATION = APPLICATION;
        this.overrideConfig = overrideConfig;
        this.workspace = workspace;
        this.earlyInit();
    }
    config = {};
    configFiles;
    loadedConfigFiles;
    loadedConfigPath;
    switches = (0, minimist_1.default)(process.argv);
    get appName() {
        return this.APPLICATION.description;
    }
    get(path) {
        if (Array.isArray(path)) {
            path = ['libs', path[0].description, path[1]].join('.');
        }
        let value = (0, object_path_1.get)(this.config, path) ?? this.getConfiguration(path)?.default;
        const config = this.getConfiguration(path);
        if (config.warnDefault && value === config.default) {
            this.logger.warn(`Configuration property {${path}} is using default value`);
        }
        switch (config.type) {
            case 'number':
                return Number(value);
            case 'boolean':
                if (utilities_1.is.string(value)) {
                    value = ['false', 'n'].includes(value.toLowerCase());
                    return value;
                }
                return Boolean(value);
        }
        return value;
    }
    getDefault(path) {
        const override = (0, object_path_1.get)(this.overrideConfig ?? {}, path);
        if (!utilities_1.is.undefined(override)) {
            return override;
        }
        const configuration = this.getConfiguration(path);
        if (!configuration) {
            this.logger.fatal({ path }, `Unknown configuration. Double check {project.json} assets + make sure property is included in metadata`);
            // eslint-disable-next-line unicorn/no-process-exit
            process.exit();
        }
        return configuration.default;
    }
    set(path, value, write = false) {
        if (Array.isArray(path)) {
            path = ['libs', path[0].description, path[1]].join('.');
        }
        (0, object_path_1.set)(this.config, path, value);
        if (write) {
            (0, fs_1.writeFileSync)(this.loadedConfigPath, (0, ini_1.encode)(this.config));
        }
    }
    cast(data, type) {
        switch (type) {
            case 'boolean':
                return (data.toLowerCase() === 'true' ||
                    data.toLowerCase() === 'y' ||
                    data === '1');
            case 'number':
                return Number(data);
        }
        return data;
    }
    earlyInit() {
        this.config = {};
        this.setDefaults();
        const fileConfig = this.loadFromFiles();
        fileConfig.forEach(config => (0, utilities_1.deepExtend)(this.config, config));
        (0, utilities_1.deepExtend)(this.config, this.overrideConfig ?? {});
        this.loadFromEnv();
        this.logger.setContext(config_1.LIB_UTILS, AutoConfigService_1);
        this.logger['context'] = `${config_1.LIB_UTILS.description}:${AutoConfigService_1.name}`;
        auto_log_service_1.AutoLogService.logger.level = this.get([config_1.LIB_UTILS, config_1.LOG_LEVEL]);
        fileConfig.forEach((config, path) => this.logger.info(`Loaded configuration from {${path}}`));
    }
    getConfiguration(path) {
        const { configs } = decorators_1.LibraryModule;
        const parts = path.split('.');
        if (parts.length === 2) {
            const metadata = configs.get(this.appName);
            const config = metadata.configuration[parts[1]];
            if (!utilities_1.is.empty(Object.keys(config ?? {}))) {
                return config;
            }
            const defaultValue = this.loadAppDefault(parts[1]);
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
            throw new common_1.InternalServerErrorException(`Missing metadata asset for ${library}`);
        }
        return metadata.configuration[property];
    }
    loadAppDefault(property) {
        const { env } = process;
        const result = env[property] ??
            env[property.toLowerCase()] ??
            this.switches[property] ??
            this.switches[property.toLowerCase()];
        return result;
    }
    loadFromEnv() {
        const { env } = process;
        decorators_1.LibraryModule.configs.forEach(({ configuration }, project) => {
            configuration ??= {};
            const cleanedProject = (project ?? this.APPLICATION.description).replaceAll('-', '_');
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
                const lazy = env[key] ?? this.switches[key] ?? this.switches[key.toLowerCase()];
                const configPath = `${configPrefix}.${key}`;
                if (!utilities_1.is.undefined(full)) {
                    (0, object_path_1.set)(this.config, configPath, this.cast(noApp, configuration[key].type));
                    return;
                }
                if (!utilities_1.is.undefined(noApp)) {
                    (0, object_path_1.set)(this.config, configPath, this.cast(noApp, configuration[key].type));
                    return;
                }
                if (!utilities_1.is.undefined(lazy)) {
                    (0, object_path_1.set)(this.config, configPath, this.cast(lazy, configuration[key].type));
                }
            });
        });
    }
    loadFromFile(out, filePath) {
        if (!(0, fs_1.existsSync)(filePath)) {
            return undefined;
        }
        this.loadedConfigPath = filePath;
        const fileContent = (0, fs_1.readFileSync)(filePath, 'utf8').trim();
        this.loadedConfigFiles.push(filePath);
        const hasExtension = extensions.some(extension => {
            if (filePath.slice(extension.length * utilities_1.INVERT_VALUE).toLowerCase() ===
                extension) {
                switch (extension) {
                    case 'ini':
                        out.set(filePath, (0, ini_1.decode)(fileContent));
                        return true;
                    case 'yaml':
                    case 'yml':
                        out.set(filePath, js_yaml_1.default.load(fileContent));
                        return true;
                    case 'json':
                        out.set(filePath, comment_json_1.default.parse(fileContent));
                        return true;
                }
            }
            return false;
        });
        if (hasExtension) {
            return undefined;
        }
        // Guessing JSON
        if (fileContent[utilities_1.START] === '{') {
            out.set(filePath, comment_json_1.default.parse(fileContent));
            return true;
        }
        // Guessing yaml
        try {
            const content = js_yaml_1.default.load(fileContent);
            if (utilities_1.is.object(content)) {
                out.set(filePath, content);
                return true;
            }
        }
        catch {
            // Is not a yaml file
        }
        // Final fallback: INI
        out.set(filePath, (0, ini_1.decode)(fileContent));
        return true;
    }
    loadFromFiles() {
        this.configFiles = this.workspace.configFilePaths;
        if (this.switches['config']) {
            this.configFiles.push((0, path_1.resolve)(this.switches['config']));
        }
        this.loadedConfigFiles = [];
        const out = new Map();
        this.configFiles.forEach(filePath => {
            this.loadFromFile(out, filePath);
        });
        return out;
    }
    setDefaults() {
        decorators_1.LibraryModule.configs.forEach(({ configuration }, project) => {
            const isApplication = this.appName === project;
            Object.keys(configuration).forEach(key => {
                if (!utilities_1.is.undefined(configuration[key].default)) {
                    (0, object_path_1.set)(this.config, `${isApplication ? 'application' : `libs.${project}`}.${key}`, configuration[key].default);
                }
            });
        });
    }
};
AutoConfigService = AutoConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(config_2.ACTIVE_APPLICATION)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)(contracts_1.USE_THIS_CONFIG)),
    __metadata("design:paramtypes", [typeof (_a = typeof auto_log_service_1.AutoLogService !== "undefined" && auto_log_service_1.AutoLogService) === "function" ? _a : Object, Symbol, typeof (_b = typeof config_2.AbstractConfig !== "undefined" && config_2.AbstractConfig) === "function" ? _b : Object, typeof (_c = typeof workspace_service_1.WorkspaceService !== "undefined" && workspace_service_1.WorkspaceService) === "function" ? _c : Object])
], AutoConfigService);
exports.AutoConfigService = AutoConfigService;


/***/ }),

/***/ "./libs/boilerplate/src/services/auto-log.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AutoLogService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AutoLogService = exports.NEST_NOOP_LOGGER = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const pino_1 = __importDefault(__webpack_require__("pino"));
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
const constants_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/constants.ts");
const injectors_1 = __webpack_require__("./libs/boilerplate/src/decorators/injectors/index.ts");
const includes_1 = __webpack_require__("./libs/boilerplate/src/includes/index.ts");
const NEST = '@nestjs';
exports.NEST_NOOP_LOGGER = {
    error: (...items) => {
        // eslint-disable-next-line no-console
        console.error(...items);
    },
    log: () => {
        //
    },
    warn: () => {
        //
    },
};
const logger = (0, pino_1.default)();
/**
 * Use `@InjectLogger()` if context is not automatically found
 */
let AutoLogService = AutoLogService_1 = class AutoLogService {
    inquirerer;
    activeApplication;
    static logger = logger;
    static nestLogger = {
        debug: (message, context) => AutoLogService_1.logger.debug({ context: `${NEST}:${context}` }, message),
        error: (message, context) => AutoLogService_1.logger.error({ context: `${NEST}:${context}` }, message),
        log: (message, context) => AutoLogService_1.logger.info({ context: `${NEST}:${context}` }, message),
        verbose: (message, context) => AutoLogService_1.logger.debug({ context: `${NEST}:${context}` }, message),
        warn: (message, context) => AutoLogService_1.logger.warn({ context: `${NEST}:${context}` }, message),
    };
    static prettyLogger = false;
    /**
     * Decide which method of formatting log messages is correct
     *
     * - Normal: intended for production use cases
     * - Pretty: development use cases
     */
    static call(method, context, ...parameters) {
        if (method === 'trace' && AutoLogService_1.logger.level !== 'trace') {
            // early shortcut for an over used call
            return;
        }
        const logger = this.getLogger();
        const data = utilities_1.is.object(parameters[0])
            ? parameters.shift()
            : {};
        const message = utilities_1.is.string(parameters[0])
            ? parameters.shift()
            : ``;
        logger[method]({
            context,
            ...data,
        }, message, ...parameters);
    }
    static getLogger() {
        const store = includes_1.storage.getStore();
        return store || AutoLogService_1.logger;
    }
    constructor(inquirerer, activeApplication) {
        this.inquirerer = inquirerer;
        this.activeApplication = activeApplication;
    }
    #cached;
    #context;
    contextId;
    get level() {
        return AutoLogService_1.logger.level;
    }
    get context() {
        if (!this.#cached) {
            this.#cached ??= this.getContext();
            const [project, provider] = this.#cached.split(':');
            if (project === this.activeApplication.description) {
                this.#cached = provider;
            }
        }
        return this.#cached;
    }
    /**
     * Available for if automated context setting doesn't work / isn't avaiable.
     * Those are the vast minority of use cases in the repo, so this definition is currently hidden (protected).
     * Set like this if actually needed
     *
     * ```typescript
     * logger['context'] = `${LIB_ALIENS.description}:SomethingIdentifying`;
     * ```
     */
    set context(value) {
        this.#context = value;
    }
    debug(...arguments_) {
        AutoLogService_1.call('debug', this.context, ...arguments_);
    }
    error(...arguments_) {
        AutoLogService_1.call('error', this.context, ...arguments_);
    }
    fatal(...arguments_) {
        AutoLogService_1.call('fatal', this.context, ...arguments_);
    }
    info(...arguments_) {
        AutoLogService_1.call('info', this.context, ...arguments_);
    }
    /**
     * For edge case situations like:
     *
     *  - extreme early init
     *  - code locations where DI isn't available
     *
     * `@InjectLogger()` annotation is available for providers
     */
    setContext(library, service) {
        this.#context = `${library.description}:${service.name}`;
    }
    trace(...arguments_) {
        AutoLogService_1.call('trace', this.context, ...arguments_);
    }
    warn(...arguments_) {
        AutoLogService_1.call('warn', this.context, ...arguments_);
    }
    getContext() {
        if (this.#context) {
            return this.#context;
        }
        if (this.contextId) {
            return injectors_1.mappedContexts.get(this.contextId);
        }
        return this.inquirerer?.constructor[constants_1.LOG_CONTEXT] ?? constants_1.MISSING_CONTEXT;
    }
};
AutoLogService = AutoLogService_1 = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __param(0, (0, common_1.Inject)(core_1.INQUIRER)),
    __param(1, (0, common_1.Inject)(contracts_1.ACTIVE_APPLICATION)),
    __metadata("design:paramtypes", [Object, Symbol])
], AutoLogService);
exports.AutoLogService = AutoLogService;


/***/ }),

/***/ "./libs/boilerplate/src/services/explorers/events-explorer.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventsExplorerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const eventemitter3_1 = __importDefault(__webpack_require__("eventemitter3"));
const logger_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/index.ts");
const events_decorator_1 = __webpack_require__("./libs/boilerplate/src/decorators/events.decorator.ts");
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
let EventsExplorerService = class EventsExplorerService {
    logger;
    discoveryService;
    eventEmitter;
    reflector;
    metadataScanner;
    constructor(logger, discoveryService, eventEmitter, reflector, metadataScanner) {
        this.logger = logger;
        this.discoveryService = discoveryService;
        this.eventEmitter = eventEmitter;
        this.reflector = reflector;
        this.metadataScanner = metadataScanner;
    }
    getEventHandlerMetadata(target) {
        return this.reflector.get(events_decorator_1.EVENT_LISTENER_METADATA, target);
    }
    loadEventListeners() {
        const providers = this.discoveryService.getProviders();
        const controllers = this.discoveryService.getControllers();
        [...providers, ...controllers]
            .filter(wrapper => wrapper.isDependencyTreeStatic())
            .filter(wrapper => wrapper.instance)
            .forEach((wrapper) => {
            const { instance } = wrapper;
            const prototype = Object.getPrototypeOf(instance);
            this.metadataScanner.scanFromPrototype(instance, prototype, (key) => {
                this.subscribe(instance, key);
            });
        });
    }
    onApplicationBootstrap() {
        this.loadEventListeners();
    }
    onApplicationShutdown() {
        this.eventEmitter.removeAllListeners();
    }
    subscribe(instance, key) {
        const eventListenerMetadata = this.getEventHandlerMetadata(instance[key]);
        if (!eventListenerMetadata) {
            return;
        }
        const { event } = eventListenerMetadata;
        const context = instance.constructor[logger_1.LOG_CONTEXT];
        this.logger.debug(`${context}#${key} event subscribe {${JSON.stringify(event)}}`);
        this.eventEmitter.on(event, (...parameters) => instance[key].call(instance, ...parameters));
    }
};
EventsExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auto_log_service_1.AutoLogService !== "undefined" && auto_log_service_1.AutoLogService) === "function" ? _a : Object, typeof (_b = typeof core_1.DiscoveryService !== "undefined" && core_1.DiscoveryService) === "function" ? _b : Object, typeof (_c = typeof eventemitter3_1.default !== "undefined" && eventemitter3_1.default) === "function" ? _c : Object, typeof (_d = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _d : Object, typeof (_e = typeof core_1.MetadataScanner !== "undefined" && core_1.MetadataScanner) === "function" ? _e : Object])
], EventsExplorerService);
exports.EventsExplorerService = EventsExplorerService;


/***/ }),

/***/ "./libs/boilerplate/src/services/explorers/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/services/explorers/events-explorer.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/explorers/log-explorer.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/explorers/module-scanner.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/explorers/schedule-explorer.service.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/services/explorers/log-explorer.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogExplorerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const config_1 = __webpack_require__("./libs/boilerplate/src/config.ts");
const logger_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/index.ts");
const injectors_1 = __webpack_require__("./libs/boilerplate/src/decorators/injectors/index.ts");
// Don't remove LOG_LEVEL injection
// Including it here forces it to appear in config builder
// Including it in AutoLogService makes things explode
const SKIP_PROVIDERS = new Set(['ModuleRef', '', 'useFactory']);
let LogExplorerService = class LogExplorerService {
    discoveryService;
    logLevel;
    constructor(discoveryService, logLevel) {
        this.discoveryService = discoveryService;
        this.logLevel = logLevel;
    }
    load() {
        const providers = [
            ...this.discoveryService.getControllers(),
            ...this.discoveryService.getProviders(),
        ].filter(({ instance }) => !!instance);
        providers.forEach(wrapper => {
            const { instance, host } = wrapper;
            const proto = instance.constructor;
            if (!proto || !proto[logger_1.LOGGER_LIBRARY]) {
                return;
            }
            const loggerContext = proto[logger_1.LOGGER_LIBRARY];
            const items = [...host.providers.values(), ...host.controllers.values()];
            items.forEach(({ metatype }) => {
                if (SKIP_PROVIDERS.has(metatype?.name ?? '') ||
                    !utilities_1.is.undefined(metatype[logger_1.LOG_CONTEXT])) {
                    return;
                }
                const context = `${loggerContext}:${metatype.name}`;
                // Update the annotation injected context if one exists
                injectors_1.mappedContexts.forEach((value, key) => {
                    if (value === metatype.name) {
                        injectors_1.mappedContexts.set(key, context);
                    }
                });
                metatype[logger_1.LOG_CONTEXT] ??= context;
                metatype[logger_1.LOGGER_LIBRARY] ??= loggerContext;
            });
        });
    }
};
LogExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, injectors_1.InjectConfig)(config_1.LOG_LEVEL)),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.DiscoveryService !== "undefined" && core_1.DiscoveryService) === "function" ? _a : Object, String])
], LogExplorerService);
exports.LogExplorerService = LogExplorerService;


/***/ }),

/***/ "./libs/boilerplate/src/services/explorers/module-scanner.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ModuleScannerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const logger_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/index.ts");
const once_is_enough_decorator_1 = __webpack_require__("./libs/boilerplate/src/decorators/once-is-enough.decorator.ts");
let ModuleScannerService = class ModuleScannerService {
    discoveryService;
    constructor(discoveryService) {
        this.discoveryService = discoveryService;
    }
    applicationProviders() {
        return this.getProviders().filter(instance => {
            const ctor = instance.constructor;
            return !utilities_1.is.undefined(ctor[logger_1.LOGGER_LIBRARY]);
        });
    }
    findWithSymbol(find) {
        const out = new Map();
        this.applicationProviders().forEach(instance => {
            const ctor = instance.constructor;
            if (!utilities_1.is.undefined(ctor[find])) {
                out.set(instance, ctor[find]);
            }
        });
        return out;
    }
    getProviders() {
        return [
            ...this.discoveryService.getControllers(),
            ...this.discoveryService.getProviders(),
        ]
            .filter(wrapper => {
            if (!wrapper.instance) {
                return false;
            }
            return true;
        })
            .map(wrapper => wrapper.instance);
    }
};
__decorate([
    (0, once_is_enough_decorator_1.OnceIsEnough)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ModuleScannerService.prototype, "applicationProviders", null);
__decorate([
    (0, once_is_enough_decorator_1.OnceIsEnough)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ModuleScannerService.prototype, "getProviders", null);
ModuleScannerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.DiscoveryService !== "undefined" && core_1.DiscoveryService) === "function" ? _a : Object])
], ModuleScannerService);
exports.ModuleScannerService = ModuleScannerService;


/***/ }),

/***/ "./libs/boilerplate/src/services/explorers/schedule-explorer.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScheduleExplorerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const core_1 = __webpack_require__("@nestjs/core");
const metadata_scanner_1 = __webpack_require__("@nestjs/core/metadata-scanner");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const cron_1 = __webpack_require__("cron");
const constants_1 = __webpack_require__("./libs/boilerplate/src/contracts/logger/constants.ts");
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
let ScheduleExplorerService = class ScheduleExplorerService {
    logger;
    discoveryService;
    metadataScanner;
    reflector;
    constructor(logger, discoveryService, metadataScanner, reflector) {
        this.logger = logger;
        this.discoveryService = discoveryService;
        this.metadataScanner = metadataScanner;
        this.reflector = reflector;
    }
    onApplicationBootstrap() {
        const instanceWrappers = [
            ...this.discoveryService.getControllers(),
            ...this.discoveryService.getProviders(),
        ];
        instanceWrappers.forEach((wrapper) => {
            const { instance } = wrapper;
            if (!instance || !Object.getPrototypeOf(instance)) {
                return;
            }
            this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (key) => {
                const schedule = this.reflector.get(utilities_1.CRON_SCHEDULE, instance[key]);
                if (!schedule) {
                    return;
                }
                this.logger.debug(`${instance.constructor[constants_1.LOG_CONTEXT]}#${key} cron {${schedule}}`);
                const cronJob = new cron_1.CronJob(schedule, () => instance[key]());
                cronJob.start();
            });
        });
    }
};
ScheduleExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auto_log_service_1.AutoLogService !== "undefined" && auto_log_service_1.AutoLogService) === "function" ? _a : Object, typeof (_b = typeof core_1.DiscoveryService !== "undefined" && core_1.DiscoveryService) === "function" ? _b : Object, typeof (_c = typeof metadata_scanner_1.MetadataScanner !== "undefined" && metadata_scanner_1.MetadataScanner) === "function" ? _c : Object, typeof (_d = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _d : Object])
], ScheduleExplorerService);
exports.ScheduleExplorerService = ScheduleExplorerService;


/***/ }),

/***/ "./libs/boilerplate/src/services/fetch/base-fetch.service.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseFetchService = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const DEFAULT_TRUNCATE_LENGTH = 200;
const FIRST = 0;
class BaseFetchService {
    BASE_URL;
    TRUNCATE_LENGTH = DEFAULT_TRUNCATE_LENGTH;
    logger;
    /**
     * Resolve url provided in args into a full path w/ domain
     */
    fetchCreateUrl({ rawUrl, url, ...fetchWith }) {
        let out = rawUrl ? url : `${fetchWith.baseUrl ?? this.BASE_URL}${url}`;
        if (fetchWith.control || fetchWith.params) {
            out = `${out}?${this.buildFilterString(fetchWith)}`;
        }
        return out;
    }
    /**
     * Resolve Filters and query params object into a query string.
     *
     * In case of collision, provided params take priority.
     */
    buildFilterString(fetchWith) {
        return new URLSearchParams({
            ...(0, utilities_1.controlToQuery)(fetchWith.control ?? {}),
            ...Object.fromEntries(Object.entries(fetchWith.params ?? {}).map(([label, value]) => [
                label,
                this.cast(value),
            ])),
        }).toString();
    }
    /**
     * Pre-request logic for fetch()
     *
     * Should return: headers, body, method
     */
    fetchCreateMeta({ body, jwtToken, apiKey, adminKey, bearer, ...fetchWitch }) {
        const headers = {
            ...fetchWitch.headers,
        };
        let method = fetchWitch.method ?? 'get';
        if (body) {
            // Override
            method = fetchWitch.method === 'get' ? 'post' : fetchWitch.method;
            headers['Content-Type'] = 'application/json';
        }
        if (jwtToken) {
            headers['x-jwt-token'] = jwtToken;
        }
        if (apiKey) {
            headers['x-token'] = apiKey;
        }
        if (adminKey) {
            headers['x-admin-key'] = adminKey;
        }
        if (bearer) {
            headers['Authorization'] = `Bearer ${bearer}`;
        }
        if (utilities_1.is.object(body)) {
            body = JSON.stringify(body);
        }
        return {
            body: body,
            headers,
            method,
        };
    }
    /**
     * Post processing function for fetch()
     */
    async fetchHandleResponse({ process }, response) {
        if (process === false) {
            return response;
        }
        const text = await response.text();
        if (process === 'text') {
            return text;
        }
        if (!['{', '['].includes(text.charAt(FIRST))) {
            if (!['OK'].includes(text)) {
                // It's probably a coding error error, and not something a user did.
                // Will try to keep the array up to date if any other edge cases pop up
                this.logger.warn({ text }, `Unexpected API Response`);
            }
            else {
                this.logger.debug({ text }, 'Full response text');
            }
            return text;
        }
        const parsed = JSON.parse(text);
        return this.checkForHttpErrors(parsed);
    }
    cast(item) {
        if (Array.isArray(item)) {
            return item.map(i => this.cast(i)).join(',');
        }
        if (item instanceof Date) {
            return item.toISOString();
        }
        if (utilities_1.is.number(item)) {
            return item.toString();
        }
        if (utilities_1.is.boolean(item)) {
            return item ? 'true' : 'false';
        }
        return item;
    }
    checkForHttpErrors(maybeError) {
        if (!utilities_1.is.object(maybeError) || maybeError === null) {
            return maybeError;
        }
        if (utilities_1.is.number(maybeError.statusCode) && utilities_1.is.string(maybeError.error)) {
            this.logger.error({ error: maybeError }, maybeError.message);
        }
        return maybeError;
    }
}
exports.BaseFetchService = BaseFetchService;


/***/ }),

/***/ "./libs/boilerplate/src/services/fetch/fetch.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FetchService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const bottleneck_1 = __importDefault(__webpack_require__("bottleneck"));
const fs_1 = __webpack_require__("fs");
const node_fetch_1 = __importDefault(__webpack_require__("node-fetch"));
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
const base_fetch_service_1 = __webpack_require__("./libs/boilerplate/src/services/fetch/base-fetch.service.ts");
const DEFAULT_TRUNCATE_LENGTH = 200;
let FetchService = class FetchService extends base_fetch_service_1.BaseFetchService {
    logger;
    constructor(logger) {
        super();
        this.logger = logger;
    }
    TRUNCATE_LENGTH = DEFAULT_TRUNCATE_LENGTH;
    limiter;
    bottleneck(options) {
        this.limiter = new bottleneck_1.default(options);
        this.limiter.on('error', error => {
            this.logger.error({ ...error }, `Error caught in limiter`);
        });
    }
    async download({ destination, ...fetchWith }) {
        const url = await this.fetchCreateUrl(fetchWith);
        const requestInit = await this.fetchCreateMeta(fetchWith);
        const response = await (0, node_fetch_1.default)(url, requestInit);
        await new Promise((resolve, reject) => {
            const fileStream = (0, fs_1.createWriteStream)(destination);
            response.body.pipe(fileStream);
            response.body.on('error', error => reject(error));
            fileStream.on('finish', () => resolve());
        });
    }
    async fetch(fetchWith) {
        if (this.limiter) {
            return this.limiter.schedule(async () => await this.immediateFetch(fetchWith));
        }
        return await this.immediateFetch(fetchWith);
    }
    async immediateFetch(fetchWith) {
        const url = await this.fetchCreateUrl(fetchWith);
        const requestInit = await this.fetchCreateMeta(fetchWith);
        try {
            const response = await (0, node_fetch_1.default)(url, requestInit);
            if (fetchWith.process === false) {
                return response;
            }
            return await this.fetchHandleResponse(fetchWith, response);
        }
        catch (error) {
            this.logger.error({ error });
            return undefined;
        }
    }
};
FetchService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT }),
    __metadata("design:paramtypes", [typeof (_a = typeof auto_log_service_1.AutoLogService !== "undefined" && auto_log_service_1.AutoLogService) === "function" ? _a : Object])
], FetchService);
exports.FetchService = FetchService;


/***/ }),

/***/ "./libs/boilerplate/src/services/fetch/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/services/fetch/base-fetch.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/fetch/fetch.service.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/services/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/services/auto-config.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/explorers/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/fetch/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/json-filter.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/lifecycle.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/providers/index.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/workspace.service.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/services/json-filter.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JSONFilterService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chrono_node_1 = __webpack_require__("chrono-node");
const class_validator_1 = __webpack_require__("class-validator");
const dayjs_1 = __importDefault(__webpack_require__("dayjs"));
const object_path_1 = __webpack_require__("object-path");
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
/**
 * Quick and dirty matching logic that is compatible with ResultControl
 */
let JSONFilterService = class JSONFilterService {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    match(item, filter) {
        const value = (0, object_path_1.get)(item, filter.field);
        if (utilities_1.is.boolean(filter.exists)) {
            const exists = utilities_1.is.undefined(value);
            return (exists && filter.exists) || (!filter.exists && !exists);
        }
        switch (filter.operation) {
            case utilities_1.FILTER_OPERATIONS.gt:
                return this.gt(value, filter.value);
            case utilities_1.FILTER_OPERATIONS.gte:
                return this.gte(value, filter.value);
            case utilities_1.FILTER_OPERATIONS.lt:
                return this.lt(value, filter.value);
            case utilities_1.FILTER_OPERATIONS.lte:
                return this.lte(value, filter.value);
            case utilities_1.FILTER_OPERATIONS.ne:
                return value !== filter.value;
            case utilities_1.FILTER_OPERATIONS.in:
                if (!Array.isArray(filter.value)) {
                    this.logger.warn({ filter }, `value is not an array`);
                    return false;
                }
                return filter.value.includes(value);
            case utilities_1.FILTER_OPERATIONS.nin:
                if (!Array.isArray(filter.value)) {
                    this.logger.warn({ filter }, `value is not an array`);
                    return false;
                }
                return !filter.value.includes(value);
            case utilities_1.FILTER_OPERATIONS.regex:
                return this.regex(value, filter.value);
            case utilities_1.FILTER_OPERATIONS.elem:
                if (!Array.isArray(value)) {
                    this.logger.warn({ filter, value }, `Cannot use elem match on non-array values`);
                    return false;
                }
                return value.includes(filter.value);
            case utilities_1.FILTER_OPERATIONS.eq:
            default:
                return value === filter.value;
        }
    }
    query(control, data) {
        const filters = control.filters ? [...control.filters.values()] : [];
        data = data.filter(item => filters.every(filter => this.match(item, filter)));
        return data.slice(control.skip, control.limit);
    }
    gt(value, cmp) {
        value = this.toNumber(value);
        cmp = this.toNumber(cmp);
        return value > cmp;
    }
    gte(value, cmp) {
        value = this.toNumber(value);
        cmp = this.toNumber(cmp);
        return value >= cmp;
    }
    lt(value, cmp) {
        value = this.toNumber(value);
        cmp = this.toNumber(cmp);
        return value < cmp;
    }
    lte(value, cmp) {
        value = this.toNumber(value);
        cmp = this.toNumber(cmp);
        return value <= cmp;
    }
    regex(value, cmp) {
        // TODO: Support regex like "/regex/flags"
        const regex = utilities_1.is.string(cmp) ? new RegExp(cmp, 'gi') : cmp;
        if (!(regex instanceof RegExp)) {
            this.logger.warn({ cmp }, `Bad regex filter`);
            return false;
        }
        return regex.test(value);
    }
    toNumber(value) {
        if (utilities_1.is.number(value)) {
            return value;
        }
        if (utilities_1.is.undefined(value)) {
            return Number.NaN;
        }
        if (utilities_1.is.string(value)) {
            if ((0, class_validator_1.isNumberString)(value)) {
                return Number(value);
            }
            // Best guess attempt to resolve parse a date object out of this string
            // https://github.com/wanasit/chrono
            // Might need to break this part of the logic out if it gets more complex tho
            value = (0, chrono_node_1.parseDate)(value);
        }
        if (value instanceof Date) {
            return value.getTime();
        }
        if (value instanceof dayjs_1.default.Dayjs) {
            return value.toDate().getTime();
        }
        this.logger.warn({ value }, `Unknown value type/format, attempting to coerce to number`);
        return Number(value);
    }
};
JSONFilterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auto_log_service_1.AutoLogService !== "undefined" && auto_log_service_1.AutoLogService) === "function" ? _a : Object])
], JSONFilterService);
exports.JSONFilterService = JSONFilterService;


/***/ }),

/***/ "./libs/boilerplate/src/services/lifecycle.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LifecycleService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const module_scanner_service_1 = __webpack_require__("./libs/boilerplate/src/services/explorers/module-scanner.service.ts");
let LifecycleService = class LifecycleService {
    scanner;
    constructor(scanner) {
        this.scanner = scanner;
    }
    async postInit(app, { server, options }) {
        const instances = [];
        this.scanner.applicationProviders().forEach(instance => {
            if (instance.onPostInit) {
                instances.push(instance);
            }
        });
        await (0, utilities_1.eachSeries)(instances, async (instance) => {
            await instance.onPostInit(app, server, options);
        });
    }
    async preInit(app, { server, options }) {
        const instances = [];
        this.scanner.applicationProviders().forEach(instance => {
            if (instance.onPreInit) {
                instances.push(instance);
            }
        });
        await (0, utilities_1.eachSeries)(instances, async (instance) => {
            await instance.onPreInit(app, server, options);
        });
    }
};
LifecycleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof module_scanner_service_1.ModuleScannerService !== "undefined" && module_scanner_service_1.ModuleScannerService) === "function" ? _a : Object])
], LifecycleService);
exports.LifecycleService = LifecycleService;


/***/ }),

/***/ "./libs/boilerplate/src/services/providers/cache-manager.service.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CacheManagerService = void 0;
// TODO: Better warning suppression
exports.CacheManagerService = undefined;


/***/ }),

/***/ "./libs/boilerplate/src/services/providers/cache-provider.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CacheProviderService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const cache_manager_redis_store_1 = __importDefault(__webpack_require__("cache-manager-redis-store"));
const config_1 = __webpack_require__("./libs/boilerplate/src/config.ts");
const inject_config_decorator_1 = __webpack_require__("./libs/boilerplate/src/decorators/injectors/inject-config.decorator.ts");
let CacheProviderService = class CacheProviderService {
    cacheProvider;
    host;
    port;
    defaultTtl;
    constructor(cacheProvider, host, port, defaultTtl) {
        this.cacheProvider = cacheProvider;
        this.host = host;
        this.port = port;
        this.defaultTtl = defaultTtl;
    }
    getConfig() {
        const max = Number.POSITIVE_INFINITY;
        const ttl = this.defaultTtl;
        if (this.cacheProvider === 'memory') {
            return {
                isGlobal: true,
                max,
                ttl,
            };
        }
        return {
            host: this.host,
            isGlobal: true,
            max,
            port: this.port,
            store: cache_manager_redis_store_1.default,
            ttl,
        };
    }
};
CacheProviderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, inject_config_decorator_1.InjectConfig)(config_1.CACHE_PROVIDER)),
    __param(1, (0, inject_config_decorator_1.InjectConfig)(config_1.REDIS_HOST)),
    __param(2, (0, inject_config_decorator_1.InjectConfig)(config_1.REDIS_PORT)),
    __param(3, (0, inject_config_decorator_1.InjectConfig)(config_1.REDIS_DEFAULT_TTL)),
    __metadata("design:paramtypes", [String, String, Number, Number])
], CacheProviderService);
exports.CacheProviderService = CacheProviderService;


/***/ }),

/***/ "./libs/boilerplate/src/services/providers/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/boilerplate/src/services/providers/cache-manager.service.ts"), exports);
__exportStar(__webpack_require__("./libs/boilerplate/src/services/providers/cache-provider.service.ts"), exports);


/***/ }),

/***/ "./libs/boilerplate/src/services/workspace.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WorkspaceService_1, _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkspaceService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const comment_json_1 = __importDefault(__webpack_require__("comment-json"));
const fs_1 = __webpack_require__("fs");
const os_1 = __webpack_require__("os");
const path_1 = __webpack_require__("path");
const process_1 = __webpack_require__("process");
const config_1 = __webpack_require__("./libs/boilerplate/src/config.ts");
const contracts_1 = __webpack_require__("./libs/boilerplate/src/contracts/index.ts");
const decorators_1 = __webpack_require__("./libs/boilerplate/src/decorators/index.ts");
const auto_log_service_1 = __webpack_require__("./libs/boilerplate/src/services/auto-log.service.ts");
/**
 * The workspace file is def not getting out into any builds, seems like a reasonably unique name
 */
const isDevelopment = (0, fs_1.existsSync)((0, path_1.join)((0, process_1.cwd)(), 'steggy.code-workspace'));
let WorkspaceService = WorkspaceService_1 = class WorkspaceService {
    logger;
    application;
    constructor(logger, application) {
        this.logger = logger;
        this.application = application;
        logger.setContext(config_1.LIB_UTILS, WorkspaceService_1);
    }
    IS_DEVELOPMENT = isDevelopment;
    /**
     * package.json
     */
    PACKAGES = new Map();
    ROOT_PACKAGE;
    isWindows = process.platform === 'win32';
    loaded = false;
    /**
     * Find files at:
     * - /etc/{name}/config
     * - /etc/{name}/config.json
     * - /etc/{name}/config.ini
     * - /etc/{name}/config.yaml
     * - /etc/{name}rc
     * - /etc/{name}rc.json
     * - /etc/{name}rc.ini
     * - /etc/{name}rc.yaml
     * - cwd()/.{name}rc
     * - Recursively to system root
     * - cwd()/../.{name}rc
     * - ~/.config/{name}
     * - ~/.config/{name}.json
     * - ~/.config/{name}.ini
     * - ~/.config/{name}.yaml
     * - ~/.config/{name}/config
     * - ~/.config/{name}/config.json
     * - ~/.config/{name}/config.ini
     * - ~/.config/{name}/config.yaml
     */
    get configFilePaths() {
        const out = [];
        const name = this.application.description;
        if (!this.isWindows) {
            out.push(...this.withExtensions((0, path_1.join)(`/etc`, name, 'config')), ...this.withExtensions((0, path_1.join)(`/etc`, `${name}rc`)));
        }
        let current = (0, process_1.cwd)();
        let next;
        while (!utilities_1.is.empty(current)) {
            out.push((0, path_1.join)(current, `.${name}rc`));
            next = (0, path_1.join)(current, '..');
            if (next === current) {
                break;
            }
            current = next;
        }
        out.push(...this.withExtensions((0, path_1.join)((0, os_1.homedir)(), '.config', name)), ...this.withExtensions((0, path_1.join)((0, os_1.homedir)(), '.config', name, 'config')));
        return out;
    }
    initMetadata() {
        if (this.loaded) {
            return;
        }
        this.loaded = true;
        this.loadPackages();
    }
    isApplication(project) {
        return this.application.description === project;
    }
    isProject(project) {
        return this.application.description !== project;
    }
    path(project) {
        return isDevelopment
            ? (0, path_1.join)((0, process_1.cwd)(), `${this.isApplication(project) ? 'apps' : 'libs'}/${project}`, contracts_1.PACKAGE_FILE)
            : (0, path_1.join)(__dirname, 'assets', project ?? this.application.description, contracts_1.PACKAGE_FILE);
    }
    version() {
        const versions = {};
        this.PACKAGES.forEach(({ version }, name) => (versions[name] = version));
        return {
            projects: versions,
            rootVersion: this.ROOT_PACKAGE.version,
            version: versions[this.application.description],
        };
    }
    onModuleInit() {
        this.initMetadata();
    }
    loadPackages() {
        decorators_1.LibraryModule.configs.forEach((meta, project) => {
            const packageFile = this.path(project);
            const exists = (0, fs_1.existsSync)(packageFile);
            if (!exists) {
                return;
            }
            const data = comment_json_1.default.parse((0, fs_1.readFileSync)(packageFile, 'utf8'));
            this.logger.debug(` - [${project}] {${data.version}}`);
            this.PACKAGES.set(project, data);
        });
    }
    withExtensions(path) {
        return [path, `${path}.json`, `${path}.ini`, `${path}.yaml`, `${path}.yml`];
    }
};
WorkspaceService = WorkspaceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(contracts_1.ACTIVE_APPLICATION)),
    __metadata("design:paramtypes", [typeof (_a = typeof auto_log_service_1.AutoLogService !== "undefined" && auto_log_service_1.AutoLogService) === "function" ? _a : Object, Symbol])
], WorkspaceService);
exports.WorkspaceService = WorkspaceService;


/***/ }),

/***/ "./libs/tty/src/config.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CONFIG_APPLICATION_TITLE = exports.LIB_TTY = exports.TEXT_DETAILS = exports.TEXT_HELP = exports.TEXT_INFO = exports.TEXT_IMPORTANT = exports.BORDER_COLOR_ERROR = exports.BORDER_COLOR_WARN = exports.BORDER_COLOR_INACTIVE = exports.BORDER_COLOR_ACTIVE = exports.BACKGROUND_MENU = exports.PAGE_SIZE = exports.PINNED_ITEMS = exports.HEADER_COLOR = exports.DISABLE_CLEAR = exports.BLOCK_PRINT_FG = exports.BLOCK_PRINT_BG = exports.OUTPUT_HEADER_FONT = exports.SECONDARY_HEADER_FONT = exports.DEFAULT_HEADER_FONT = void 0;
exports.DEFAULT_HEADER_FONT = 'DEFAULT_HEADER_FONT';
exports.SECONDARY_HEADER_FONT = 'SECONDARY_HEADER_FONT';
exports.OUTPUT_HEADER_FONT = 'OUTPUT_HEADER_FONT';
exports.BLOCK_PRINT_BG = 'BLOCK_PRINT_BG';
exports.BLOCK_PRINT_FG = 'BLOCK_PRINT_FG';
exports.DISABLE_CLEAR = 'DISABLE_CLEAR';
exports.HEADER_COLOR = 'HEADER_COLOR';
exports.PINNED_ITEMS = 'PINNED_ITEMS';
exports.PAGE_SIZE = 'PAGE_SIZE';
exports.BACKGROUND_MENU = 'BACKGROUND_MENU';
exports.BORDER_COLOR_ACTIVE = 'BORDER_COLOR_ACTIVE';
exports.BORDER_COLOR_INACTIVE = 'BORDER_COLOR_INACTIVE';
exports.BORDER_COLOR_WARN = 'BORDER_COLOR_WARN';
exports.BORDER_COLOR_ERROR = 'BORDER_COLOR_ERROR';
exports.TEXT_IMPORTANT = 'TEXT_IMPORTANT';
exports.TEXT_INFO = 'TEXT_INFO';
exports.TEXT_HELP = 'TEXT_HELP';
exports.TEXT_DETAILS = 'TEXT_DETAILS';
exports.LIB_TTY = Symbol('tty');
exports.CONFIG_APPLICATION_TITLE = Symbol('CONFIG_APPLICATION_TITLE');


/***/ }),

/***/ "./libs/tty/src/contracts/application-stack.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationStackProvider = exports.STACK_PROVIDER = void 0;
exports.STACK_PROVIDER = Symbol('stack-provider');
function ApplicationStackProvider() {
    return function (target) {
        target[exports.STACK_PROVIDER] = true;
    };
}
exports.ApplicationStackProvider = ApplicationStackProvider;


/***/ }),

/***/ "./libs/tty/src/contracts/constants.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TABLE_PARTS = exports.REPL_CONFIG = void 0;
exports.REPL_CONFIG = Symbol('REPL_CONFIG');
exports.TABLE_PARTS = {
    bottom: '─',
    bottom_left: '└',
    bottom_mid: '┴',
    bottom_right: '┘',
    left: '│',
    left_mid: '├',
    mid: '─',
    mid_mid: '┼',
    middle: '│',
    right: '│',
    right_mid: '┤',
    top: '─',
    top_left: '┌',
    top_mid: '┬',
    top_right: '┐',
};


/***/ }),

/***/ "./libs/tty/src/contracts/dto/changelog.dto.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChangeItemDTO = exports.ChangelogDTO = exports.RootChange = exports.ChangeItemMessage = void 0;
const class_validator_1 = __webpack_require__("class-validator");
//
// Don't forget to update the `changelog.schema.json` file!
//
class ChangeItemMessage {
    text;
}
exports.ChangeItemMessage = ChangeItemMessage;
class RootChange {
    message;
    version;
}
exports.RootChange = RootChange;
class ChangelogDTO {
    author;
    changes;
    date;
    root;
    /**
     * Data is being versioned to facilitate potential upgrades in the future
     */
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    version;
}
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ChangelogDTO.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsSemVer)(),
    __metadata("design:type", RootChange)
], ChangelogDTO.prototype, "root", void 0);
exports.ChangelogDTO = ChangelogDTO;
class ChangeItemDTO {
    from;
    message;
    project;
    to;
}
__decorate([
    (0, class_validator_1.IsSemVer)(),
    __metadata("design:type", String)
], ChangeItemDTO.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsSemVer)(),
    __metadata("design:type", String)
], ChangeItemDTO.prototype, "to", void 0);
exports.ChangeItemDTO = ChangeItemDTO;


/***/ }),

/***/ "./libs/tty/src/contracts/dto/git.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitConfigDTO = void 0;
class GitConfigDTO {
    user;
}
exports.GitConfigDTO = GitConfigDTO;


/***/ }),

/***/ "./libs/tty/src/contracts/dto/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/contracts/dto/changelog.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/dto/git.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/dto/nx-affected.dto.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/dto/repl-options.dto.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/contracts/dto/nx-affected.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NXAffected = void 0;
class NXAffected {
    projects;
}
exports.NXAffected = NXAffected;


/***/ }),

/***/ "./libs/tty/src/contracts/dto/repl-options.dto.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReplOptions = void 0;
class ReplOptions {
    category;
    description;
    icon;
    keyOnly;
    keybind;
    name;
}
exports.ReplOptions = ReplOptions;


/***/ }),

/***/ "./libs/tty/src/contracts/i-repl.interface.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/tty/src/contracts/icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ICONS = void 0;
/**
 * Includes emoji and a spacing spacer space... space
 */
exports.ICONS = {
    ACTIVATE: '🏁 ',
    ADMIN: '🚁 ',
    ANIMATION: '📽 ',
    BACK: '🔙 ',
    BRIGHTNESS: '💡 ',
    CAPTURE: '📸 ',
    CIRCADIAN: '🕯 ',
    COLOR: '🏮 ',
    COMMAND: '🎼 ',
    CONFIGURE: '⚙ ',
    COPY: '📋 ',
    CREATE: '➕ ',
    DEBUG: '🐜 ',
    DELETE: '🚫 ',
    DESCRIBE: '🔬 ',
    DESTRUCTIVE: '🚨 ',
    DEVICE: '📟 ',
    DONE: '🗿 ',
    DOWN: '📉 ',
    EDIT: '✏ ',
    ENTITIES: '🗃 ',
    EVENT: '🎆 ',
    GROUPS: '🎳 ',
    GUIDED: '🚌 ',
    HISTORY: '🕵 ',
    LINK: '🔗 ',
    LOGS: '📋 ',
    MANUAL: '🔨 ',
    NAME: '💭 ',
    PIN: '📌 ',
    REFRESH: '🔁 ',
    RENAME: '📑 ',
    ROOMS: '🏡 ',
    ROUTINE: '🛰 ',
    SAVE: '💾 ',
    STATE_MANAGER: '🖼 ',
    SWAP: '🔁 ',
    TOGGLE_OFF: '📪 ',
    TOGGLE_ON: '📫 ',
    TURN_OFF: '🌑 ',
    TURN_ON: '🌞 ',
    UP: '📈 ',
    WARNING: '🚧 ',
};


/***/ }),

/***/ "./libs/tty/src/contracts/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/contracts/application-stack.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/constants.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/dto/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/i-repl.interface.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/inquirer.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/object-builder.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/prompt.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/subflow.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/themeable.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/contracts/inquirer.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/tty/src/contracts/object-builder.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ObjectBuilderOptions = exports.ObjectBuilderElement = exports.ObjectBuilderEnum = exports.OBJECT_BUILDER_ELEMENT = exports.ColumnInfo = exports.TableBuilderOptions = exports.TableBuilderElement = exports.TABLE_CELL_TYPE = void 0;
var TABLE_CELL_TYPE;
(function (TABLE_CELL_TYPE) {
    TABLE_CELL_TYPE["string"] = "string";
    TABLE_CELL_TYPE["confirm"] = "confirm";
    TABLE_CELL_TYPE["boolean"] = "boolean";
    TABLE_CELL_TYPE["number"] = "number";
    TABLE_CELL_TYPE["enum"] = "enum";
    TABLE_CELL_TYPE["date"] = "date";
    TABLE_CELL_TYPE["discriminator"] = "discriminator";
    TABLE_CELL_TYPE["list"] = "list";
})(TABLE_CELL_TYPE = exports.TABLE_CELL_TYPE || (exports.TABLE_CELL_TYPE = {}));
class TableBuilderElement {
    extra;
    format;
    name;
    path;
    type;
}
exports.TableBuilderElement = TableBuilderElement;
class TableBuilderOptions {
    current;
    elements;
    mode;
}
exports.TableBuilderOptions = TableBuilderOptions;
class ColumnInfo {
    maxWidth;
    name;
}
exports.ColumnInfo = ColumnInfo;
var OBJECT_BUILDER_ELEMENT;
(function (OBJECT_BUILDER_ELEMENT) {
    OBJECT_BUILDER_ELEMENT["string"] = "string";
    OBJECT_BUILDER_ELEMENT["boolean"] = "boolean";
    OBJECT_BUILDER_ELEMENT["number"] = "number";
    OBJECT_BUILDER_ELEMENT["enum"] = "enum";
    OBJECT_BUILDER_ELEMENT["date"] = "date";
    OBJECT_BUILDER_ELEMENT["list"] = "list";
})(OBJECT_BUILDER_ELEMENT = exports.OBJECT_BUILDER_ELEMENT || (exports.OBJECT_BUILDER_ELEMENT = {}));
class ObjectBuilderEnum {
    enum;
}
exports.ObjectBuilderEnum = ObjectBuilderEnum;
class ObjectBuilderElement {
    name;
    options;
    path;
    type;
}
exports.ObjectBuilderElement = ObjectBuilderElement;
class ObjectBuilderOptions {
    current;
    elements;
    mode;
}
exports.ObjectBuilderOptions = ObjectBuilderOptions;


/***/ }),

/***/ "./libs/tty/src/contracts/prompt.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IsDone = exports.DONE = void 0;
exports.DONE = 'cancel';
/**
 * Here for future use. In case of additional exit codes
 **/
function IsDone(value) {
    return value === exports.DONE;
}
exports.IsDone = IsDone;


/***/ }),

/***/ "./libs/tty/src/contracts/subflow.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubflowEditorOptions = void 0;
class SubflowEditorOptions {
}
exports.SubflowEditorOptions = SubflowEditorOptions;


/***/ }),

/***/ "./libs/tty/src/contracts/themeable.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MenuBarItem = void 0;
class MenuBarItem {
    color;
    label;
}
exports.MenuBarItem = MenuBarItem;


/***/ }),

/***/ "./libs/tty/src/decorators/component.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Component = exports.COMPONENT_CONFIG = void 0;
const common_1 = __webpack_require__("@nestjs/common");
exports.COMPONENT_CONFIG = Symbol('editor');
function Component(options) {
    return function (target) {
        target[exports.COMPONENT_CONFIG] = options;
        return (0, common_1.Injectable)()(target);
    };
}
exports.Component = Component;


/***/ }),

/***/ "./libs/tty/src/decorators/editor.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Editor = exports.EDITOR_CONFIG = void 0;
const common_1 = __webpack_require__("@nestjs/common");
exports.EDITOR_CONFIG = Symbol('editor');
function Editor(options) {
    return function (target) {
        target[exports.EDITOR_CONFIG] = options;
        return (0, common_1.Injectable)()(target);
    };
}
exports.Editor = Editor;


/***/ }),

/***/ "./libs/tty/src/decorators/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/decorators/component.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/decorators/editor.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/decorators/inquirer.decorator.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/decorators/repl.decorator.ts"), exports);
// Contains app logic
// Must appear at end
__exportStar(__webpack_require__("./libs/tty/src/decorators/quick-script.decorator.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/decorators/inquirer.decorator.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InquirerPrompt = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const cli_cursor_1 = __importDefault(__webpack_require__("cli-cursor"));
const base_1 = __importDefault(__webpack_require__("inquirer/lib/prompts/base"));
const events_1 = __importDefault(__webpack_require__("inquirer/lib/utils/events"));
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
let app;
class InquirerPrompt extends base_1.default {
    static loadApp(load) {
        app = load;
    }
    done;
    localKeyMap;
    async _run(callback) {
        await this.onInit(app);
        this.done = callback;
        const events = (0, events_1.default)(this.rl);
        events.keypress.forEach(this.keyPressHandler.bind(this));
        events.line.forEach(this.keyPressHandler.bind(this));
        cli_cursor_1.default.hide();
        this.render();
        return this;
    }
    onEnd() {
        this.status = 'answered';
        this.render();
        this.screen.done();
        this.done();
        cli_cursor_1.default.show();
    }
    setKeyMap(map) {
        this.localKeyMap = map;
        // Sanity check to make sure all the methods actually exist
        map.forEach(key => {
            if (utilities_1.is.undefined(this[key])) {
                console.log(chalk_1.default.yellow
                    .inverse ` ${contracts_1.ICONS.WARNING}MISSING CALLBACK {bold ${key}} `);
            }
        });
    }
    keyPressHandler(descriptor) {
        if (this.status === 'answered') {
            return;
        }
        const { key } = descriptor;
        const mixed = key?.name ?? key?.sequence ?? 'enter';
        this.localKeyMap.forEach((key, options) => {
            options.key ??= [];
            options.key = Array.isArray(options.key) ? options.key : [options.key];
            if (utilities_1.is.undefined[this[key]]) {
                console.log(`Missing localKeyMap callback ${key}`);
            }
            if (utilities_1.is.empty(options.key)) {
                this[key](mixed);
                return;
            }
            if (!options.key.includes(mixed)) {
                return;
            }
            const result = this[key](mixed);
            if (result === false) {
                return;
            }
            this.render();
        });
    }
}
exports.InquirerPrompt = InquirerPrompt;


/***/ }),

/***/ "./libs/tty/src/decorators/quick-script.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.QuickScript = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const modules_1 = __webpack_require__("./libs/tty/src/modules/index.ts");
/**
 * Magic timeout makes things work. Don't know why process.nextTick() isn't sufficient
 */
const WAIT_BOOTSTRAP = 10;
const ADDITIONAL_WAIT = 5;
const CREATE_BOOT_MODULE = (metadata) => (0, boilerplate_1.ApplicationModule)(metadata)(class {
});
/**
 * Use as an annotation for a single NestJS provider.
 * Will bootstrap a minimal TTY app around the provider, and will use the `exec` method as the entrypoint.
 *
 * Intended for quick / minimal scripts, where it is preferable to keep all application code inside a single file
 */
function QuickScript({ NX_PROJECT, OVERRIDE_DEFAULTS, WAIT_TIME = WAIT_BOOTSTRAP * ADDITIONAL_WAIT, ...options }) {
    if (OVERRIDE_DEFAULTS) {
        boilerplate_1.ApplicationModule.useThisConfig(OVERRIDE_DEFAULTS);
    }
    // Add in the MainCLI module to enable TTY functionality
    options.imports ??= [];
    options.providers ??= [];
    options.imports.push(modules_1.MainCLIModule);
    // Corrective measures for loading metadata
    if (!utilities_1.is.empty(NX_PROJECT)) {
        boilerplate_1.AutoConfigService.NX_PROJECT = NX_PROJECT;
    }
    boilerplate_1.LibraryModule.configs.set(options.application.description, {
        configuration: options.configuration ?? {},
    });
    return function (target) {
        // ? When TS is apploying the @ServiceScript annotation to the target class
        // Set up a fake application module that uses it as the only provider
        // Bootstrap that module, and call the `exec()` method on the target class to officially "start" the app
        //
        setTimeout(() => (0, boilerplate_1.Bootstrap)(CREATE_BOOT_MODULE(options), {
            postInit: [
                app => setTimeout(() => app.get(target).exec(), WAIT_TIME),
            ],
            prettyLog: true,
        }), WAIT_BOOTSTRAP);
        options.providers.push(target);
        return (0, common_1.Injectable)()(target);
    };
}
exports.QuickScript = QuickScript;


/***/ }),

/***/ "./libs/tty/src/decorators/repl.decorator.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Repl = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
function Repl(options) {
    return function (target) {
        target[contracts_1.REPL_CONFIG] = options;
        return (0, common_1.Injectable)()(target);
    };
}
exports.Repl = Repl;


/***/ }),

/***/ "./libs/tty/src/icons/custom-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomIcons = void 0;
var CustomIcons;
(function (CustomIcons) {
    CustomIcons["c"] = "\uE61E";
    CustomIcons["cpp"] = "\uE61D";
    CustomIcons["electron"] = "\uE62E";
    CustomIcons["elixir"] = "\uE62D";
    CustomIcons["elm"] = "\uE62C";
    CustomIcons["folder"] = "\uE5FF";
    CustomIcons["folder_config"] = "\uE5FC";
    CustomIcons["folder_git"] = "\uE5FB";
    CustomIcons["folder_git_branch"] = "\uE5FB";
    CustomIcons["folder_github"] = "\uE5FD";
    CustomIcons["folder_npm"] = "\uE5FA";
    CustomIcons["folder_open"] = "\uE5FE";
    CustomIcons["go"] = "\uE626";
    CustomIcons["msdos"] = "\uE629";
    CustomIcons["vim"] = "\uE62B";
    CustomIcons["windows"] = "\uE62A";
})(CustomIcons = exports.CustomIcons || (exports.CustomIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/dev-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DevIcons = void 0;
var DevIcons;
(function (DevIcons) {
    DevIcons["android"] = "\uE70E";
    DevIcons["angular"] = "\uE753";
    DevIcons["appcelerator"] = "\uE7AB";
    DevIcons["apple"] = "\uE711";
    DevIcons["appstore"] = "\uE713";
    DevIcons["aptana"] = "\uE799";
    DevIcons["asterisk"] = "\uE7AC";
    DevIcons["atlassian"] = "\uE75B";
    DevIcons["atom"] = "\uE764";
    DevIcons["aws"] = "\uE7AD";
    DevIcons["backbone"] = "\uE752";
    DevIcons["bing_small"] = "\uE700";
    DevIcons["bintray"] = "\uE794";
    DevIcons["bitbucket"] = "\uE703";
    DevIcons["blackberry"] = "\uE723";
    DevIcons["bootstrap"] = "\uE747";
    DevIcons["bower"] = "\uE74D";
    DevIcons["brackets"] = "\uE79D";
    DevIcons["bugsense"] = "\uE78D";
    DevIcons["celluloid"] = "\uE76B";
    DevIcons["chart"] = "\uE760";
    DevIcons["chrome"] = "\uE743";
    DevIcons["cisco"] = "\uE765";
    DevIcons["clojure"] = "\uE768";
    DevIcons["clojure_alt"] = "\uE76A";
    DevIcons["cloud9"] = "\uE79F";
    DevIcons["coda"] = "\uE793";
    DevIcons["code"] = "\uE796";
    DevIcons["code_badge"] = "\uE7A3";
    DevIcons["codeigniter"] = "\uE780";
    DevIcons["codepen"] = "\uE716";
    DevIcons["codrops"] = "\uE72F";
    DevIcons["coffeescript"] = "\uE751";
    DevIcons["compass"] = "\uE761";
    DevIcons["composer"] = "\uE783";
    DevIcons["creativecommons"] = "\uE789";
    DevIcons["creativecommons_badge"] = "\uE78A";
    DevIcons["css3"] = "\uE749";
    DevIcons["css3_full"] = "\uE74A";
    DevIcons["css_tricks"] = "\uE701";
    DevIcons["cssdeck"] = "\uE72A";
    DevIcons["dart"] = "\uE798";
    DevIcons["database"] = "\uE706";
    DevIcons["debian"] = "\uE77D";
    DevIcons["digital_ocean"] = "\uE7AE";
    DevIcons["django"] = "\uE71D";
    DevIcons["dlang"] = "\uE7AF";
    DevIcons["docker"] = "\uE7B0";
    DevIcons["doctrine"] = "\uE774";
    DevIcons["dojo"] = "\uE71C";
    DevIcons["dotnet"] = "\uE77F";
    DevIcons["dreamweaver"] = "\uE79C";
    DevIcons["dropbox"] = "\uE707";
    DevIcons["drupal"] = "\uE742";
    DevIcons["eclipse"] = "\uE79E";
    DevIcons["ember"] = "\uE71B";
    DevIcons["envato"] = "\uE75D";
    DevIcons["erlang"] = "\uE7B1";
    DevIcons["extjs"] = "\uE78E";
    DevIcons["firebase"] = "\uE787";
    DevIcons["firefox"] = "\uE745";
    DevIcons["fsharp"] = "\uE7A7";
    DevIcons["ghost"] = "\uE71F";
    DevIcons["ghost_small"] = "\uE714";
    DevIcons["git"] = "\uE702";
    DevIcons["git_branch"] = "\uE725";
    DevIcons["git_commit"] = "\uE729";
    DevIcons["git_compare"] = "\uE728";
    DevIcons["git_merge"] = "\uE727";
    DevIcons["git_pull_request"] = "\uE726";
    DevIcons["github"] = "\uE70A";
    DevIcons["github_alt"] = "\uE708";
    DevIcons["github_badge"] = "\uE709";
    DevIcons["github_full"] = "\uE717";
    DevIcons["gnu"] = "\uE779";
    DevIcons["go"] = "\uE724";
    DevIcons["google_cloud_platform"] = "\uE7B2";
    DevIcons["google_drive"] = "\uE731";
    DevIcons["grails"] = "\uE7B3";
    DevIcons["groovy"] = "\uE775";
    DevIcons["grunt"] = "\uE74C";
    DevIcons["gulp"] = "\uE763";
    DevIcons["hackernews"] = "\uE71A";
    DevIcons["haskell"] = "\uE777";
    DevIcons["heroku"] = "\uE77B";
    DevIcons["html5"] = "\uE736";
    DevIcons["html5_3d_effects"] = "\uE735";
    DevIcons["html5_connectivity"] = "\uE734";
    DevIcons["html5_device_access"] = "\uE733";
    DevIcons["html5_multimedia"] = "\uE732";
    DevIcons["ie"] = "\uE744";
    DevIcons["illustrator"] = "\uE7B4";
    DevIcons["intellij"] = "\uE7B5";
    DevIcons["ionic"] = "\uE7A9";
    DevIcons["java"] = "\uE738";
    DevIcons["javascript"] = "\uE74E";
    DevIcons["javascript_badge"] = "\uE781";
    DevIcons["javascript_shield"] = "\uE74F";
    DevIcons["jekyll_small"] = "\uE70D";
    DevIcons["jenkins"] = "\uE767";
    DevIcons["jira"] = "\uE75C";
    DevIcons["joomla"] = "\uE741";
    DevIcons["jquery"] = "\uE750";
    DevIcons["jquery_ui"] = "\uE754";
    DevIcons["komodo"] = "\uE792";
    DevIcons["krakenjs"] = "\uE785";
    DevIcons["krakenjs_badge"] = "\uE784";
    DevIcons["laravel"] = "\uE73F";
    DevIcons["less"] = "\uE758";
    DevIcons["linux"] = "\uE712";
    DevIcons["magento"] = "\uE740";
    DevIcons["mailchimp"] = "\uE79A";
    DevIcons["markdown"] = "\uE73E";
    DevIcons["materializecss"] = "\uE7B6";
    DevIcons["meteor"] = "\uE7A5";
    DevIcons["meteorfull"] = "\uE7A6";
    DevIcons["mitlicence"] = "\uE78B";
    DevIcons["modernizr"] = "\uE720";
    DevIcons["mongodb"] = "\uE7A4";
    DevIcons["mootools"] = "\uE790";
    DevIcons["mootools_badge"] = "\uE78F";
    DevIcons["mozilla"] = "\uE786";
    DevIcons["msql_server"] = "\uE77C";
    DevIcons["mysql"] = "\uE704";
    DevIcons["nancy"] = "\uE766";
    DevIcons["netbeans"] = "\uE79B";
    DevIcons["netmagazine"] = "\uE72E";
    DevIcons["nginx"] = "\uE776";
    DevIcons["nodejs"] = "\uE719";
    DevIcons["nodejs_small"] = "\uE718";
    DevIcons["npm"] = "\uE71E";
    DevIcons["onedrive"] = "\uE762";
    DevIcons["openshift"] = "\uE7B7";
    DevIcons["opensource"] = "\uE771";
    DevIcons["opera"] = "\uE746";
    DevIcons["perl"] = "\uE769";
    DevIcons["phonegap"] = "\uE730";
    DevIcons["photoshop"] = "\uE7B8";
    DevIcons["php"] = "\uE73D";
    DevIcons["postgresql"] = "\uE76E";
    DevIcons["prolog"] = "\uE7A1";
    DevIcons["python"] = "\uE73C";
    DevIcons["rackspace"] = "\uE7B9";
    DevIcons["raphael"] = "\uE75F";
    DevIcons["rasberry_pi"] = "\uE722";
    DevIcons["react"] = "\uE7BA";
    DevIcons["redhat"] = "\uE7BB";
    DevIcons["redis"] = "\uE76D";
    DevIcons["requirejs"] = "\uE770";
    DevIcons["responsive"] = "\uE797";
    DevIcons["ruby"] = "\uE739";
    DevIcons["ruby_on_rails"] = "\uE73B";
    DevIcons["ruby_rough"] = "\uE791";
    DevIcons["rust"] = "\uE7A8";
    DevIcons["safari"] = "\uE748";
    DevIcons["sass"] = "\uE74B";
    DevIcons["scala"] = "\uE737";
    DevIcons["scriptcs"] = "\uE7BC";
    DevIcons["scrum"] = "\uE7A0";
    DevIcons["senchatouch"] = "\uE78C";
    DevIcons["sizzlejs"] = "\uE788";
    DevIcons["smashing_magazine"] = "\uE72D";
    DevIcons["snap_svg"] = "\uE75E";
    DevIcons["sqllite"] = "\uE7C4";
    DevIcons["stackoverflow"] = "\uE710";
    DevIcons["streamline"] = "\uE705";
    DevIcons["stylus"] = "\uE759";
    DevIcons["sublime"] = "\uE7AA";
    DevIcons["swift"] = "\uE755";
    DevIcons["symfony"] = "\uE756";
    DevIcons["symfony_badge"] = "\uE757";
    DevIcons["techcrunch"] = "\uE72C";
    DevIcons["terminal"] = "\uE795";
    DevIcons["terminal_badge"] = "\uE7A2";
    DevIcons["travis"] = "\uE77E";
    DevIcons["trello"] = "\uE75A";
    DevIcons["typo3"] = "\uE772";
    DevIcons["ubuntu"] = "\uE73A";
    DevIcons["uikit"] = "\uE773";
    DevIcons["unity_small"] = "\uE721";
    DevIcons["vim"] = "\uE7C5";
    DevIcons["visualstudio"] = "\uE70C";
    DevIcons["w3c"] = "\uE76C";
    DevIcons["webplatform"] = "\uE76F";
    DevIcons["windows"] = "\uE70F";
    DevIcons["wordpress"] = "\uE70B";
    DevIcons["yahoo"] = "\uE715";
    DevIcons["yahoo_small"] = "\uE72B";
    DevIcons["yeoman"] = "\uE77A";
    DevIcons["yii"] = "\uE782";
    DevIcons["zend"] = "\uE778";
})(DevIcons = exports.DevIcons || (exports.DevIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/fa-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FontAwesomeIcons = void 0;
var FontAwesomeIcons;
(function (FontAwesomeIcons) {
    FontAwesomeIcons["500px"] = "\uF26E";
    FontAwesomeIcons["address_book"] = "\uF2B9";
    FontAwesomeIcons["address_book_o"] = "\uF2BA";
    FontAwesomeIcons["address_card"] = "\uF2BB";
    FontAwesomeIcons["address_card_o"] = "\uF2BC";
    FontAwesomeIcons["adjust"] = "\uF042";
    FontAwesomeIcons["adn"] = "\uF170";
    FontAwesomeIcons["align_center"] = "\uF037";
    FontAwesomeIcons["align_justify"] = "\uF039";
    FontAwesomeIcons["align_left"] = "\uF036";
    FontAwesomeIcons["align_right"] = "\uF038";
    FontAwesomeIcons["amazon"] = "\uF270";
    FontAwesomeIcons["ambulance"] = "\uF0F9";
    FontAwesomeIcons["american_sign_language_interpreting"] = "\uF2A3";
    FontAwesomeIcons["anchor"] = "\uF13D";
    FontAwesomeIcons["android"] = "\uF17B";
    FontAwesomeIcons["angellist"] = "\uF209";
    FontAwesomeIcons["angle_double_down"] = "\uF103";
    FontAwesomeIcons["angle_double_left"] = "\uF100";
    FontAwesomeIcons["angle_double_right"] = "\uF101";
    FontAwesomeIcons["angle_double_up"] = "\uF102";
    FontAwesomeIcons["angle_down"] = "\uF107";
    FontAwesomeIcons["angle_left"] = "\uF104";
    FontAwesomeIcons["angle_right"] = "\uF105";
    FontAwesomeIcons["angle_up"] = "\uF106";
    FontAwesomeIcons["apple"] = "\uF179";
    FontAwesomeIcons["archive"] = "\uF187";
    FontAwesomeIcons["area_chart"] = "\uF1FE";
    FontAwesomeIcons["arrow_circle_down"] = "\uF0AB";
    FontAwesomeIcons["arrow_circle_left"] = "\uF0A8";
    FontAwesomeIcons["arrow_circle_o_down"] = "\uF01A";
    FontAwesomeIcons["arrow_circle_o_left"] = "\uF190";
    FontAwesomeIcons["arrow_circle_o_right"] = "\uF18E";
    FontAwesomeIcons["arrow_circle_o_up"] = "\uF01B";
    FontAwesomeIcons["arrow_circle_right"] = "\uF0A9";
    FontAwesomeIcons["arrow_circle_up"] = "\uF0AA";
    FontAwesomeIcons["arrow_down"] = "\uF063";
    FontAwesomeIcons["arrow_left"] = "\uF060";
    FontAwesomeIcons["arrow_right"] = "\uF061";
    FontAwesomeIcons["arrow_up"] = "\uF062";
    FontAwesomeIcons["arrows"] = "\uF047";
    FontAwesomeIcons["arrows_alt"] = "\uF0B2";
    FontAwesomeIcons["arrows_h"] = "\uF07E";
    FontAwesomeIcons["arrows_v"] = "\uF07D";
    FontAwesomeIcons["asl_interpreting"] = "\uF2A3";
    FontAwesomeIcons["assistive_listening_systems"] = "\uF2A2";
    FontAwesomeIcons["asterisk"] = "\uF069";
    FontAwesomeIcons["at"] = "\uF1FA";
    FontAwesomeIcons["audio_description"] = "\uF29E";
    FontAwesomeIcons["automobile"] = "\uF1B9";
    FontAwesomeIcons["backward"] = "\uF04A";
    FontAwesomeIcons["balance_scale"] = "\uF24E";
    FontAwesomeIcons["ban"] = "\uF05E";
    FontAwesomeIcons["bandcamp"] = "\uF2D5";
    FontAwesomeIcons["bank"] = "\uF19C";
    FontAwesomeIcons["bar_chart"] = "\uF080";
    FontAwesomeIcons["bar_chart_o"] = "\uF080";
    FontAwesomeIcons["barcode"] = "\uF02A";
    FontAwesomeIcons["bars"] = "\uF0C9";
    FontAwesomeIcons["bath"] = "\uF2CD";
    FontAwesomeIcons["bathtub"] = "\uF2CD";
    FontAwesomeIcons["battery"] = "\uF240";
    FontAwesomeIcons["battery_0"] = "\uF244";
    FontAwesomeIcons["battery_1"] = "\uF243";
    FontAwesomeIcons["battery_2"] = "\uF242";
    FontAwesomeIcons["battery_3"] = "\uF241";
    FontAwesomeIcons["battery_4"] = "\uF240";
    FontAwesomeIcons["battery_empty"] = "\uF244";
    FontAwesomeIcons["battery_full"] = "\uF240";
    FontAwesomeIcons["battery_half"] = "\uF242";
    FontAwesomeIcons["battery_quarter"] = "\uF243";
    FontAwesomeIcons["battery_three_quarters"] = "\uF241";
    FontAwesomeIcons["bed"] = "\uF236";
    FontAwesomeIcons["beer"] = "\uF0FC";
    FontAwesomeIcons["behance"] = "\uF1B4";
    FontAwesomeIcons["behance_square"] = "\uF1B5";
    FontAwesomeIcons["bell"] = "\uF0F3";
    FontAwesomeIcons["bell_o"] = "\uF0A2";
    FontAwesomeIcons["bell_slash"] = "\uF1F6";
    FontAwesomeIcons["bell_slash_o"] = "\uF1F7";
    FontAwesomeIcons["bicycle"] = "\uF206";
    FontAwesomeIcons["binoculars"] = "\uF1E5";
    FontAwesomeIcons["birthday_cake"] = "\uF1FD";
    FontAwesomeIcons["bitbucket"] = "\uF171";
    FontAwesomeIcons["bitbucket_square"] = "\uF172";
    FontAwesomeIcons["bitcoin"] = "\uF15A";
    FontAwesomeIcons["black_tie"] = "\uF27E";
    FontAwesomeIcons["blind"] = "\uF29D";
    FontAwesomeIcons["bluetooth"] = "\uF293";
    FontAwesomeIcons["bluetooth_b"] = "\uF294";
    FontAwesomeIcons["bold"] = "\uF032";
    FontAwesomeIcons["bolt"] = "\uF0E7";
    FontAwesomeIcons["bomb"] = "\uF1E2";
    FontAwesomeIcons["book"] = "\uF02D";
    FontAwesomeIcons["bookmark"] = "\uF02E";
    FontAwesomeIcons["bookmark_o"] = "\uF097";
    FontAwesomeIcons["braille"] = "\uF2A1";
    FontAwesomeIcons["briefcase"] = "\uF0B1";
    FontAwesomeIcons["btc"] = "\uF15A";
    FontAwesomeIcons["bug"] = "\uF188";
    FontAwesomeIcons["building"] = "\uF1AD";
    FontAwesomeIcons["building_o"] = "\uF0F7";
    FontAwesomeIcons["bullhorn"] = "\uF0A1";
    FontAwesomeIcons["bullseye"] = "\uF140";
    FontAwesomeIcons["bus"] = "\uF207";
    FontAwesomeIcons["buysellads"] = "\uF20D";
    FontAwesomeIcons["cab"] = "\uF1BA";
    FontAwesomeIcons["calculator"] = "\uF1EC";
    FontAwesomeIcons["calendar"] = "\uF073";
    FontAwesomeIcons["calendar_check_o"] = "\uF274";
    FontAwesomeIcons["calendar_minus_o"] = "\uF272";
    FontAwesomeIcons["calendar_o"] = "\uF133";
    FontAwesomeIcons["calendar_plus_o"] = "\uF271";
    FontAwesomeIcons["calendar_times_o"] = "\uF273";
    FontAwesomeIcons["camera"] = "\uF030";
    FontAwesomeIcons["camera_retro"] = "\uF083";
    FontAwesomeIcons["car"] = "\uF1B9";
    FontAwesomeIcons["caret_down"] = "\uF0D7";
    FontAwesomeIcons["caret_left"] = "\uF0D9";
    FontAwesomeIcons["caret_right"] = "\uF0DA";
    FontAwesomeIcons["caret_square_o_down"] = "\uF150";
    FontAwesomeIcons["caret_square_o_left"] = "\uF191";
    FontAwesomeIcons["caret_square_o_right"] = "\uF152";
    FontAwesomeIcons["caret_square_o_up"] = "\uF151";
    FontAwesomeIcons["caret_up"] = "\uF0D8";
    FontAwesomeIcons["cart_arrow_down"] = "\uF218";
    FontAwesomeIcons["cart_plus"] = "\uF217";
    FontAwesomeIcons["cc"] = "\uF20A";
    FontAwesomeIcons["cc_amex"] = "\uF1F3";
    FontAwesomeIcons["cc_diners_club"] = "\uF24C";
    FontAwesomeIcons["cc_discover"] = "\uF1F2";
    FontAwesomeIcons["cc_jcb"] = "\uF24B";
    FontAwesomeIcons["cc_mastercard"] = "\uF1F1";
    FontAwesomeIcons["cc_paypal"] = "\uF1F4";
    FontAwesomeIcons["cc_stripe"] = "\uF1F5";
    FontAwesomeIcons["cc_visa"] = "\uF1F0";
    FontAwesomeIcons["certificate"] = "\uF0A3";
    FontAwesomeIcons["chain"] = "\uF0C1";
    FontAwesomeIcons["chain_broken"] = "\uF127";
    FontAwesomeIcons["check"] = "\uF00C";
    FontAwesomeIcons["check_circle"] = "\uF058";
    FontAwesomeIcons["check_circle_o"] = "\uF05D";
    FontAwesomeIcons["check_square"] = "\uF14A";
    FontAwesomeIcons["check_square_o"] = "\uF046";
    FontAwesomeIcons["chevron_circle_down"] = "\uF13A";
    FontAwesomeIcons["chevron_circle_left"] = "\uF137";
    FontAwesomeIcons["chevron_circle_right"] = "\uF138";
    FontAwesomeIcons["chevron_circle_up"] = "\uF139";
    FontAwesomeIcons["chevron_down"] = "\uF078";
    FontAwesomeIcons["chevron_left"] = "\uF053";
    FontAwesomeIcons["chevron_right"] = "\uF054";
    FontAwesomeIcons["chevron_up"] = "\uF077";
    FontAwesomeIcons["child"] = "\uF1AE";
    FontAwesomeIcons["chrome"] = "\uF268";
    FontAwesomeIcons["circle"] = "\uF111";
    FontAwesomeIcons["circle_o"] = "\uF10C";
    FontAwesomeIcons["circle_o_notch"] = "\uF1CE";
    FontAwesomeIcons["circle_thin"] = "\uF1DB";
    FontAwesomeIcons["clipboard"] = "\uF0EA";
    FontAwesomeIcons["clock_o"] = "\uF017";
    FontAwesomeIcons["clone"] = "\uF24D";
    FontAwesomeIcons["close"] = "\uF00D";
    FontAwesomeIcons["cloud"] = "\uF0C2";
    FontAwesomeIcons["cloud_download"] = "\uF0ED";
    FontAwesomeIcons["cloud_upload"] = "\uF0EE";
    FontAwesomeIcons["cny"] = "\uF157";
    FontAwesomeIcons["code"] = "\uF121";
    FontAwesomeIcons["code_fork"] = "\uF126";
    FontAwesomeIcons["codepen"] = "\uF1CB";
    FontAwesomeIcons["codiepie"] = "\uF284";
    FontAwesomeIcons["coffee"] = "\uF0F4";
    FontAwesomeIcons["cog"] = "\uF013";
    FontAwesomeIcons["cogs"] = "\uF085";
    FontAwesomeIcons["columns"] = "\uF0DB";
    FontAwesomeIcons["comment"] = "\uF075";
    FontAwesomeIcons["comment_o"] = "\uF0E5";
    FontAwesomeIcons["commenting"] = "\uF27A";
    FontAwesomeIcons["commenting_o"] = "\uF27B";
    FontAwesomeIcons["comments"] = "\uF086";
    FontAwesomeIcons["comments_o"] = "\uF0E6";
    FontAwesomeIcons["compass"] = "\uF14E";
    FontAwesomeIcons["compress"] = "\uF066";
    FontAwesomeIcons["connectdevelop"] = "\uF20E";
    FontAwesomeIcons["contao"] = "\uF26D";
    FontAwesomeIcons["copy"] = "\uF0C5";
    FontAwesomeIcons["copyright"] = "\uF1F9";
    FontAwesomeIcons["creative_commons"] = "\uF25E";
    FontAwesomeIcons["credit_card"] = "\uF09D";
    FontAwesomeIcons["credit_card_alt"] = "\uF283";
    FontAwesomeIcons["crop"] = "\uF125";
    FontAwesomeIcons["crosshairs"] = "\uF05B";
    FontAwesomeIcons["css3"] = "\uF13C";
    FontAwesomeIcons["cube"] = "\uF1B2";
    FontAwesomeIcons["cubes"] = "\uF1B3";
    FontAwesomeIcons["cut"] = "\uF0C4";
    FontAwesomeIcons["cutlery"] = "\uF0F5";
    FontAwesomeIcons["dashboard"] = "\uF0E4";
    FontAwesomeIcons["dashcube"] = "\uF210";
    FontAwesomeIcons["database"] = "\uF1C0";
    FontAwesomeIcons["deaf"] = "\uF2A4";
    FontAwesomeIcons["deafness"] = "\uF2A4";
    FontAwesomeIcons["dedent"] = "\uF03B";
    FontAwesomeIcons["delicious"] = "\uF1A5";
    FontAwesomeIcons["desktop"] = "\uF108";
    FontAwesomeIcons["deviantart"] = "\uF1BD";
    FontAwesomeIcons["diamond"] = "\uF219";
    FontAwesomeIcons["digg"] = "\uF1A6";
    FontAwesomeIcons["dollar"] = "\uF155";
    FontAwesomeIcons["dot_circle_o"] = "\uF192";
    FontAwesomeIcons["download"] = "\uF019";
    FontAwesomeIcons["dribbble"] = "\uF17D";
    FontAwesomeIcons["drivers_license"] = "\uF2C2";
    FontAwesomeIcons["drivers_license_o"] = "\uF2C3";
    FontAwesomeIcons["dropbox"] = "\uF16B";
    FontAwesomeIcons["drupal"] = "\uF1A9";
    FontAwesomeIcons["edge"] = "\uF282";
    FontAwesomeIcons["edit"] = "\uF044";
    FontAwesomeIcons["eercast"] = "\uF2DA";
    FontAwesomeIcons["eject"] = "\uF052";
    FontAwesomeIcons["ellipsis_h"] = "\uF141";
    FontAwesomeIcons["ellipsis_v"] = "\uF142";
    FontAwesomeIcons["empire"] = "\uF1D1";
    FontAwesomeIcons["envelope"] = "\uF0E0";
    FontAwesomeIcons["envelope_o"] = "\uF003";
    FontAwesomeIcons["envelope_open"] = "\uF2B6";
    FontAwesomeIcons["envelope_open_o"] = "\uF2B7";
    FontAwesomeIcons["envelope_square"] = "\uF199";
    FontAwesomeIcons["envira"] = "\uF299";
    FontAwesomeIcons["eraser"] = "\uF12D";
    FontAwesomeIcons["etsy"] = "\uF2D7";
    FontAwesomeIcons["eur"] = "\uF153";
    FontAwesomeIcons["euro"] = "\uF153";
    FontAwesomeIcons["exchange"] = "\uF0EC";
    FontAwesomeIcons["exclamation"] = "\uF12A";
    FontAwesomeIcons["exclamation_circle"] = "\uF06A";
    FontAwesomeIcons["exclamation_triangle"] = "\uF071";
    FontAwesomeIcons["expand"] = "\uF065";
    FontAwesomeIcons["expeditedssl"] = "\uF23E";
    FontAwesomeIcons["external_link"] = "\uF08E";
    FontAwesomeIcons["external_link_square"] = "\uF14C";
    FontAwesomeIcons["eye"] = "\uF06E";
    FontAwesomeIcons["eye_slash"] = "\uF070";
    FontAwesomeIcons["eyedropper"] = "\uF1FB";
    FontAwesomeIcons["fa"] = "\uF2B4";
    FontAwesomeIcons["facebook"] = "\uF09A";
    FontAwesomeIcons["facebook_f"] = "\uF09A";
    FontAwesomeIcons["facebook_official"] = "\uF230";
    FontAwesomeIcons["facebook_square"] = "\uF082";
    FontAwesomeIcons["fast_backward"] = "\uF049";
    FontAwesomeIcons["fast_forward"] = "\uF050";
    FontAwesomeIcons["fax"] = "\uF1AC";
    FontAwesomeIcons["feed"] = "\uF09E";
    FontAwesomeIcons["female"] = "\uF182";
    FontAwesomeIcons["fighter_jet"] = "\uF0FB";
    FontAwesomeIcons["file"] = "\uF15B";
    FontAwesomeIcons["file_archive_o"] = "\uF1C6";
    FontAwesomeIcons["file_audio_o"] = "\uF1C7";
    FontAwesomeIcons["file_code_o"] = "\uF1C9";
    FontAwesomeIcons["file_excel_o"] = "\uF1C3";
    FontAwesomeIcons["file_image_o"] = "\uF1C5";
    FontAwesomeIcons["file_movie_o"] = "\uF1C8";
    FontAwesomeIcons["file_o"] = "\uF016";
    FontAwesomeIcons["file_pdf_o"] = "\uF1C1";
    FontAwesomeIcons["file_photo_o"] = "\uF1C5";
    FontAwesomeIcons["file_picture_o"] = "\uF1C5";
    FontAwesomeIcons["file_powerpoint_o"] = "\uF1C4";
    FontAwesomeIcons["file_sound_o"] = "\uF1C7";
    FontAwesomeIcons["file_text"] = "\uF15C";
    FontAwesomeIcons["file_text_o"] = "\uF0F6";
    FontAwesomeIcons["file_video_o"] = "\uF1C8";
    FontAwesomeIcons["file_word_o"] = "\uF1C2";
    FontAwesomeIcons["file_zip_o"] = "\uF1C6";
    FontAwesomeIcons["files_o"] = "\uF0C5";
    FontAwesomeIcons["film"] = "\uF008";
    FontAwesomeIcons["filter"] = "\uF0B0";
    FontAwesomeIcons["fire"] = "\uF06D";
    FontAwesomeIcons["fire_extinguisher"] = "\uF134";
    FontAwesomeIcons["firefox"] = "\uF269";
    FontAwesomeIcons["first_order"] = "\uF2B0";
    FontAwesomeIcons["flag"] = "\uF024";
    FontAwesomeIcons["flag_checkered"] = "\uF11E";
    FontAwesomeIcons["flag_o"] = "\uF11D";
    FontAwesomeIcons["flash"] = "\uF0E7";
    FontAwesomeIcons["flask"] = "\uF0C3";
    FontAwesomeIcons["flickr"] = "\uF16E";
    FontAwesomeIcons["floppy_o"] = "\uF0C7";
    FontAwesomeIcons["folder"] = "\uF07B";
    FontAwesomeIcons["folder_o"] = "\uF114";
    FontAwesomeIcons["folder_open"] = "\uF07C";
    FontAwesomeIcons["folder_open_o"] = "\uF115";
    FontAwesomeIcons["font"] = "\uF031";
    FontAwesomeIcons["font_awesome"] = "\uF2B4";
    FontAwesomeIcons["fonticons"] = "\uF280";
    FontAwesomeIcons["fort_awesome"] = "\uF286";
    FontAwesomeIcons["forumbee"] = "\uF211";
    FontAwesomeIcons["forward"] = "\uF04E";
    FontAwesomeIcons["foursquare"] = "\uF180";
    FontAwesomeIcons["free_code_camp"] = "\uF2C5";
    FontAwesomeIcons["frown_o"] = "\uF119";
    FontAwesomeIcons["futbol_o"] = "\uF1E3";
    FontAwesomeIcons["gamepad"] = "\uF11B";
    FontAwesomeIcons["gavel"] = "\uF0E3";
    FontAwesomeIcons["gbp"] = "\uF154";
    FontAwesomeIcons["ge"] = "\uF1D1";
    FontAwesomeIcons["gear"] = "\uF013";
    FontAwesomeIcons["gears"] = "\uF085";
    FontAwesomeIcons["genderless"] = "\uF22D";
    FontAwesomeIcons["get_pocket"] = "\uF265";
    FontAwesomeIcons["gg"] = "\uF260";
    FontAwesomeIcons["gg_circle"] = "\uF261";
    FontAwesomeIcons["gift"] = "\uF06B";
    FontAwesomeIcons["git"] = "\uF1D3";
    FontAwesomeIcons["git_square"] = "\uF1D2";
    FontAwesomeIcons["github"] = "\uF09B";
    FontAwesomeIcons["github_alt"] = "\uF113";
    FontAwesomeIcons["github_square"] = "\uF092";
    FontAwesomeIcons["gitlab"] = "\uF296";
    FontAwesomeIcons["gittip"] = "\uF184";
    FontAwesomeIcons["glass"] = "\uF000";
    FontAwesomeIcons["glide"] = "\uF2A5";
    FontAwesomeIcons["glide_g"] = "\uF2A6";
    FontAwesomeIcons["globe"] = "\uF0AC";
    FontAwesomeIcons["google"] = "\uF1A0";
    FontAwesomeIcons["google_plus"] = "\uF0D5";
    FontAwesomeIcons["google_plus_circle"] = "\uF2B3";
    FontAwesomeIcons["google_plus_official"] = "\uF2B3";
    FontAwesomeIcons["google_plus_square"] = "\uF0D4";
    FontAwesomeIcons["google_wallet"] = "\uF1EE";
    FontAwesomeIcons["graduation_cap"] = "\uF19D";
    FontAwesomeIcons["gratipay"] = "\uF184";
    FontAwesomeIcons["grav"] = "\uF2D6";
    FontAwesomeIcons["group"] = "\uF0C0";
    FontAwesomeIcons["h_square"] = "\uF0FD";
    FontAwesomeIcons["hacker_news"] = "\uF1D4";
    FontAwesomeIcons["hand_grab_o"] = "\uF255";
    FontAwesomeIcons["hand_lizard_o"] = "\uF258";
    FontAwesomeIcons["hand_o_down"] = "\uF0A7";
    FontAwesomeIcons["hand_o_left"] = "\uF0A5";
    FontAwesomeIcons["hand_o_right"] = "\uF0A4";
    FontAwesomeIcons["hand_o_up"] = "\uF0A6";
    FontAwesomeIcons["hand_paper_o"] = "\uF256";
    FontAwesomeIcons["hand_peace_o"] = "\uF25B";
    FontAwesomeIcons["hand_pointer_o"] = "\uF25A";
    FontAwesomeIcons["hand_rock_o"] = "\uF255";
    FontAwesomeIcons["hand_scissors_o"] = "\uF257";
    FontAwesomeIcons["hand_spock_o"] = "\uF259";
    FontAwesomeIcons["hand_stop_o"] = "\uF256";
    FontAwesomeIcons["handshake_o"] = "\uF2B5";
    FontAwesomeIcons["hard_of_hearing"] = "\uF2A4";
    FontAwesomeIcons["hashtag"] = "\uF292";
    FontAwesomeIcons["hdd_o"] = "\uF0A0";
    FontAwesomeIcons["header"] = "\uF1DC";
    FontAwesomeIcons["headphones"] = "\uF025";
    FontAwesomeIcons["heart"] = "\uF004";
    FontAwesomeIcons["heart_o"] = "\uF08A";
    FontAwesomeIcons["heartbeat"] = "\uF21E";
    FontAwesomeIcons["history"] = "\uF1DA";
    FontAwesomeIcons["home"] = "\uF015";
    FontAwesomeIcons["hospital_o"] = "\uF0F8";
    FontAwesomeIcons["hotel"] = "\uF236";
    FontAwesomeIcons["hourglass"] = "\uF254";
    FontAwesomeIcons["hourglass_1"] = "\uF251";
    FontAwesomeIcons["hourglass_2"] = "\uF252";
    FontAwesomeIcons["hourglass_3"] = "\uF253";
    FontAwesomeIcons["hourglass_end"] = "\uF253";
    FontAwesomeIcons["hourglass_half"] = "\uF252";
    FontAwesomeIcons["hourglass_o"] = "\uF250";
    FontAwesomeIcons["hourglass_start"] = "\uF251";
    FontAwesomeIcons["houzz"] = "\uF27C";
    FontAwesomeIcons["html5"] = "\uF13B";
    FontAwesomeIcons["i_cursor"] = "\uF246";
    FontAwesomeIcons["id_badge"] = "\uF2C1";
    FontAwesomeIcons["id_card"] = "\uF2C2";
    FontAwesomeIcons["id_card_o"] = "\uF2C3";
    FontAwesomeIcons["ils"] = "\uF20B";
    FontAwesomeIcons["image"] = "\uF03E";
    FontAwesomeIcons["imdb"] = "\uF2D8";
    FontAwesomeIcons["inbox"] = "\uF01C";
    FontAwesomeIcons["indent"] = "\uF03C";
    FontAwesomeIcons["industry"] = "\uF275";
    FontAwesomeIcons["info"] = "\uF129";
    FontAwesomeIcons["info_circle"] = "\uF05A";
    FontAwesomeIcons["inr"] = "\uF156";
    FontAwesomeIcons["instagram"] = "\uF16D";
    FontAwesomeIcons["institution"] = "\uF19C";
    FontAwesomeIcons["internet_explorer"] = "\uF26B";
    FontAwesomeIcons["intersex"] = "\uF224";
    FontAwesomeIcons["ioxhost"] = "\uF208";
    FontAwesomeIcons["italic"] = "\uF033";
    FontAwesomeIcons["joomla"] = "\uF1AA";
    FontAwesomeIcons["jpy"] = "\uF157";
    FontAwesomeIcons["jsfiddle"] = "\uF1CC";
    FontAwesomeIcons["key"] = "\uF084";
    FontAwesomeIcons["keyboard_o"] = "\uF11C";
    FontAwesomeIcons["krw"] = "\uF159";
    FontAwesomeIcons["language"] = "\uF1AB";
    FontAwesomeIcons["laptop"] = "\uF109";
    FontAwesomeIcons["lastfm"] = "\uF202";
    FontAwesomeIcons["lastfm_square"] = "\uF203";
    FontAwesomeIcons["leaf"] = "\uF06C";
    FontAwesomeIcons["leanpub"] = "\uF212";
    FontAwesomeIcons["legal"] = "\uF0E3";
    FontAwesomeIcons["lemon_o"] = "\uF094";
    FontAwesomeIcons["level_down"] = "\uF149";
    FontAwesomeIcons["level_up"] = "\uF148";
    FontAwesomeIcons["life_bouy"] = "\uF1CD";
    FontAwesomeIcons["life_buoy"] = "\uF1CD";
    FontAwesomeIcons["life_ring"] = "\uF1CD";
    FontAwesomeIcons["life_saver"] = "\uF1CD";
    FontAwesomeIcons["lightbulb_o"] = "\uF0EB";
    FontAwesomeIcons["line_chart"] = "\uF201";
    FontAwesomeIcons["link"] = "\uF0C1";
    FontAwesomeIcons["linkedin"] = "\uF0E1";
    FontAwesomeIcons["linkedin_square"] = "\uF08C";
    FontAwesomeIcons["linode"] = "\uF2B8";
    FontAwesomeIcons["linux"] = "\uF17C";
    FontAwesomeIcons["list"] = "\uF03A";
    FontAwesomeIcons["list_alt"] = "\uF022";
    FontAwesomeIcons["list_ol"] = "\uF0CB";
    FontAwesomeIcons["list_ul"] = "\uF0CA";
    FontAwesomeIcons["location_arrow"] = "\uF124";
    FontAwesomeIcons["lock"] = "\uF023";
    FontAwesomeIcons["long_arrow_down"] = "\uF175";
    FontAwesomeIcons["long_arrow_left"] = "\uF177";
    FontAwesomeIcons["long_arrow_right"] = "\uF178";
    FontAwesomeIcons["long_arrow_up"] = "\uF176";
    FontAwesomeIcons["low_vision"] = "\uF2A8";
    FontAwesomeIcons["magic"] = "\uF0D0";
    FontAwesomeIcons["magnet"] = "\uF076";
    FontAwesomeIcons["mail_forward"] = "\uF064";
    FontAwesomeIcons["mail_reply"] = "\uF112";
    FontAwesomeIcons["mail_reply_all"] = "\uF122";
    FontAwesomeIcons["male"] = "\uF183";
    FontAwesomeIcons["map"] = "\uF279";
    FontAwesomeIcons["map_marker"] = "\uF041";
    FontAwesomeIcons["map_o"] = "\uF278";
    FontAwesomeIcons["map_pin"] = "\uF276";
    FontAwesomeIcons["map_signs"] = "\uF277";
    FontAwesomeIcons["mars"] = "\uF222";
    FontAwesomeIcons["mars_double"] = "\uF227";
    FontAwesomeIcons["mars_stroke"] = "\uF229";
    FontAwesomeIcons["mars_stroke_h"] = "\uF22B";
    FontAwesomeIcons["mars_stroke_v"] = "\uF22A";
    FontAwesomeIcons["maxcdn"] = "\uF136";
    FontAwesomeIcons["meanpath"] = "\uF20C";
    FontAwesomeIcons["medium"] = "\uF23A";
    FontAwesomeIcons["medkit"] = "\uF0FA";
    FontAwesomeIcons["meetup"] = "\uF2E0";
    FontAwesomeIcons["meh_o"] = "\uF11A";
    FontAwesomeIcons["mercury"] = "\uF223";
    FontAwesomeIcons["microchip"] = "\uF2DB";
    FontAwesomeIcons["microphone"] = "\uF130";
    FontAwesomeIcons["microphone_slash"] = "\uF131";
    FontAwesomeIcons["minus"] = "\uF068";
    FontAwesomeIcons["minus_circle"] = "\uF056";
    FontAwesomeIcons["minus_square"] = "\uF146";
    FontAwesomeIcons["minus_square_o"] = "\uF147";
    FontAwesomeIcons["mixcloud"] = "\uF289";
    FontAwesomeIcons["mobile"] = "\uF10B";
    FontAwesomeIcons["mobile_phone"] = "\uF10B";
    FontAwesomeIcons["modx"] = "\uF285";
    FontAwesomeIcons["money"] = "\uF0D6";
    FontAwesomeIcons["moon_o"] = "\uF186";
    FontAwesomeIcons["mortar_board"] = "\uF19D";
    FontAwesomeIcons["motorcycle"] = "\uF21C";
    FontAwesomeIcons["mouse_pointer"] = "\uF245";
    FontAwesomeIcons["music"] = "\uF001";
    FontAwesomeIcons["navicon"] = "\uF0C9";
    FontAwesomeIcons["neuter"] = "\uF22C";
    FontAwesomeIcons["newspaper_o"] = "\uF1EA";
    FontAwesomeIcons["object_group"] = "\uF247";
    FontAwesomeIcons["object_ungroup"] = "\uF248";
    FontAwesomeIcons["odnoklassniki"] = "\uF263";
    FontAwesomeIcons["odnoklassniki_square"] = "\uF264";
    FontAwesomeIcons["opencart"] = "\uF23D";
    FontAwesomeIcons["openid"] = "\uF19B";
    FontAwesomeIcons["opera"] = "\uF26A";
    FontAwesomeIcons["optin_monster"] = "\uF23C";
    FontAwesomeIcons["outdent"] = "\uF03B";
    FontAwesomeIcons["pagelines"] = "\uF18C";
    FontAwesomeIcons["paint_brush"] = "\uF1FC";
    FontAwesomeIcons["paper_plane"] = "\uF1D8";
    FontAwesomeIcons["paper_plane_o"] = "\uF1D9";
    FontAwesomeIcons["paperclip"] = "\uF0C6";
    FontAwesomeIcons["paragraph"] = "\uF1DD";
    FontAwesomeIcons["paste"] = "\uF0EA";
    FontAwesomeIcons["pause"] = "\uF04C";
    FontAwesomeIcons["pause_circle"] = "\uF28B";
    FontAwesomeIcons["pause_circle_o"] = "\uF28C";
    FontAwesomeIcons["paw"] = "\uF1B0";
    FontAwesomeIcons["paypal"] = "\uF1ED";
    FontAwesomeIcons["pencil"] = "\uF040";
    FontAwesomeIcons["pencil_square"] = "\uF14B";
    FontAwesomeIcons["pencil_square_o"] = "\uF044";
    FontAwesomeIcons["percent"] = "\uF295";
    FontAwesomeIcons["phone"] = "\uF095";
    FontAwesomeIcons["phone_square"] = "\uF098";
    FontAwesomeIcons["photo"] = "\uF03E";
    FontAwesomeIcons["picture_o"] = "\uF03E";
    FontAwesomeIcons["pie_chart"] = "\uF200";
    FontAwesomeIcons["pied_piper"] = "\uF2AE";
    FontAwesomeIcons["pied_piper_alt"] = "\uF1A8";
    FontAwesomeIcons["pied_piper_pp"] = "\uF1A7";
    FontAwesomeIcons["pinterest"] = "\uF0D2";
    FontAwesomeIcons["pinterest_p"] = "\uF231";
    FontAwesomeIcons["pinterest_square"] = "\uF0D3";
    FontAwesomeIcons["plane"] = "\uF072";
    FontAwesomeIcons["play"] = "\uF04B";
    FontAwesomeIcons["play_circle"] = "\uF144";
    FontAwesomeIcons["play_circle_o"] = "\uF01D";
    FontAwesomeIcons["plug"] = "\uF1E6";
    FontAwesomeIcons["plus"] = "\uF067";
    FontAwesomeIcons["plus_circle"] = "\uF055";
    FontAwesomeIcons["plus_square"] = "\uF0FE";
    FontAwesomeIcons["plus_square_o"] = "\uF196";
    FontAwesomeIcons["podcast"] = "\uF2CE";
    FontAwesomeIcons["power_off"] = "\uF011";
    FontAwesomeIcons["print"] = "\uF02F";
    FontAwesomeIcons["product_hunt"] = "\uF288";
    FontAwesomeIcons["puzzle_piece"] = "\uF12E";
    FontAwesomeIcons["qq"] = "\uF1D6";
    FontAwesomeIcons["qrcode"] = "\uF029";
    FontAwesomeIcons["question"] = "\uF128";
    FontAwesomeIcons["question_circle"] = "\uF059";
    FontAwesomeIcons["question_circle_o"] = "\uF29C";
    FontAwesomeIcons["quora"] = "\uF2C4";
    FontAwesomeIcons["quote_left"] = "\uF10D";
    FontAwesomeIcons["quote_right"] = "\uF10E";
    FontAwesomeIcons["ra"] = "\uF1D0";
    FontAwesomeIcons["random"] = "\uF074";
    FontAwesomeIcons["ravelry"] = "\uF2D9";
    FontAwesomeIcons["rebel"] = "\uF1D0";
    FontAwesomeIcons["recycle"] = "\uF1B8";
    FontAwesomeIcons["sofa"] = "\uE203";
    FontAwesomeIcons["refrigerator"] = "\uE23B";
    FontAwesomeIcons["reddit"] = "\uF1A1";
    FontAwesomeIcons["reddit_alien"] = "\uF281";
    FontAwesomeIcons["reddit_square"] = "\uF1A2";
    FontAwesomeIcons["refresh"] = "\uF021";
    FontAwesomeIcons["registered"] = "\uF25D";
    FontAwesomeIcons["remove"] = "\uF00D";
    FontAwesomeIcons["renren"] = "\uF18B";
    FontAwesomeIcons["reorder"] = "\uF0C9";
    FontAwesomeIcons["repeat"] = "\uF01E";
    FontAwesomeIcons["reply"] = "\uF112";
    FontAwesomeIcons["reply_all"] = "\uF122";
    FontAwesomeIcons["resistance"] = "\uF1D0";
    FontAwesomeIcons["retweet"] = "\uF079";
    FontAwesomeIcons["rmb"] = "\uF157";
    FontAwesomeIcons["road"] = "\uF018";
    FontAwesomeIcons["rocket"] = "\uF135";
    FontAwesomeIcons["rotate_left"] = "\uF0E2";
    FontAwesomeIcons["rotate_right"] = "\uF01E";
    FontAwesomeIcons["rouble"] = "\uF158";
    FontAwesomeIcons["rss"] = "\uF09E";
    FontAwesomeIcons["rss_square"] = "\uF143";
    FontAwesomeIcons["rub"] = "\uF158";
    FontAwesomeIcons["ruble"] = "\uF158";
    FontAwesomeIcons["rupee"] = "\uF156";
    FontAwesomeIcons["s15"] = "\uF2CD";
    FontAwesomeIcons["safari"] = "\uF267";
    FontAwesomeIcons["save"] = "\uF0C7";
    FontAwesomeIcons["scissors"] = "\uF0C4";
    FontAwesomeIcons["scribd"] = "\uF28A";
    FontAwesomeIcons["search"] = "\uF002";
    FontAwesomeIcons["search_minus"] = "\uF010";
    FontAwesomeIcons["search_plus"] = "\uF00E";
    FontAwesomeIcons["sellsy"] = "\uF213";
    FontAwesomeIcons["send"] = "\uF1D8";
    FontAwesomeIcons["send_o"] = "\uF1D9";
    FontAwesomeIcons["server"] = "\uF233";
    FontAwesomeIcons["share"] = "\uF064";
    FontAwesomeIcons["share_alt"] = "\uF1E0";
    FontAwesomeIcons["share_alt_square"] = "\uF1E1";
    FontAwesomeIcons["share_square"] = "\uF14D";
    FontAwesomeIcons["share_square_o"] = "\uF045";
    FontAwesomeIcons["shekel"] = "\uF20B";
    FontAwesomeIcons["sheqel"] = "\uF20B";
    FontAwesomeIcons["shield"] = "\uF132";
    FontAwesomeIcons["ship"] = "\uF21A";
    FontAwesomeIcons["shirtsinbulk"] = "\uF214";
    FontAwesomeIcons["shopping_bag"] = "\uF290";
    FontAwesomeIcons["shopping_basket"] = "\uF291";
    FontAwesomeIcons["shopping_cart"] = "\uF07A";
    FontAwesomeIcons["shower"] = "\uF2CC";
    FontAwesomeIcons["sign_in"] = "\uF090";
    FontAwesomeIcons["sign_language"] = "\uF2A7";
    FontAwesomeIcons["sign_out"] = "\uF08B";
    FontAwesomeIcons["signal"] = "\uF012";
    FontAwesomeIcons["signing"] = "\uF2A7";
    FontAwesomeIcons["simplybuilt"] = "\uF215";
    FontAwesomeIcons["sitemap"] = "\uF0E8";
    FontAwesomeIcons["skyatlas"] = "\uF216";
    FontAwesomeIcons["skype"] = "\uF17E";
    FontAwesomeIcons["slack"] = "\uF198";
    FontAwesomeIcons["sliders"] = "\uF1DE";
    FontAwesomeIcons["slideshare"] = "\uF1E7";
    FontAwesomeIcons["smile_o"] = "\uF118";
    FontAwesomeIcons["snapchat"] = "\uF2AB";
    FontAwesomeIcons["snapchat_ghost"] = "\uF2AC";
    FontAwesomeIcons["snapchat_square"] = "\uF2AD";
    FontAwesomeIcons["snowflake_o"] = "\uF2DC";
    FontAwesomeIcons["soccer_ball_o"] = "\uF1E3";
    FontAwesomeIcons["sort"] = "\uF0DC";
    FontAwesomeIcons["sort_alpha_asc"] = "\uF15D";
    FontAwesomeIcons["sort_alpha_desc"] = "\uF15E";
    FontAwesomeIcons["sort_amount_asc"] = "\uF160";
    FontAwesomeIcons["sort_amount_desc"] = "\uF161";
    FontAwesomeIcons["sort_asc"] = "\uF0DE";
    FontAwesomeIcons["sort_desc"] = "\uF0DD";
    FontAwesomeIcons["sort_down"] = "\uF0DD";
    FontAwesomeIcons["sort_numeric_asc"] = "\uF162";
    FontAwesomeIcons["sort_numeric_desc"] = "\uF163";
    FontAwesomeIcons["sort_up"] = "\uF0DE";
    FontAwesomeIcons["soundcloud"] = "\uF1BE";
    FontAwesomeIcons["space_shuttle"] = "\uF197";
    FontAwesomeIcons["spinner"] = "\uF110";
    FontAwesomeIcons["spoon"] = "\uF1B1";
    FontAwesomeIcons["spotify"] = "\uF1BC";
    FontAwesomeIcons["square"] = "\uF0C8";
    FontAwesomeIcons["square_o"] = "\uF096";
    FontAwesomeIcons["stack_exchange"] = "\uF18D";
    FontAwesomeIcons["stack_overflow"] = "\uF16C";
    FontAwesomeIcons["star"] = "\uF005";
    FontAwesomeIcons["star_half"] = "\uF089";
    FontAwesomeIcons["star_half_empty"] = "\uF123";
    FontAwesomeIcons["star_half_full"] = "\uF123";
    FontAwesomeIcons["star_half_o"] = "\uF123";
    FontAwesomeIcons["star_o"] = "\uF006";
    FontAwesomeIcons["steam"] = "\uF1B6";
    FontAwesomeIcons["steam_square"] = "\uF1B7";
    FontAwesomeIcons["step_backward"] = "\uF048";
    FontAwesomeIcons["step_forward"] = "\uF051";
    FontAwesomeIcons["stethoscope"] = "\uF0F1";
    FontAwesomeIcons["sticky_note"] = "\uF249";
    FontAwesomeIcons["sticky_note_o"] = "\uF24A";
    FontAwesomeIcons["stop"] = "\uF04D";
    FontAwesomeIcons["stop_circle"] = "\uF28D";
    FontAwesomeIcons["stop_circle_o"] = "\uF28E";
    FontAwesomeIcons["street_view"] = "\uF21D";
    FontAwesomeIcons["strikethrough"] = "\uF0CC";
    FontAwesomeIcons["stumbleupon"] = "\uF1A4";
    FontAwesomeIcons["stumbleupon_circle"] = "\uF1A3";
    FontAwesomeIcons["subscript"] = "\uF12C";
    FontAwesomeIcons["subway"] = "\uF239";
    FontAwesomeIcons["suitcase"] = "\uF0F2";
    FontAwesomeIcons["sun_o"] = "\uF185";
    FontAwesomeIcons["superpowers"] = "\uF2DD";
    FontAwesomeIcons["superscript"] = "\uF12B";
    FontAwesomeIcons["support"] = "\uF1CD";
    FontAwesomeIcons["table"] = "\uF0CE";
    FontAwesomeIcons["tablet"] = "\uF10A";
    FontAwesomeIcons["tachometer"] = "\uF0E4";
    FontAwesomeIcons["tag"] = "\uF02B";
    FontAwesomeIcons["tags"] = "\uF02C";
    FontAwesomeIcons["tasks"] = "\uF0AE";
    FontAwesomeIcons["taxi"] = "\uF1BA";
    FontAwesomeIcons["telegram"] = "\uF2C6";
    FontAwesomeIcons["television"] = "\uF26C";
    FontAwesomeIcons["tencent_weibo"] = "\uF1D5";
    FontAwesomeIcons["terminal"] = "\uF120";
    FontAwesomeIcons["text_height"] = "\uF034";
    FontAwesomeIcons["text_width"] = "\uF035";
    FontAwesomeIcons["th"] = "\uF00A";
    FontAwesomeIcons["th_large"] = "\uF009";
    FontAwesomeIcons["th_list"] = "\uF00B";
    FontAwesomeIcons["themeisle"] = "\uF2B2";
    FontAwesomeIcons["thermometer"] = "\uF2C7";
    FontAwesomeIcons["thermometer_0"] = "\uF2CB";
    FontAwesomeIcons["thermometer_1"] = "\uF2CA";
    FontAwesomeIcons["thermometer_2"] = "\uF2C9";
    FontAwesomeIcons["thermometer_3"] = "\uF2C8";
    FontAwesomeIcons["thermometer_4"] = "\uF2C7";
    FontAwesomeIcons["thermometer_empty"] = "\uF2CB";
    FontAwesomeIcons["thermometer_full"] = "\uF2C7";
    FontAwesomeIcons["thermometer_half"] = "\uF2C9";
    FontAwesomeIcons["thermometer_quarter"] = "\uF2CA";
    FontAwesomeIcons["thermometer_three_quarters"] = "\uF2C8";
    FontAwesomeIcons["thumb_tack"] = "\uF08D";
    FontAwesomeIcons["thumbs_down"] = "\uF165";
    FontAwesomeIcons["thumbs_o_down"] = "\uF088";
    FontAwesomeIcons["thumbs_o_up"] = "\uF087";
    FontAwesomeIcons["thumbs_up"] = "\uF164";
    FontAwesomeIcons["ticket"] = "\uF145";
    FontAwesomeIcons["times"] = "\uF00D";
    FontAwesomeIcons["times_circle"] = "\uF057";
    FontAwesomeIcons["times_circle_o"] = "\uF05C";
    FontAwesomeIcons["times_rectangle"] = "\uF2D3";
    FontAwesomeIcons["times_rectangle_o"] = "\uF2D4";
    FontAwesomeIcons["tint"] = "\uF043";
    FontAwesomeIcons["toggle_down"] = "\uF150";
    FontAwesomeIcons["toggle_left"] = "\uF191";
    FontAwesomeIcons["toggle_off"] = "\uF204";
    FontAwesomeIcons["toggle_on"] = "\uF205";
    FontAwesomeIcons["toggle_right"] = "\uF152";
    FontAwesomeIcons["toggle_up"] = "\uF151";
    FontAwesomeIcons["trademark"] = "\uF25C";
    FontAwesomeIcons["train"] = "\uF238";
    FontAwesomeIcons["transgender"] = "\uF224";
    FontAwesomeIcons["transgender_alt"] = "\uF225";
    FontAwesomeIcons["trash"] = "\uF1F8";
    FontAwesomeIcons["trash_o"] = "\uF014";
    FontAwesomeIcons["tree"] = "\uF1BB";
    FontAwesomeIcons["trello"] = "\uF181";
    FontAwesomeIcons["tripadvisor"] = "\uF262";
    FontAwesomeIcons["trophy"] = "\uF091";
    FontAwesomeIcons["truck"] = "\uF0D1";
    FontAwesomeIcons["try"] = "\uF195";
    FontAwesomeIcons["tty"] = "\uF1E4";
    FontAwesomeIcons["tumblr"] = "\uF173";
    FontAwesomeIcons["tumblr_square"] = "\uF174";
    FontAwesomeIcons["turkish_lira"] = "\uF195";
    FontAwesomeIcons["tv"] = "\uF26C";
    FontAwesomeIcons["twitch"] = "\uF1E8";
    FontAwesomeIcons["twitter"] = "\uF099";
    FontAwesomeIcons["twitter_square"] = "\uF081";
    FontAwesomeIcons["umbrella"] = "\uF0E9";
    FontAwesomeIcons["underline"] = "\uF0CD";
    FontAwesomeIcons["undo"] = "\uF0E2";
    FontAwesomeIcons["universal_access"] = "\uF29A";
    FontAwesomeIcons["university"] = "\uF19C";
    FontAwesomeIcons["unlink"] = "\uF127";
    FontAwesomeIcons["unlock"] = "\uF09C";
    FontAwesomeIcons["unlock_alt"] = "\uF13E";
    FontAwesomeIcons["unsorted"] = "\uF0DC";
    FontAwesomeIcons["upload"] = "\uF093";
    FontAwesomeIcons["usb"] = "\uF287";
    FontAwesomeIcons["usd"] = "\uF155";
    FontAwesomeIcons["user"] = "\uF007";
    FontAwesomeIcons["user_circle"] = "\uF2BD";
    FontAwesomeIcons["user_circle_o"] = "\uF2BE";
    FontAwesomeIcons["user_md"] = "\uF0F0";
    FontAwesomeIcons["user_o"] = "\uF2C0";
    FontAwesomeIcons["user_plus"] = "\uF234";
    FontAwesomeIcons["user_secret"] = "\uF21B";
    FontAwesomeIcons["user_times"] = "\uF235";
    FontAwesomeIcons["users"] = "\uF0C0";
    FontAwesomeIcons["vcard"] = "\uF2BB";
    FontAwesomeIcons["vcard_o"] = "\uF2BC";
    FontAwesomeIcons["venus"] = "\uF221";
    FontAwesomeIcons["venus_double"] = "\uF226";
    FontAwesomeIcons["venus_mars"] = "\uF228";
    FontAwesomeIcons["viacoin"] = "\uF237";
    FontAwesomeIcons["viadeo"] = "\uF2A9";
    FontAwesomeIcons["viadeo_square"] = "\uF2AA";
    FontAwesomeIcons["video_camera"] = "\uF03D";
    FontAwesomeIcons["vimeo"] = "\uF27D";
    FontAwesomeIcons["vimeo_square"] = "\uF194";
    FontAwesomeIcons["vine"] = "\uF1CA";
    FontAwesomeIcons["vk"] = "\uF189";
    FontAwesomeIcons["volume_control_phone"] = "\uF2A0";
    FontAwesomeIcons["volume_down"] = "\uF027";
    FontAwesomeIcons["volume_off"] = "\uF026";
    FontAwesomeIcons["volume_up"] = "\uF028";
    FontAwesomeIcons["warning"] = "\uF071";
    FontAwesomeIcons["wechat"] = "\uF1D7";
    FontAwesomeIcons["weibo"] = "\uF18A";
    FontAwesomeIcons["weixin"] = "\uF1D7";
    FontAwesomeIcons["whatsapp"] = "\uF232";
    FontAwesomeIcons["wheelchair"] = "\uF193";
    FontAwesomeIcons["wheelchair_alt"] = "\uF29B";
    FontAwesomeIcons["wifi"] = "\uF1EB";
    FontAwesomeIcons["wikipedia_w"] = "\uF266";
    FontAwesomeIcons["window_close"] = "\uF2D3";
    FontAwesomeIcons["window_close_o"] = "\uF2D4";
    FontAwesomeIcons["window_maximize"] = "\uF2D0";
    FontAwesomeIcons["window_minimize"] = "\uF2D1";
    FontAwesomeIcons["window_restore"] = "\uF2D2";
    FontAwesomeIcons["windows"] = "\uF17A";
    FontAwesomeIcons["won"] = "\uF159";
    FontAwesomeIcons["wordpress"] = "\uF19A";
    FontAwesomeIcons["wpbeginner"] = "\uF297";
    FontAwesomeIcons["wpexplorer"] = "\uF2DE";
    FontAwesomeIcons["wpforms"] = "\uF298";
    FontAwesomeIcons["wrench"] = "\uF0AD";
    FontAwesomeIcons["xing"] = "\uF168";
    FontAwesomeIcons["xing_square"] = "\uF169";
    FontAwesomeIcons["y_combinator"] = "\uF23B";
    FontAwesomeIcons["y_combinator_square"] = "\uF1D4";
    FontAwesomeIcons["yahoo"] = "\uF19E";
    FontAwesomeIcons["yc"] = "\uF23B";
    FontAwesomeIcons["yc_square"] = "\uF1D4";
    FontAwesomeIcons["yelp"] = "\uF1E9";
    FontAwesomeIcons["yen"] = "\uF157";
    FontAwesomeIcons["yoast"] = "\uF2B1";
    FontAwesomeIcons["youtube"] = "\uF167";
    FontAwesomeIcons["youtube_play"] = "\uF16A";
    FontAwesomeIcons["youtube_square"] = "\uF166";
})(FontAwesomeIcons = exports.FontAwesomeIcons || (exports.FontAwesomeIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/fae-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FontAwesomeExtendedIcons = void 0;
var FontAwesomeExtendedIcons;
(function (FontAwesomeExtendedIcons) {
    FontAwesomeExtendedIcons["apple_fruit"] = "\uE29E";
    FontAwesomeExtendedIcons["atom"] = "\uE27F";
    FontAwesomeExtendedIcons["bacteria"] = "\uE280";
    FontAwesomeExtendedIcons["banana"] = "\uE281";
    FontAwesomeExtendedIcons["bath"] = "\uE282";
    FontAwesomeExtendedIcons["bed"] = "\uE283";
    FontAwesomeExtendedIcons["benzene"] = "\uE284";
    FontAwesomeExtendedIcons["bigger"] = "\uE285";
    FontAwesomeExtendedIcons["biohazard"] = "\uE286";
    FontAwesomeExtendedIcons["blogger_circle"] = "\uE287";
    FontAwesomeExtendedIcons["blogger_square"] = "\uE288";
    FontAwesomeExtendedIcons["bones"] = "\uE289";
    FontAwesomeExtendedIcons["book_open"] = "\uE28A";
    FontAwesomeExtendedIcons["book_open_o"] = "\uE28B";
    FontAwesomeExtendedIcons["brain"] = "\uE28C";
    FontAwesomeExtendedIcons["bread"] = "\uE28D";
    FontAwesomeExtendedIcons["butterfly"] = "\uE28E";
    FontAwesomeExtendedIcons["carot"] = "\uE28F";
    FontAwesomeExtendedIcons["cc_by"] = "\uE290";
    FontAwesomeExtendedIcons["cc_cc"] = "\uE291";
    FontAwesomeExtendedIcons["cc_nc"] = "\uE292";
    FontAwesomeExtendedIcons["cc_nc_eu"] = "\uE293";
    FontAwesomeExtendedIcons["cc_nc_jp"] = "\uE294";
    FontAwesomeExtendedIcons["cc_nd"] = "\uE295";
    FontAwesomeExtendedIcons["cc_remix"] = "\uE296";
    FontAwesomeExtendedIcons["cc_sa"] = "\uE297";
    FontAwesomeExtendedIcons["cc_share"] = "\uE298";
    FontAwesomeExtendedIcons["cc_zero"] = "\uE299";
    FontAwesomeExtendedIcons["checklist_o"] = "\uE29A";
    FontAwesomeExtendedIcons["cherry"] = "\uE29B";
    FontAwesomeExtendedIcons["chess_bishop"] = "\uE29C";
    FontAwesomeExtendedIcons["chess_horse"] = "\uE25F";
    FontAwesomeExtendedIcons["chess_king"] = "\uE260";
    FontAwesomeExtendedIcons["chess_pawn"] = "\uE261";
    FontAwesomeExtendedIcons["chess_queen"] = "\uE262";
    FontAwesomeExtendedIcons["chess_tower"] = "\uE263";
    FontAwesomeExtendedIcons["cheese"] = "\uE264";
    FontAwesomeExtendedIcons["chicken_thigh"] = "\uE29F";
    FontAwesomeExtendedIcons["chilli"] = "\uE265";
    FontAwesomeExtendedIcons["chip"] = "\uE266";
    FontAwesomeExtendedIcons["cicling"] = "\uE267";
    FontAwesomeExtendedIcons["cloud"] = "\uE268";
    FontAwesomeExtendedIcons["cockroach"] = "\uE269";
    FontAwesomeExtendedIcons["coffe_beans"] = "\uE26A";
    FontAwesomeExtendedIcons["coins"] = "\uE26B";
    FontAwesomeExtendedIcons["comb"] = "\uE26C";
    FontAwesomeExtendedIcons["comet"] = "\uE26D";
    FontAwesomeExtendedIcons["crown"] = "\uE26E";
    FontAwesomeExtendedIcons["cup_coffe"] = "\uE26F";
    FontAwesomeExtendedIcons["dice"] = "\uE270";
    FontAwesomeExtendedIcons["disco"] = "\uE271";
    FontAwesomeExtendedIcons["dna"] = "\uE272";
    FontAwesomeExtendedIcons["donut"] = "\uE273";
    FontAwesomeExtendedIcons["dress"] = "\uE274";
    FontAwesomeExtendedIcons["drop"] = "\uE275";
    FontAwesomeExtendedIcons["ello"] = "\uE276";
    FontAwesomeExtendedIcons["envelope_open"] = "\uE277";
    FontAwesomeExtendedIcons["envelope_open_o"] = "\uE278";
    FontAwesomeExtendedIcons["equal"] = "\uE279";
    FontAwesomeExtendedIcons["equal_bigger"] = "\uE27A";
    FontAwesomeExtendedIcons["feedly"] = "\uE27B";
    FontAwesomeExtendedIcons["file_export"] = "\uE27C";
    FontAwesomeExtendedIcons["file_import"] = "\uE27D";
    FontAwesomeExtendedIcons["fingerprint"] = "\uE23F";
    FontAwesomeExtendedIcons["floppy"] = "\uE240";
    FontAwesomeExtendedIcons["footprint"] = "\uE241";
    FontAwesomeExtendedIcons["freecodecamp"] = "\uE242";
    FontAwesomeExtendedIcons["galaxy"] = "\uE243";
    FontAwesomeExtendedIcons["galery"] = "\uE244";
    FontAwesomeExtendedIcons["gift_card"] = "\uE2A0";
    FontAwesomeExtendedIcons["glass"] = "\uE245";
    FontAwesomeExtendedIcons["google_drive"] = "\uE246";
    FontAwesomeExtendedIcons["google_play"] = "\uE247";
    FontAwesomeExtendedIcons["gps"] = "\uE248";
    FontAwesomeExtendedIcons["grav"] = "\uE249";
    FontAwesomeExtendedIcons["guitar"] = "\uE24A";
    FontAwesomeExtendedIcons["gut"] = "\uE24B";
    FontAwesomeExtendedIcons["halter"] = "\uE24C";
    FontAwesomeExtendedIcons["hamburger"] = "\uE24D";
    FontAwesomeExtendedIcons["hat"] = "\uE24E";
    FontAwesomeExtendedIcons["hexagon"] = "\uE24F";
    FontAwesomeExtendedIcons["high_heel"] = "\uE250";
    FontAwesomeExtendedIcons["hotdog"] = "\uE251";
    FontAwesomeExtendedIcons["ice_cream"] = "\uE252";
    FontAwesomeExtendedIcons["id_card"] = "\uE253";
    FontAwesomeExtendedIcons["imdb"] = "\uE254";
    FontAwesomeExtendedIcons["infinity"] = "\uE255";
    FontAwesomeExtendedIcons["injection"] = "\uE2A1";
    FontAwesomeExtendedIcons["isle"] = "\uE2A2";
    FontAwesomeExtendedIcons["java"] = "\uE256";
    FontAwesomeExtendedIcons["layers"] = "\uE257";
    FontAwesomeExtendedIcons["lips"] = "\uE258";
    FontAwesomeExtendedIcons["lipstick"] = "\uE259";
    FontAwesomeExtendedIcons["liver"] = "\uE25A";
    FontAwesomeExtendedIcons["lollipop"] = "\uE2A3";
    FontAwesomeExtendedIcons["loyalty_card"] = "\uE2A4";
    FontAwesomeExtendedIcons["lung"] = "\uE25B";
    FontAwesomeExtendedIcons["makeup_brushes"] = "\uE25C";
    FontAwesomeExtendedIcons["maximize"] = "\uE25D";
    FontAwesomeExtendedIcons["meat"] = "\uE2A5";
    FontAwesomeExtendedIcons["medicine"] = "\uE221";
    FontAwesomeExtendedIcons["microscope"] = "\uE222";
    FontAwesomeExtendedIcons["milk_bottle"] = "\uE223";
    FontAwesomeExtendedIcons["minimize"] = "\uE224";
    FontAwesomeExtendedIcons["molecule"] = "\uE225";
    FontAwesomeExtendedIcons["moon_cloud"] = "\uE226";
    FontAwesomeExtendedIcons["mountains"] = "\uE2A6";
    FontAwesomeExtendedIcons["mushroom"] = "\uE227";
    FontAwesomeExtendedIcons["mustache"] = "\uE228";
    FontAwesomeExtendedIcons["mysql"] = "\uE229";
    FontAwesomeExtendedIcons["nintendo"] = "\uE22A";
    FontAwesomeExtendedIcons["orange"] = "\uE2A7";
    FontAwesomeExtendedIcons["palette_color"] = "\uE22B";
    FontAwesomeExtendedIcons["peach"] = "\uE2A8";
    FontAwesomeExtendedIcons["pear"] = "\uE2A9";
    FontAwesomeExtendedIcons["pi"] = "\uE22C";
    FontAwesomeExtendedIcons["pizza"] = "\uE22D";
    FontAwesomeExtendedIcons["planet"] = "\uE22E";
    FontAwesomeExtendedIcons["plant"] = "\uE22F";
    FontAwesomeExtendedIcons["playstation"] = "\uE230";
    FontAwesomeExtendedIcons["poison"] = "\uE231";
    FontAwesomeExtendedIcons["popcorn"] = "\uE232";
    FontAwesomeExtendedIcons["popsicle"] = "\uE233";
    FontAwesomeExtendedIcons["pulse"] = "\uE234";
    FontAwesomeExtendedIcons["python"] = "\uE235";
    FontAwesomeExtendedIcons["quora_circle"] = "\uE236";
    FontAwesomeExtendedIcons["quora_square"] = "\uE237";
    FontAwesomeExtendedIcons["radioactive"] = "\uE238";
    FontAwesomeExtendedIcons["raining"] = "\uE239";
    FontAwesomeExtendedIcons["real_heart"] = "\uE23A";
    FontAwesomeExtendedIcons["refrigerator"] = "\uE23B";
    FontAwesomeExtendedIcons["restore"] = "\uE23C";
    FontAwesomeExtendedIcons["ring"] = "\uE23D";
    FontAwesomeExtendedIcons["ruby"] = "\uE23E";
    FontAwesomeExtendedIcons["ruby_o"] = "\uE21E";
    FontAwesomeExtendedIcons["ruler"] = "\uE21F";
    FontAwesomeExtendedIcons["shirt"] = "\uE218";
    FontAwesomeExtendedIcons["slash"] = "\uE216";
    FontAwesomeExtendedIcons["smaller"] = "\uE200";
    FontAwesomeExtendedIcons["snowing"] = "\uE201";
    FontAwesomeExtendedIcons["soda"] = "\uE202";
    FontAwesomeExtendedIcons["sofa"] = "\uE203";
    FontAwesomeExtendedIcons["soup"] = "\uE204";
    FontAwesomeExtendedIcons["spermatozoon"] = "\uE205";
    FontAwesomeExtendedIcons["spin_double"] = "\uE206";
    FontAwesomeExtendedIcons["stomach"] = "\uE207";
    FontAwesomeExtendedIcons["storm"] = "\uE208";
    FontAwesomeExtendedIcons["sun_cloud"] = "\uE21D";
    FontAwesomeExtendedIcons["sushi"] = "\uE21A";
    FontAwesomeExtendedIcons["tacos"] = "\uE219";
    FontAwesomeExtendedIcons["telegram"] = "\uE217";
    FontAwesomeExtendedIcons["telegram_circle"] = "\uE215";
    FontAwesomeExtendedIcons["telescope"] = "\uE209";
    FontAwesomeExtendedIcons["thermometer"] = "\uE20A";
    FontAwesomeExtendedIcons["thermometer_high"] = "\uE20B";
    FontAwesomeExtendedIcons["thermometer_low"] = "\uE20C";
    FontAwesomeExtendedIcons["thin_close"] = "\uE20D";
    FontAwesomeExtendedIcons["toilet"] = "\uE20E";
    FontAwesomeExtendedIcons["tools"] = "\uE20F";
    FontAwesomeExtendedIcons["tooth"] = "\uE210";
    FontAwesomeExtendedIcons["tree"] = "\uE21C";
    FontAwesomeExtendedIcons["triangle_ruler"] = "\uE21B";
    FontAwesomeExtendedIcons["umbrella"] = "\uE220";
    FontAwesomeExtendedIcons["uterus"] = "\uE211";
    FontAwesomeExtendedIcons["virus"] = "\uE214";
    FontAwesomeExtendedIcons["w3c"] = "\uE212";
    FontAwesomeExtendedIcons["walking"] = "\uE213";
    FontAwesomeExtendedIcons["wallet"] = "\uE25E";
    FontAwesomeExtendedIcons["wind"] = "\uE27E";
    FontAwesomeExtendedIcons["xbox"] = "\uE29D";
})(FontAwesomeExtendedIcons = exports.FontAwesomeExtendedIcons || (exports.FontAwesomeExtendedIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// https://www.nerdfonts.com/cheat-sheet
__exportStar(__webpack_require__("./libs/tty/src/icons/custom-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/dev-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/fa-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/fae-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/linux-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/mdi-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/misc-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/oct-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/pl-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/pom-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/set-icons.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/weather-icons.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/icons/linux-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LinuxIcons = void 0;
var LinuxIcons;
(function (LinuxIcons) {
    LinuxIcons["alpine"] = "\uF300";
    LinuxIcons["aosc"] = "\uF301";
    LinuxIcons["apple"] = "\uF302";
    LinuxIcons["archlinux"] = "\uF303";
    LinuxIcons["centos"] = "\uF304";
    LinuxIcons["coreos"] = "\uF305";
    LinuxIcons["debian"] = "\uF306";
    LinuxIcons["devuan"] = "\uF307";
    LinuxIcons["docker"] = "\uF308";
    LinuxIcons["elementary"] = "\uF309";
    LinuxIcons["fedora"] = "\uF30A";
    LinuxIcons["fedora_inverse"] = "\uF30B";
    LinuxIcons["freebsd"] = "\uF30C";
    LinuxIcons["gentoo"] = "\uF30D";
    LinuxIcons["linuxmint"] = "\uF30E";
    LinuxIcons["linuxmint_inverse"] = "\uF30F";
    LinuxIcons["mageia"] = "\uF310";
    LinuxIcons["mandriva"] = "\uF311";
    LinuxIcons["manjaro"] = "\uF312";
    LinuxIcons["nixos"] = "\uF313";
    LinuxIcons["opensuse"] = "\uF314";
    LinuxIcons["raspberry_pi"] = "\uF315";
    LinuxIcons["redhat"] = "\uF316";
    LinuxIcons["sabayon"] = "\uF317";
    LinuxIcons["slackware"] = "\uF318";
    LinuxIcons["slackware_inverse"] = "\uF319";
    LinuxIcons["tux"] = "\uF31A";
    LinuxIcons["ubuntu"] = "\uF31B";
    LinuxIcons["ubuntu_inverse"] = "\uF31C";
})(LinuxIcons = exports.LinuxIcons || (exports.LinuxIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/mdi-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MDIIcons = void 0;
var MDIIcons;
(function (MDIIcons) {
    MDIIcons["access_point"] = "\uF501";
    MDIIcons["access_point_network"] = "\uF502";
    MDIIcons["account"] = "\uF503";
    MDIIcons["account_alert"] = "\uF504";
    MDIIcons["account_box"] = "\uF505";
    MDIIcons["account_box_outline"] = "\uF506";
    MDIIcons["account_card_details"] = "\uFAD1";
    MDIIcons["account_check"] = "\uF507";
    MDIIcons["account_circle"] = "\uF508";
    MDIIcons["account_convert"] = "\uF509";
    MDIIcons["account_edit"] = "\uFBBA";
    MDIIcons["account_key"] = "\uF50A";
    MDIIcons["account_location"] = "\uF50B";
    MDIIcons["account_minus"] = "\uF50C";
    MDIIcons["account_multiple"] = "\uF50D";
    MDIIcons["account_multiple_minus"] = "\uFAD2";
    MDIIcons["account_multiple_outline"] = "\uF50E";
    MDIIcons["account_multiple_plus"] = "\uF50F";
    MDIIcons["account_multiple_plus_outline"] = "\uFCFE";
    MDIIcons["account_network"] = "\uF510";
    MDIIcons["account_off"] = "\uF511";
    MDIIcons["account_outline"] = "\uF512";
    MDIIcons["account_plus"] = "\uF513";
    MDIIcons["account_plus_outline"] = "\uFCFF";
    MDIIcons["account_remove"] = "\uF514";
    MDIIcons["account_search"] = "\uF515";
    MDIIcons["account_settings"] = "\uFB2F";
    MDIIcons["account_settings_variant"] = "\uFB30";
    MDIIcons["account_star"] = "\uF516";
    MDIIcons["account_switch"] = "\uF518";
    MDIIcons["adjust"] = "\uF519";
    MDIIcons["air_conditioner"] = "\uF51A";
    MDIIcons["airballoon"] = "\uF51B";
    MDIIcons["airplane"] = "\uF51C";
    MDIIcons["airplane_landing"] = "\uFAD3";
    MDIIcons["airplane_off"] = "\uF51D";
    MDIIcons["airplane_takeoff"] = "\uFAD4";
    MDIIcons["airplay"] = "\uF51E";
    MDIIcons["alarm"] = "\uF51F";
    MDIIcons["alarm_bell"] = "\uFC8C";
    MDIIcons["alarm_check"] = "\uF520";
    MDIIcons["alarm_light"] = "\uFC8D";
    MDIIcons["alarm_multiple"] = "\uF521";
    MDIIcons["alarm_off"] = "\uF522";
    MDIIcons["alarm_plus"] = "\uF523";
    MDIIcons["alarm_snooze"] = "\uFB8C";
    MDIIcons["album"] = "\uF524";
    MDIIcons["alert"] = "\uF525";
    MDIIcons["alert_box"] = "\uF526";
    MDIIcons["alert_circle"] = "\uF527";
    MDIIcons["alert_circle_outline"] = "\uFAD5";
    MDIIcons["alert_decagram"] = "\uFBBB";
    MDIIcons["alert_octagon"] = "\uF528";
    MDIIcons["alert_octagram"] = "\uFC65";
    MDIIcons["alert_outline"] = "\uF529";
    MDIIcons["all_inclusive"] = "\uFBBC";
    MDIIcons["allo"] = "\uFD00";
    MDIIcons["alpha"] = "\uF52A";
    MDIIcons["alphabetical"] = "\uF52B";
    MDIIcons["altimeter"] = "\uFAD6";
    MDIIcons["amazon"] = "\uF52C";
    MDIIcons["amazon_clouddrive"] = "\uF52D";
    MDIIcons["ambulance"] = "\uF52E";
    MDIIcons["amplifier"] = "\uF52F";
    MDIIcons["anchor"] = "\uF530";
    MDIIcons["android"] = "\uF531";
    MDIIcons["android_debug_bridge"] = "\uF532";
    MDIIcons["android_head"] = "\uFC8E";
    MDIIcons["android_studio"] = "\uF533";
    MDIIcons["angular"] = "\uFBB0";
    MDIIcons["angularjs"] = "\uFBBD";
    MDIIcons["animation"] = "\uFAD7";
    MDIIcons["apple"] = "\uF534";
    MDIIcons["apple_finder"] = "\uF535";
    MDIIcons["apple_ios"] = "\uF536";
    MDIIcons["apple_keyboard_caps"] = "\uFB31";
    MDIIcons["apple_keyboard_command"] = "\uFB32";
    MDIIcons["apple_keyboard_control"] = "\uFB33";
    MDIIcons["apple_keyboard_option"] = "\uFB34";
    MDIIcons["apple_keyboard_shift"] = "\uFB35";
    MDIIcons["apple_mobileme"] = "\uF537";
    MDIIcons["apple_safari"] = "\uF538";
    MDIIcons["application"] = "\uFB13";
    MDIIcons["approval"] = "\uFC8F";
    MDIIcons["apps"] = "\uF53A";
    MDIIcons["archive"] = "\uF53B";
    MDIIcons["arrange_bring_forward"] = "\uF53C";
    MDIIcons["arrange_bring_to_front"] = "\uF53D";
    MDIIcons["arrange_send_backward"] = "\uF53E";
    MDIIcons["arrange_send_to_back"] = "\uF53F";
    MDIIcons["arrow_all"] = "\uF540";
    MDIIcons["arrow_bottom_left"] = "\uF541";
    MDIIcons["arrow_bottom_right"] = "\uF542";
    MDIIcons["arrow_collapse"] = "\uFB14";
    MDIIcons["arrow_collapse_all"] = "\uF543";
    MDIIcons["arrow_collapse_down"] = "\uFC90";
    MDIIcons["arrow_collapse_left"] = "\uFC91";
    MDIIcons["arrow_collapse_right"] = "\uFC92";
    MDIIcons["arrow_collapse_up"] = "\uFC93";
    MDIIcons["arrow_down"] = "\uF544";
    MDIIcons["arrow_down_bold"] = "\uFC2C";
    MDIIcons["arrow_down_bold_box"] = "\uFC2D";
    MDIIcons["arrow_down_bold_box_outline"] = "\uFC2E";
    MDIIcons["arrow_down_bold_circle"] = "\uF546";
    MDIIcons["arrow_down_bold_circle_outline"] = "\uF547";
    MDIIcons["arrow_down_bold_hexagon_outline"] = "\uF548";
    MDIIcons["arrow_down_box"] = "\uFBBE";
    MDIIcons["arrow_down_drop_circle"] = "\uF549";
    MDIIcons["arrow_down_drop_circle_outline"] = "\uF54A";
    MDIIcons["arrow_down_thick"] = "\uF545";
    MDIIcons["arrow_expand"] = "\uFB15";
    MDIIcons["arrow_expand_all"] = "\uF54B";
    MDIIcons["arrow_expand_down"] = "\uFC94";
    MDIIcons["arrow_expand_left"] = "\uFC95";
    MDIIcons["arrow_expand_right"] = "\uFC96";
    MDIIcons["arrow_expand_up"] = "\uFC97";
    MDIIcons["arrow_left"] = "\uF54C";
    MDIIcons["arrow_left_bold"] = "\uFC2F";
    MDIIcons["arrow_left_bold_box"] = "\uFC30";
    MDIIcons["arrow_left_bold_box_outline"] = "\uFC31";
    MDIIcons["arrow_left_bold_circle"] = "\uF54E";
    MDIIcons["arrow_left_bold_circle_outline"] = "\uF54F";
    MDIIcons["arrow_left_bold_hexagon_outline"] = "\uF550";
    MDIIcons["arrow_left_box"] = "\uFBBF";
    MDIIcons["arrow_left_drop_circle"] = "\uF551";
    MDIIcons["arrow_left_drop_circle_outline"] = "\uF552";
    MDIIcons["arrow_left_thick"] = "\uF54D";
    MDIIcons["arrow_right"] = "\uF553";
    MDIIcons["arrow_right_bold"] = "\uFC32";
    MDIIcons["arrow_right_bold_box"] = "\uFC33";
    MDIIcons["arrow_right_bold_box_outline"] = "\uFC34";
    MDIIcons["arrow_right_bold_circle"] = "\uF555";
    MDIIcons["arrow_right_bold_circle_outline"] = "\uF556";
    MDIIcons["arrow_right_bold_hexagon_outline"] = "\uF557";
    MDIIcons["arrow_right_box"] = "\uFBC0";
    MDIIcons["arrow_right_drop_circle"] = "\uF558";
    MDIIcons["arrow_right_drop_circle_outline"] = "\uF559";
    MDIIcons["arrow_right_thick"] = "\uF554";
    MDIIcons["arrow_top_left"] = "\uF55A";
    MDIIcons["arrow_top_right"] = "\uF55B";
    MDIIcons["arrow_up"] = "\uF55C";
    MDIIcons["arrow_up_bold"] = "\uFC35";
    MDIIcons["arrow_up_bold_box"] = "\uFC36";
    MDIIcons["arrow_up_bold_box_outline"] = "\uFC37";
    MDIIcons["arrow_up_bold_circle"] = "\uF55E";
    MDIIcons["arrow_up_bold_circle_outline"] = "\uF55F";
    MDIIcons["arrow_up_bold_hexagon_outline"] = "\uF560";
    MDIIcons["arrow_up_box"] = "\uFBC1";
    MDIIcons["arrow_up_drop_circle"] = "\uF561";
    MDIIcons["arrow_up_drop_circle_outline"] = "\uF562";
    MDIIcons["arrow_up_thick"] = "\uF55D";
    MDIIcons["artist"] = "\uFD01";
    MDIIcons["assistant"] = "\uF563";
    MDIIcons["asterisk"] = "\uFBC2";
    MDIIcons["at"] = "\uF564";
    MDIIcons["atlassian"] = "\uFD02";
    MDIIcons["atom"] = "\uFC66";
    MDIIcons["attachment"] = "\uF565";
    MDIIcons["audiobook"] = "\uF566";
    MDIIcons["auto_fix"] = "\uF567";
    MDIIcons["auto_upload"] = "\uF568";
    MDIIcons["autorenew"] = "\uF569";
    MDIIcons["av_timer"] = "\uF56A";
    MDIIcons["azure"] = "\uFD03";
    MDIIcons["baby"] = "\uF56B";
    MDIIcons["baby_buggy"] = "\uFB8D";
    MDIIcons["backburger"] = "\uF56C";
    MDIIcons["backspace"] = "\uF56D";
    MDIIcons["backup_restore"] = "\uF56E";
    MDIIcons["bandcamp"] = "\uFB73";
    MDIIcons["bank"] = "\uF56F";
    MDIIcons["barcode"] = "\uF570";
    MDIIcons["barcode_scan"] = "\uF571";
    MDIIcons["barley"] = "\uF572";
    MDIIcons["barrel"] = "\uF573";
    MDIIcons["basecamp"] = "\uF574";
    MDIIcons["basket"] = "\uF575";
    MDIIcons["basket_fill"] = "\uF576";
    MDIIcons["basket_unfill"] = "\uF577";
    MDIIcons["basketball"] = "\uFD04";
    MDIIcons["battery"] = "\uF578";
    MDIIcons["battery_10"] = "\uF579";
    MDIIcons["battery_20"] = "\uF57A";
    MDIIcons["battery_30"] = "\uF57B";
    MDIIcons["battery_40"] = "\uF57C";
    MDIIcons["battery_50"] = "\uF57D";
    MDIIcons["battery_60"] = "\uF57E";
    MDIIcons["battery_70"] = "\uF57F";
    MDIIcons["battery_80"] = "\uF580";
    MDIIcons["battery_90"] = "\uF581";
    MDIIcons["battery_alert"] = "\uF582";
    MDIIcons["battery_charging"] = "\uF583";
    MDIIcons["battery_charging_100"] = "\uF584";
    MDIIcons["battery_charging_20"] = "\uF585";
    MDIIcons["battery_charging_30"] = "\uF586";
    MDIIcons["battery_charging_40"] = "\uF587";
    MDIIcons["battery_charging_60"] = "\uF588";
    MDIIcons["battery_charging_80"] = "\uF589";
    MDIIcons["battery_charging_90"] = "\uF58A";
    MDIIcons["battery_charging_wireless"] = "\uFD05";
    MDIIcons["battery_charging_wireless_10"] = "\uFD06";
    MDIIcons["battery_charging_wireless_20"] = "\uFD07";
    MDIIcons["battery_charging_wireless_30"] = "\uFD08";
    MDIIcons["battery_charging_wireless_40"] = "\uFD09";
    MDIIcons["battery_charging_wireless_50"] = "\uFD0A";
    MDIIcons["battery_charging_wireless_60"] = "\uFD0B";
    MDIIcons["battery_charging_wireless_70"] = "\uFD0C";
    MDIIcons["battery_charging_wireless_80"] = "\uFD0D";
    MDIIcons["battery_charging_wireless_90"] = "\uFD0E";
    MDIIcons["battery_charging_wireless_alert"] = "\uFD0F";
    MDIIcons["battery_charging_wireless_outline"] = "\uFD10";
    MDIIcons["battery_minus"] = "\uF58B";
    MDIIcons["battery_negative"] = "\uF58C";
    MDIIcons["battery_outline"] = "\uF58D";
    MDIIcons["battery_plus"] = "\uF58E";
    MDIIcons["battery_positive"] = "\uF58F";
    MDIIcons["battery_unknown"] = "\uF590";
    MDIIcons["beach"] = "\uF591";
    MDIIcons["beaker"] = "\uFB8E";
    MDIIcons["beats"] = "\uF596";
    MDIIcons["beer"] = "\uF597";
    MDIIcons["behance"] = "\uF598";
    MDIIcons["bell"] = "\uF599";
    MDIIcons["bell_off"] = "\uF59A";
    MDIIcons["bell_outline"] = "\uF59B";
    MDIIcons["bell_plus"] = "\uF59C";
    MDIIcons["bell_ring"] = "\uF59D";
    MDIIcons["bell_ring_outline"] = "\uF59E";
    MDIIcons["bell_sleep"] = "\uF59F";
    MDIIcons["beta"] = "\uF5A0";
    MDIIcons["bible"] = "\uF5A1";
    MDIIcons["bike"] = "\uF5A2";
    MDIIcons["bing"] = "\uF5A3";
    MDIIcons["binoculars"] = "\uF5A4";
    MDIIcons["bio"] = "\uF5A5";
    MDIIcons["biohazard"] = "\uF5A6";
    MDIIcons["bitbucket"] = "\uF5A7";
    MDIIcons["bitcoin"] = "\uFD11";
    MDIIcons["black_mesa"] = "\uF5A8";
    MDIIcons["blackberry"] = "\uF5A9";
    MDIIcons["blender"] = "\uF5AA";
    MDIIcons["blinds"] = "\uF5AB";
    MDIIcons["block_helper"] = "\uF5AC";
    MDIIcons["blogger"] = "\uF5AD";
    MDIIcons["bluetooth"] = "\uF5AE";
    MDIIcons["bluetooth_audio"] = "\uF5AF";
    MDIIcons["bluetooth_connect"] = "\uF5B0";
    MDIIcons["bluetooth_off"] = "\uF5B1";
    MDIIcons["bluetooth_settings"] = "\uF5B2";
    MDIIcons["bluetooth_transfer"] = "\uF5B3";
    MDIIcons["blur"] = "\uF5B4";
    MDIIcons["blur_linear"] = "\uF5B5";
    MDIIcons["blur_off"] = "\uF5B6";
    MDIIcons["blur_radial"] = "\uF5B7";
    MDIIcons["bomb"] = "\uFB8F";
    MDIIcons["bomb_off"] = "\uFBC3";
    MDIIcons["bone"] = "\uF5B8";
    MDIIcons["book"] = "\uF5B9";
    MDIIcons["book_minus"] = "\uFAD8";
    MDIIcons["book_multiple"] = "\uF5BA";
    MDIIcons["book_multiple_variant"] = "\uF5BB";
    MDIIcons["book_open"] = "\uF5BC";
    MDIIcons["book_open_page_variant"] = "\uFAD9";
    MDIIcons["book_open_variant"] = "\uF5BD";
    MDIIcons["book_plus"] = "\uFADA";
    MDIIcons["book_secure"] = "\uFC98";
    MDIIcons["book_unsecure"] = "\uFC99";
    MDIIcons["book_variant"] = "\uF5BE";
    MDIIcons["bookmark"] = "\uF5BF";
    MDIIcons["bookmark_check"] = "\uF5C0";
    MDIIcons["bookmark_music"] = "\uF5C1";
    MDIIcons["bookmark_outline"] = "\uF5C2";
    MDIIcons["bookmark_plus"] = "\uF5C4";
    MDIIcons["bookmark_plus_outline"] = "\uF5C3";
    MDIIcons["bookmark_remove"] = "\uF5C5";
    MDIIcons["boombox"] = "\uFADB";
    MDIIcons["bootstrap"] = "\uFBC4";
    MDIIcons["border_all"] = "\uF5C6";
    MDIIcons["border_bottom"] = "\uF5C7";
    MDIIcons["border_color"] = "\uF5C8";
    MDIIcons["border_horizontal"] = "\uF5C9";
    MDIIcons["border_inside"] = "\uF5CA";
    MDIIcons["border_left"] = "\uF5CB";
    MDIIcons["border_none"] = "\uF5CC";
    MDIIcons["border_outside"] = "\uF5CD";
    MDIIcons["border_right"] = "\uF5CE";
    MDIIcons["border_style"] = "\uF5CF";
    MDIIcons["border_top"] = "\uF5D0";
    MDIIcons["border_vertical"] = "\uF5D1";
    MDIIcons["bow_tie"] = "\uFB76";
    MDIIcons["bowl"] = "\uFB16";
    MDIIcons["bowling"] = "\uF5D2";
    MDIIcons["box"] = "\uF5D3";
    MDIIcons["box_cutter"] = "\uF5D4";
    MDIIcons["box_shadow"] = "\uFB36";
    MDIIcons["bridge"] = "\uFB17";
    MDIIcons["briefcase"] = "\uF5D5";
    MDIIcons["briefcase_check"] = "\uF5D6";
    MDIIcons["briefcase_download"] = "\uF5D7";
    MDIIcons["briefcase_outline"] = "\uFD12";
    MDIIcons["briefcase_upload"] = "\uF5D8";
    MDIIcons["brightness_1"] = "\uF5D9";
    MDIIcons["brightness_2"] = "\uF5DA";
    MDIIcons["brightness_3"] = "\uF5DB";
    MDIIcons["brightness_4"] = "\uF5DC";
    MDIIcons["brightness_5"] = "\uF5DD";
    MDIIcons["brightness_6"] = "\uF5DE";
    MDIIcons["brightness_7"] = "\uF5DF";
    MDIIcons["brightness_auto"] = "\uF5E0";
    MDIIcons["broom"] = "\uF5E1";
    MDIIcons["brush"] = "\uF5E2";
    MDIIcons["buffer"] = "\uFB18";
    MDIIcons["bug"] = "\uF5E3";
    MDIIcons["bulletin_board"] = "\uF5E4";
    MDIIcons["bullhorn"] = "\uF5E5";
    MDIIcons["bullseye"] = "\uFADC";
    MDIIcons["bus"] = "\uF5E6";
    MDIIcons["bus_articulated_end"] = "\uFC9A";
    MDIIcons["bus_articulated_front"] = "\uFC9B";
    MDIIcons["bus_double_decker"] = "\uFC9C";
    MDIIcons["bus_school"] = "\uFC9D";
    MDIIcons["bus_side"] = "\uFC9E";
    MDIIcons["cached"] = "\uF5E7";
    MDIIcons["cake"] = "\uF5E8";
    MDIIcons["cake_layered"] = "\uF5E9";
    MDIIcons["cake_variant"] = "\uF5EA";
    MDIIcons["calculator"] = "\uF5EB";
    MDIIcons["calendar"] = "\uF5EC";
    MDIIcons["calendar_blank"] = "\uF5ED";
    MDIIcons["calendar_check"] = "\uF5EE";
    MDIIcons["calendar_clock"] = "\uF5EF";
    MDIIcons["calendar_multiple"] = "\uF5F0";
    MDIIcons["calendar_multiple_check"] = "\uF5F1";
    MDIIcons["calendar_plus"] = "\uF5F2";
    MDIIcons["calendar_question"] = "\uFB90";
    MDIIcons["calendar_range"] = "\uFB77";
    MDIIcons["calendar_remove"] = "\uF5F3";
    MDIIcons["calendar_text"] = "\uF5F4";
    MDIIcons["calendar_today"] = "\uF5F5";
    MDIIcons["call_made"] = "\uF5F6";
    MDIIcons["call_merge"] = "\uF5F7";
    MDIIcons["call_missed"] = "\uF5F8";
    MDIIcons["call_received"] = "\uF5F9";
    MDIIcons["call_split"] = "\uF5FA";
    MDIIcons["camcorder"] = "\uF5FB";
    MDIIcons["camcorder_box"] = "\uF5FC";
    MDIIcons["camcorder_box_off"] = "\uF5FD";
    MDIIcons["camcorder_off"] = "\uF5FE";
    MDIIcons["camera"] = "\uF5FF";
    MDIIcons["camera_burst"] = "\uFB91";
    MDIIcons["camera_enhance"] = "\uF600";
    MDIIcons["camera_front"] = "\uF601";
    MDIIcons["camera_front_variant"] = "\uF602";
    MDIIcons["camera_gopro"] = "\uFC9F";
    MDIIcons["camera_iris"] = "\uF603";
    MDIIcons["camera_metering_center"] = "\uFCA0";
    MDIIcons["camera_metering_matrix"] = "\uFCA1";
    MDIIcons["camera_metering_partial"] = "\uFCA2";
    MDIIcons["camera_metering_spot"] = "\uFCA3";
    MDIIcons["camera_off"] = "\uFADE";
    MDIIcons["camera_party_mode"] = "\uF604";
    MDIIcons["camera_rear"] = "\uF605";
    MDIIcons["camera_rear_variant"] = "\uF606";
    MDIIcons["camera_switch"] = "\uF607";
    MDIIcons["camera_timer"] = "\uF608";
    MDIIcons["cancel"] = "\uFC38";
    MDIIcons["candle"] = "\uFAE1";
    MDIIcons["candycane"] = "\uF609";
    MDIIcons["cannabis"] = "\uFCA4";
    MDIIcons["car"] = "\uF60A";
    MDIIcons["car_battery"] = "\uF60B";
    MDIIcons["car_connected"] = "\uF60C";
    MDIIcons["car_convertible"] = "\uFCA5";
    MDIIcons["car_estate"] = "\uFCA6";
    MDIIcons["car_hatchback"] = "\uFCA7";
    MDIIcons["car_pickup"] = "\uFCA8";
    MDIIcons["car_side"] = "\uFCA9";
    MDIIcons["car_sports"] = "\uFCAA";
    MDIIcons["car_wash"] = "\uF60D";
    MDIIcons["caravan"] = "\uFCAB";
    MDIIcons["cards"] = "\uFB37";
    MDIIcons["cards_outline"] = "\uFB38";
    MDIIcons["cards_playing_outline"] = "\uFB39";
    MDIIcons["cards_variant"] = "\uFBC5";
    MDIIcons["carrot"] = "\uF60E";
    MDIIcons["cart"] = "\uF60F";
    MDIIcons["cart_off"] = "\uFB6A";
    MDIIcons["cart_outline"] = "\uF610";
    MDIIcons["cart_plus"] = "\uF611";
    MDIIcons["case_sensitive_alt"] = "\uF612";
    MDIIcons["cash"] = "\uF613";
    MDIIcons["cash_100"] = "\uF614";
    MDIIcons["cash_multiple"] = "\uF615";
    MDIIcons["cash_usd"] = "\uF616";
    MDIIcons["cast"] = "\uF617";
    MDIIcons["cast_connected"] = "\uF618";
    MDIIcons["cast_off"] = "\uFC88";
    MDIIcons["castle"] = "\uF619";
    MDIIcons["cat"] = "\uF61A";
    MDIIcons["cctv"] = "\uFCAC";
    MDIIcons["ceiling_light"] = "\uFC67";
    MDIIcons["cellphone"] = "\uF61B";
    MDIIcons["cellphone_android"] = "\uF61C";
    MDIIcons["cellphone_basic"] = "\uF61D";
    MDIIcons["cellphone_dock"] = "\uF61E";
    MDIIcons["cellphone_iphone"] = "\uF61F";
    MDIIcons["cellphone_link"] = "\uF620";
    MDIIcons["cellphone_link_off"] = "\uF621";
    MDIIcons["cellphone_settings"] = "\uF622";
    MDIIcons["cellphone_wireless"] = "\uFD13";
    MDIIcons["certificate"] = "\uF623";
    MDIIcons["chair_school"] = "\uF624";
    MDIIcons["chart_arc"] = "\uF625";
    MDIIcons["chart_areaspline"] = "\uF626";
    MDIIcons["chart_bar"] = "\uF627";
    MDIIcons["chart_bar_stacked"] = "\uFC68";
    MDIIcons["chart_bubble"] = "\uFAE2";
    MDIIcons["chart_donut"] = "\uFCAD";
    MDIIcons["chart_donut_variant"] = "\uFCAE";
    MDIIcons["chart_gantt"] = "\uFB6B";
    MDIIcons["chart_histogram"] = "\uF628";
    MDIIcons["chart_line"] = "\uF629";
    MDIIcons["chart_line_stacked"] = "\uFC69";
    MDIIcons["chart_line_variant"] = "\uFCAF";
    MDIIcons["chart_pie"] = "\uF62A";
    MDIIcons["chart_scatterplot_hexbin"] = "\uFB6C";
    MDIIcons["chart_timeline"] = "\uFB6D";
    MDIIcons["check"] = "\uF62B";
    MDIIcons["check_all"] = "\uF62C";
    MDIIcons["check_circle"] = "\uFADF";
    MDIIcons["check_circle_outline"] = "\uFAE0";
    MDIIcons["checkbox_blank"] = "\uF62D";
    MDIIcons["checkbox_blank_circle"] = "\uF62E";
    MDIIcons["checkbox_blank_circle_outline"] = "\uF62F";
    MDIIcons["checkbox_blank_outline"] = "\uF630";
    MDIIcons["checkbox_marked"] = "\uF631";
    MDIIcons["checkbox_marked_circle"] = "\uF632";
    MDIIcons["checkbox_marked_circle_outline"] = "\uF633";
    MDIIcons["checkbox_marked_outline"] = "\uF634";
    MDIIcons["checkbox_multiple_blank"] = "\uF635";
    MDIIcons["checkbox_multiple_blank_circle"] = "\uFB3A";
    MDIIcons["checkbox_multiple_blank_circle_outline"] = "\uFB3B";
    MDIIcons["checkbox_multiple_blank_outline"] = "\uF636";
    MDIIcons["checkbox_multiple_marked"] = "\uF637";
    MDIIcons["checkbox_multiple_marked_circle"] = "\uFB3C";
    MDIIcons["checkbox_multiple_marked_circle_outline"] = "\uFB3D";
    MDIIcons["checkbox_multiple_marked_outline"] = "\uF638";
    MDIIcons["checkerboard"] = "\uF639";
    MDIIcons["chemical_weapon"] = "\uF63A";
    MDIIcons["chevron_double_down"] = "\uF63B";
    MDIIcons["chevron_double_left"] = "\uF63C";
    MDIIcons["chevron_double_right"] = "\uF63D";
    MDIIcons["chevron_double_up"] = "\uF63E";
    MDIIcons["chevron_down"] = "\uF63F";
    MDIIcons["chevron_left"] = "\uF640";
    MDIIcons["chevron_right"] = "\uF641";
    MDIIcons["chevron_up"] = "\uF642";
    MDIIcons["chili_hot"] = "\uFCB0";
    MDIIcons["chili_medium"] = "\uFCB1";
    MDIIcons["chili_mild"] = "\uFCB2";
    MDIIcons["chip"] = "\uFB19";
    MDIIcons["church"] = "\uF643";
    MDIIcons["circle"] = "\uFC63";
    MDIIcons["circle_outline"] = "\uFC64";
    MDIIcons["cisco_webex"] = "\uF644";
    MDIIcons["city"] = "\uF645";
    MDIIcons["clipboard"] = "\uF646";
    MDIIcons["clipboard_account"] = "\uF647";
    MDIIcons["clipboard_alert"] = "\uF648";
    MDIIcons["clipboard_arrow_down"] = "\uF649";
    MDIIcons["clipboard_arrow_left"] = "\uF64A";
    MDIIcons["clipboard_check"] = "\uF64B";
    MDIIcons["clipboard_flow"] = "\uFBC6";
    MDIIcons["clipboard_outline"] = "\uF64C";
    MDIIcons["clipboard_plus"] = "\uFC4F";
    MDIIcons["clipboard_text"] = "\uF64D";
    MDIIcons["clippy"] = "\uF64E";
    MDIIcons["clock"] = "\uF64F";
    MDIIcons["clock_alert"] = "\uFACD";
    MDIIcons["clock_end"] = "\uF650";
    MDIIcons["clock_fast"] = "\uF651";
    MDIIcons["clock_in"] = "\uF652";
    MDIIcons["clock_out"] = "\uF653";
    MDIIcons["clock_start"] = "\uF654";
    MDIIcons["close"] = "\uF655";
    MDIIcons["close_box"] = "\uF656";
    MDIIcons["close_box_outline"] = "\uF657";
    MDIIcons["close_circle"] = "\uF658";
    MDIIcons["close_circle_outline"] = "\uF659";
    MDIIcons["close_network"] = "\uF65A";
    MDIIcons["close_octagon"] = "\uF65B";
    MDIIcons["close_octagon_outline"] = "\uF65C";
    MDIIcons["close_outline"] = "\uFBC7";
    MDIIcons["closed_caption"] = "\uF65D";
    MDIIcons["cloud"] = "\uF65E";
    MDIIcons["cloud_braces"] = "\uFCB3";
    MDIIcons["cloud_check"] = "\uF65F";
    MDIIcons["cloud_circle"] = "\uF660";
    MDIIcons["cloud_download"] = "\uF661";
    MDIIcons["cloud_off_outline"] = "\uF663";
    MDIIcons["cloud_outline"] = "\uF662";
    MDIIcons["cloud_print"] = "\uF664";
    MDIIcons["cloud_print_outline"] = "\uF665";
    MDIIcons["cloud_sync"] = "\uFB3E";
    MDIIcons["cloud_tags"] = "\uFCB4";
    MDIIcons["cloud_upload"] = "\uF666";
    MDIIcons["clover"] = "\uFD14";
    MDIIcons["code_array"] = "\uF667";
    MDIIcons["code_braces"] = "\uF668";
    MDIIcons["code_brackets"] = "\uF669";
    MDIIcons["code_equal"] = "\uF66A";
    MDIIcons["code_greater_than"] = "\uF66B";
    MDIIcons["code_greater_than_or_equal"] = "\uF66C";
    MDIIcons["code_less_than"] = "\uF66D";
    MDIIcons["code_less_than_or_equal"] = "\uF66E";
    MDIIcons["code_not_equal"] = "\uF66F";
    MDIIcons["code_not_equal_variant"] = "\uF670";
    MDIIcons["code_parentheses"] = "\uF671";
    MDIIcons["code_string"] = "\uF672";
    MDIIcons["code_tags"] = "\uF673";
    MDIIcons["code_tags_check"] = "\uFB92";
    MDIIcons["codepen"] = "\uF674";
    MDIIcons["coffee"] = "\uF675";
    MDIIcons["coffee_outline"] = "\uFBC8";
    MDIIcons["coffee_to_go"] = "\uF676";
    MDIIcons["coin"] = "\uF677";
    MDIIcons["coins"] = "\uFB93";
    MDIIcons["collage"] = "\uFB3F";
    MDIIcons["color_helper"] = "\uF678";
    MDIIcons["comment"] = "\uF679";
    MDIIcons["comment_account"] = "\uF67A";
    MDIIcons["comment_account_outline"] = "\uF67B";
    MDIIcons["comment_alert"] = "\uF67C";
    MDIIcons["comment_alert_outline"] = "\uF67D";
    MDIIcons["comment_check"] = "\uF67E";
    MDIIcons["comment_check_outline"] = "\uF67F";
    MDIIcons["comment_multiple_outline"] = "\uF680";
    MDIIcons["comment_outline"] = "\uF681";
    MDIIcons["comment_plus_outline"] = "\uF682";
    MDIIcons["comment_processing"] = "\uF683";
    MDIIcons["comment_processing_outline"] = "\uF684";
    MDIIcons["comment_question"] = "\uFD15";
    MDIIcons["comment_question_outline"] = "\uF685";
    MDIIcons["comment_remove"] = "\uFADD";
    MDIIcons["comment_remove_outline"] = "\uF686";
    MDIIcons["comment_text"] = "\uF687";
    MDIIcons["comment_text_outline"] = "\uF688";
    MDIIcons["compare"] = "\uF689";
    MDIIcons["compass"] = "\uF68A";
    MDIIcons["compass_outline"] = "\uF68B";
    MDIIcons["console"] = "\uF68C";
    MDIIcons["console_line"] = "\uFCB5";
    MDIIcons["contact_mail"] = "\uF68D";
    MDIIcons["contacts"] = "\uFBC9";
    MDIIcons["content_copy"] = "\uF68E";
    MDIIcons["content_cut"] = "\uF68F";
    MDIIcons["content_duplicate"] = "\uF690";
    MDIIcons["content_paste"] = "\uF691";
    MDIIcons["content_save"] = "\uF692";
    MDIIcons["content_save_all"] = "\uF693";
    MDIIcons["content_save_outline"] = "\uFD16";
    MDIIcons["content_save_settings"] = "\uFB1A";
    MDIIcons["contrast"] = "\uF694";
    MDIIcons["contrast_box"] = "\uF695";
    MDIIcons["contrast_circle"] = "\uF696";
    MDIIcons["cookie"] = "\uF697";
    MDIIcons["copyright"] = "\uFAE5";
    MDIIcons["corn"] = "\uFCB6";
    MDIIcons["counter"] = "\uF698";
    MDIIcons["cow"] = "\uF699";
    MDIIcons["creation"] = "\uF6C8";
    MDIIcons["credit_card"] = "\uF69A";
    MDIIcons["credit_card_multiple"] = "\uF69B";
    MDIIcons["credit_card_off"] = "\uFAE3";
    MDIIcons["credit_card_plus"] = "\uFB74";
    MDIIcons["credit_card_scan"] = "\uF69C";
    MDIIcons["crop"] = "\uF69D";
    MDIIcons["crop_free"] = "\uF69E";
    MDIIcons["crop_landscape"] = "\uF69F";
    MDIIcons["crop_portrait"] = "\uF6A0";
    MDIIcons["crop_rotate"] = "\uFB94";
    MDIIcons["crop_square"] = "\uF6A1";
    MDIIcons["crosshairs"] = "\uF6A2";
    MDIIcons["crosshairs_gps"] = "\uF6A3";
    MDIIcons["crown"] = "\uF6A4";
    MDIIcons["cube"] = "\uF6A5";
    MDIIcons["cube_outline"] = "\uF6A6";
    MDIIcons["cube_send"] = "\uF6A7";
    MDIIcons["cube_unfolded"] = "\uF6A8";
    MDIIcons["cup"] = "\uF6A9";
    MDIIcons["cup_off"] = "\uFAE4";
    MDIIcons["cup_water"] = "\uF6AA";
    MDIIcons["currency_btc"] = "\uF6AB";
    MDIIcons["currency_chf"] = "\uFCB7";
    MDIIcons["currency_cny"] = "\uFCB8";
    MDIIcons["currency_eth"] = "\uFCB9";
    MDIIcons["currency_eur"] = "\uF6AC";
    MDIIcons["currency_gbp"] = "\uF6AD";
    MDIIcons["currency_inr"] = "\uF6AE";
    MDIIcons["currency_jpy"] = "\uFCBA";
    MDIIcons["currency_krw"] = "\uFCBB";
    MDIIcons["currency_ngn"] = "\uF6AF";
    MDIIcons["currency_rub"] = "\uF6B0";
    MDIIcons["currency_sign"] = "\uFCBC";
    MDIIcons["currency_try"] = "\uF6B1";
    MDIIcons["currency_twd"] = "\uFCBD";
    MDIIcons["currency_usd"] = "\uF6B2";
    MDIIcons["currency_usd_off"] = "\uFB78";
    MDIIcons["cursor_default"] = "\uF6B3";
    MDIIcons["cursor_default_outline"] = "\uF6B4";
    MDIIcons["cursor_move"] = "\uF6B5";
    MDIIcons["cursor_pointer"] = "\uF6B6";
    MDIIcons["cursor_text"] = "\uFAE6";
    MDIIcons["database"] = "\uF6B7";
    MDIIcons["database_minus"] = "\uF6B8";
    MDIIcons["database_plus"] = "\uF6B9";
    MDIIcons["debug_step_into"] = "\uF6BA";
    MDIIcons["debug_step_out"] = "\uF6BB";
    MDIIcons["debug_step_over"] = "\uF6BC";
    MDIIcons["decagram"] = "\uFC6A";
    MDIIcons["decagram_outline"] = "\uFC6B";
    MDIIcons["decimal_decrease"] = "\uF6BD";
    MDIIcons["decimal_increase"] = "\uF6BE";
    MDIIcons["delete"] = "\uF6BF";
    MDIIcons["delete_circle"] = "\uFB81";
    MDIIcons["delete_empty"] = "\uFBCA";
    MDIIcons["delete_forever"] = "\uFAE7";
    MDIIcons["delete_restore"] = "\uFD17";
    MDIIcons["delete_sweep"] = "\uFAE8";
    MDIIcons["delete_variant"] = "\uF6C0";
    MDIIcons["delta"] = "\uF6C1";
    MDIIcons["deskphone"] = "\uF6C2";
    MDIIcons["desktop_classic"] = "\uFCBE";
    MDIIcons["desktop_mac"] = "\uF6C3";
    MDIIcons["desktop_tower"] = "\uF6C4";
    MDIIcons["details"] = "\uF6C5";
    MDIIcons["developer_board"] = "\uFB95";
    MDIIcons["deviantart"] = "\uF6C6";
    MDIIcons["dialpad"] = "\uFB1B";
    MDIIcons["diamond"] = "\uF6C7";
    MDIIcons["dice_1"] = "\uF6C9";
    MDIIcons["dice_2"] = "\uF6CA";
    MDIIcons["dice_3"] = "\uF6CB";
    MDIIcons["dice_4"] = "\uF6CC";
    MDIIcons["dice_5"] = "\uF6CD";
    MDIIcons["dice_6"] = "\uF6CE";
    MDIIcons["dice_d10"] = "\uFC6D";
    MDIIcons["dice_d20"] = "\uFAE9";
    MDIIcons["dice_d4"] = "\uFAEA";
    MDIIcons["dice_d6"] = "\uFAEB";
    MDIIcons["dice_d8"] = "\uFAEC";
    MDIIcons["dice_multiple"] = "\uFC6C";
    MDIIcons["dictionary"] = "\uFB1C";
    MDIIcons["dip_switch"] = "\uFCBF";
    MDIIcons["directions"] = "\uF6CF";
    MDIIcons["directions_fork"] = "\uFB40";
    MDIIcons["discord"] = "\uFB6E";
    MDIIcons["disk"] = "\uFAED";
    MDIIcons["disk_alert"] = "\uF6D0";
    MDIIcons["disqus"] = "\uF6D1";
    MDIIcons["disqus_outline"] = "\uF6D2";
    MDIIcons["division"] = "\uF6D3";
    MDIIcons["division_box"] = "\uF6D4";
    MDIIcons["dna"] = "\uFB82";
    MDIIcons["dns"] = "\uF6D5";
    MDIIcons["do_not_disturb"] = "\uFB96";
    MDIIcons["do_not_disturb_off"] = "\uFB97";
    MDIIcons["dolby"] = "\uFBB1";
    MDIIcons["domain"] = "\uF6D6";
    MDIIcons["donkey"] = "\uFCC0";
    MDIIcons["door"] = "\uFD18";
    MDIIcons["door_closed"] = "\uFD19";
    MDIIcons["door_open"] = "\uFD1A";
    MDIIcons["dots_horizontal"] = "\uF6D7";
    MDIIcons["dots_horizontal_circle"] = "\uFCC1";
    MDIIcons["dots_vertical"] = "\uF6D8";
    MDIIcons["dots_vertical_circle"] = "\uFCC2";
    MDIIcons["douban"] = "\uFB98";
    MDIIcons["download"] = "\uF6D9";
    MDIIcons["download_network"] = "\uFBF2";
    MDIIcons["drag"] = "\uF6DA";
    MDIIcons["drag_horizontal"] = "\uF6DB";
    MDIIcons["drag_vertical"] = "\uF6DC";
    MDIIcons["drawing"] = "\uF6DD";
    MDIIcons["drawing_box"] = "\uF6DE";
    MDIIcons["dribbble"] = "\uF6DF";
    MDIIcons["dribbble_box"] = "\uF6E0";
    MDIIcons["drone"] = "\uF6E1";
    MDIIcons["dropbox"] = "\uF6E2";
    MDIIcons["drupal"] = "\uF6E3";
    MDIIcons["duck"] = "\uF6E4";
    MDIIcons["dumbbell"] = "\uF6E5";
    MDIIcons["ear_hearing"] = "\uFCC3";
    MDIIcons["earth"] = "\uF6E6";
    MDIIcons["earth_box"] = "\uFBCB";
    MDIIcons["earth_box_off"] = "\uFBCC";
    MDIIcons["earth_off"] = "\uF6E7";
    MDIIcons["edge"] = "\uF6E8";
    MDIIcons["eject"] = "\uF6E9";
    MDIIcons["elephant"] = "\uFCC4";
    MDIIcons["elevation_decline"] = "\uF6EA";
    MDIIcons["elevation_rise"] = "\uF6EB";
    MDIIcons["elevator"] = "\uF6EC";
    MDIIcons["email"] = "\uF6ED";
    MDIIcons["email_alert"] = "\uFBCD";
    MDIIcons["email_open"] = "\uF6EE";
    MDIIcons["email_open_outline"] = "\uFAEE";
    MDIIcons["email_outline"] = "\uF6EF";
    MDIIcons["email_secure"] = "\uF6F0";
    MDIIcons["email_variant"] = "\uFAEF";
    MDIIcons["emby"] = "\uFBB2";
    MDIIcons["emoticon"] = "\uF6F1";
    MDIIcons["emoticon_cool"] = "\uF6F2";
    MDIIcons["emoticon_dead"] = "\uFB99";
    MDIIcons["emoticon_devil"] = "\uF6F3";
    MDIIcons["emoticon_excited"] = "\uFB9A";
    MDIIcons["emoticon_happy"] = "\uF6F4";
    MDIIcons["emoticon_neutral"] = "\uF6F5";
    MDIIcons["emoticon_poop"] = "\uF6F6";
    MDIIcons["emoticon_sad"] = "\uF6F7";
    MDIIcons["emoticon_tongue"] = "\uF6F8";
    MDIIcons["engine"] = "\uF6F9";
    MDIIcons["engine_outline"] = "\uF6FA";
    MDIIcons["equal"] = "\uF6FB";
    MDIIcons["equal_box"] = "\uF6FC";
    MDIIcons["eraser"] = "\uF6FD";
    MDIIcons["eraser_variant"] = "\uFB41";
    MDIIcons["escalator"] = "\uF6FE";
    MDIIcons["ethernet"] = "\uF6FF";
    MDIIcons["ethernet_cable"] = "\uF700";
    MDIIcons["ethernet_cable_off"] = "\uF701";
    MDIIcons["etsy"] = "\uF702";
    MDIIcons["ev_station"] = "\uFAF0";
    MDIIcons["eventbrite"] = "\uFCC5";
    MDIIcons["evernote"] = "\uF703";
    MDIIcons["exclamation"] = "\uF704";
    MDIIcons["exit_to_app"] = "\uF705";
    MDIIcons["export"] = "\uF706";
    MDIIcons["eye"] = "\uF707";
    MDIIcons["eye_off"] = "\uF708";
    MDIIcons["eye_off_outline"] = "\uFBCF";
    MDIIcons["eye_outline"] = "\uFBCE";
    MDIIcons["eyedropper"] = "\uF709";
    MDIIcons["eyedropper_variant"] = "\uF70A";
    MDIIcons["face"] = "\uFB42";
    MDIIcons["face_profile"] = "\uFB43";
    MDIIcons["facebook"] = "\uF70B";
    MDIIcons["facebook_box"] = "\uF70C";
    MDIIcons["facebook_messenger"] = "\uF70D";
    MDIIcons["factory"] = "\uF70E";
    MDIIcons["fan"] = "\uF70F";
    MDIIcons["fan_off"] = "\uFD1B";
    MDIIcons["fast_forward"] = "\uF710";
    MDIIcons["fast_forward_outline"] = "\uFBD0";
    MDIIcons["fax"] = "\uF711";
    MDIIcons["feather"] = "\uFBD1";
    MDIIcons["ferry"] = "\uF712";
    MDIIcons["file"] = "\uF713";
    MDIIcons["file_account"] = "\uFC39";
    MDIIcons["file_chart"] = "\uF714";
    MDIIcons["file_check"] = "\uF715";
    MDIIcons["file_cloud"] = "\uF716";
    MDIIcons["file_delimited"] = "\uF717";
    MDIIcons["file_document"] = "\uF718";
    MDIIcons["file_document_box"] = "\uF719";
    MDIIcons["file_excel"] = "\uF71A";
    MDIIcons["file_excel_box"] = "\uF71B";
    MDIIcons["file_export"] = "\uF71C";
    MDIIcons["file_find"] = "\uF71D";
    MDIIcons["file_hidden"] = "\uFB12";
    MDIIcons["file_image"] = "\uF71E";
    MDIIcons["file_import"] = "\uF71F";
    MDIIcons["file_lock"] = "\uF720";
    MDIIcons["file_multiple"] = "\uF721";
    MDIIcons["file_music"] = "\uF722";
    MDIIcons["file_outline"] = "\uF723";
    MDIIcons["file_pdf"] = "\uF724";
    MDIIcons["file_pdf_box"] = "\uF725";
    MDIIcons["file_percent"] = "\uFD1C";
    MDIIcons["file_plus"] = "\uFC50";
    MDIIcons["file_powerpoint"] = "\uF726";
    MDIIcons["file_powerpoint_box"] = "\uF727";
    MDIIcons["file_presentation_box"] = "\uF728";
    MDIIcons["file_restore"] = "\uFB6F";
    MDIIcons["file_send"] = "\uF729";
    MDIIcons["file_tree"] = "\uFB44";
    MDIIcons["file_video"] = "\uF72A";
    MDIIcons["file_word"] = "\uF72B";
    MDIIcons["file_word_box"] = "\uF72C";
    MDIIcons["file_xml"] = "\uF72D";
    MDIIcons["film"] = "\uF72E";
    MDIIcons["filmstrip"] = "\uF72F";
    MDIIcons["filmstrip_off"] = "\uF730";
    MDIIcons["filter"] = "\uF731";
    MDIIcons["filter_outline"] = "\uF732";
    MDIIcons["filter_remove"] = "\uF733";
    MDIIcons["filter_remove_outline"] = "\uF734";
    MDIIcons["filter_variant"] = "\uF735";
    MDIIcons["finance"] = "\uFD1D";
    MDIIcons["find_replace"] = "\uFBD2";
    MDIIcons["fingerprint"] = "\uF736";
    MDIIcons["fire"] = "\uF737";
    MDIIcons["firefox"] = "\uF738";
    MDIIcons["fish"] = "\uF739";
    MDIIcons["flag"] = "\uF73A";
    MDIIcons["flag_checkered"] = "\uF73B";
    MDIIcons["flag_outline"] = "\uF73C";
    MDIIcons["flag_triangle"] = "\uF73E";
    MDIIcons["flag_variant"] = "\uF73F";
    MDIIcons["flag_variant_outline"] = "\uF73D";
    MDIIcons["flash"] = "\uF740";
    MDIIcons["flash_auto"] = "\uF741";
    MDIIcons["flash_circle"] = "\uFD1E";
    MDIIcons["flash_off"] = "\uF742";
    MDIIcons["flash_outline"] = "\uFBD3";
    MDIIcons["flash_red_eye"] = "\uFB79";
    MDIIcons["flashlight"] = "\uF743";
    MDIIcons["flashlight_off"] = "\uF744";
    MDIIcons["flask"] = "\uF592";
    MDIIcons["flask_empty"] = "\uF593";
    MDIIcons["flask_empty_outline"] = "\uF594";
    MDIIcons["flask_outline"] = "\uF595";
    MDIIcons["flattr"] = "\uF745";
    MDIIcons["flip_to_back"] = "\uF746";
    MDIIcons["flip_to_front"] = "\uF747";
    MDIIcons["floor_plan"] = "\uFD1F";
    MDIIcons["floppy"] = "\uF748";
    MDIIcons["flower"] = "\uF749";
    MDIIcons["folder"] = "\uF74A";
    MDIIcons["folder_account"] = "\uF74B";
    MDIIcons["folder_download"] = "\uF74C";
    MDIIcons["folder_google_drive"] = "\uF74D";
    MDIIcons["folder_image"] = "\uF74E";
    MDIIcons["folder_lock"] = "\uF74F";
    MDIIcons["folder_lock_open"] = "\uF750";
    MDIIcons["folder_move"] = "\uF751";
    MDIIcons["folder_multiple"] = "\uF752";
    MDIIcons["folder_multiple_image"] = "\uF753";
    MDIIcons["folder_multiple_outline"] = "\uF754";
    MDIIcons["folder_open"] = "\uFC6E";
    MDIIcons["folder_outline"] = "\uF755";
    MDIIcons["folder_plus"] = "\uF756";
    MDIIcons["folder_remove"] = "\uF757";
    MDIIcons["folder_star"] = "\uFB9B";
    MDIIcons["folder_upload"] = "\uF758";
    MDIIcons["font_awesome"] = "\uF539";
    MDIIcons["food"] = "\uF759";
    MDIIcons["food_apple"] = "\uF75A";
    MDIIcons["food_croissant"] = "\uFCC6";
    MDIIcons["food_fork_drink"] = "\uFAF1";
    MDIIcons["food_off"] = "\uFAF2";
    MDIIcons["food_variant"] = "\uF75B";
    MDIIcons["football"] = "\uF75C";
    MDIIcons["football_australian"] = "\uF75D";
    MDIIcons["football_helmet"] = "\uF75E";
    MDIIcons["forklift"] = "\uFCC7";
    MDIIcons["format_align_bottom"] = "\uFC51";
    MDIIcons["format_align_center"] = "\uF75F";
    MDIIcons["format_align_justify"] = "\uF760";
    MDIIcons["format_align_left"] = "\uF761";
    MDIIcons["format_align_middle"] = "\uFC52";
    MDIIcons["format_align_right"] = "\uF762";
    MDIIcons["format_align_top"] = "\uFC53";
    MDIIcons["format_annotation_plus"] = "\uFB45";
    MDIIcons["format_bold"] = "\uF763";
    MDIIcons["format_clear"] = "\uF764";
    MDIIcons["format_color_fill"] = "\uF765";
    MDIIcons["format_color_text"] = "\uFB9C";
    MDIIcons["format_float_center"] = "\uF766";
    MDIIcons["format_float_left"] = "\uF767";
    MDIIcons["format_float_none"] = "\uF768";
    MDIIcons["format_float_right"] = "\uF769";
    MDIIcons["format_font"] = "\uFBD4";
    MDIIcons["format_header_1"] = "\uF76A";
    MDIIcons["format_header_2"] = "\uF76B";
    MDIIcons["format_header_3"] = "\uF76C";
    MDIIcons["format_header_4"] = "\uF76D";
    MDIIcons["format_header_5"] = "\uF76E";
    MDIIcons["format_header_6"] = "\uF76F";
    MDIIcons["format_header_decrease"] = "\uF770";
    MDIIcons["format_header_equal"] = "\uF771";
    MDIIcons["format_header_increase"] = "\uF772";
    MDIIcons["format_header_pound"] = "\uF773";
    MDIIcons["format_horizontal_align_center"] = "\uFB1D";
    MDIIcons["format_horizontal_align_left"] = "\uFB1E";
    MDIIcons["format_horizontal_align_right"] = "\uFB1F";
    MDIIcons["format_indent_decrease"] = "\uF774";
    MDIIcons["format_indent_increase"] = "\uF775";
    MDIIcons["format_italic"] = "\uF776";
    MDIIcons["format_line_spacing"] = "\uF777";
    MDIIcons["format_line_style"] = "\uFAC7";
    MDIIcons["format_line_weight"] = "\uFAC8";
    MDIIcons["format_list_bulleted"] = "\uF778";
    MDIIcons["format_list_bulleted_type"] = "\uF779";
    MDIIcons["format_list_checks"] = "\uFC54";
    MDIIcons["format_list_numbers"] = "\uF77A";
    MDIIcons["format_page_break"] = "\uFBD5";
    MDIIcons["format_paint"] = "\uF77B";
    MDIIcons["format_paragraph"] = "\uF77C";
    MDIIcons["format_pilcrow"] = "\uFBD6";
    MDIIcons["format_quote_close"] = "\uF77D";
    MDIIcons["format_quote_open"] = "\uFC55";
    MDIIcons["format_rotate_90"] = "\uFBA8";
    MDIIcons["format_section"] = "\uFB9D";
    MDIIcons["format_size"] = "\uF77E";
    MDIIcons["format_strikethrough"] = "\uF77F";
    MDIIcons["format_strikethrough_variant"] = "\uF780";
    MDIIcons["format_subscript"] = "\uF781";
    MDIIcons["format_superscript"] = "\uF782";
    MDIIcons["format_text"] = "\uF783";
    MDIIcons["format_textdirection_l_to_r"] = "\uF784";
    MDIIcons["format_textdirection_r_to_l"] = "\uF785";
    MDIIcons["format_title"] = "\uFAF3";
    MDIIcons["format_underline"] = "\uF786";
    MDIIcons["format_vertical_align_bottom"] = "\uFB20";
    MDIIcons["format_vertical_align_center"] = "\uFB21";
    MDIIcons["format_vertical_align_top"] = "\uFB22";
    MDIIcons["format_wrap_inline"] = "\uF787";
    MDIIcons["format_wrap_square"] = "\uF788";
    MDIIcons["format_wrap_tight"] = "\uF789";
    MDIIcons["format_wrap_top_bottom"] = "\uF78A";
    MDIIcons["forum"] = "\uF78B";
    MDIIcons["forum_outline"] = "\uFD20";
    MDIIcons["forward"] = "\uF78C";
    MDIIcons["foursquare"] = "\uF78D";
    MDIIcons["fridge"] = "\uF78E";
    MDIIcons["fridge_filled"] = "\uF78F";
    MDIIcons["fridge_filled_bottom"] = "\uF790";
    MDIIcons["fridge_filled_top"] = "\uF791";
    MDIIcons["fuel"] = "\uFCC8";
    MDIIcons["fullscreen"] = "\uF792";
    MDIIcons["fullscreen_exit"] = "\uF793";
    MDIIcons["function"] = "\uF794";
    MDIIcons["gamepad"] = "\uF795";
    MDIIcons["gamepad_variant"] = "\uF796";
    MDIIcons["garage"] = "\uFBD7";
    MDIIcons["garage_open"] = "\uFBD8";
    MDIIcons["gas_cylinder"] = "\uFB46";
    MDIIcons["gas_station"] = "\uF797";
    MDIIcons["gate"] = "\uF798";
    MDIIcons["gauge"] = "\uF799";
    MDIIcons["gavel"] = "\uF79A";
    MDIIcons["gender_female"] = "\uF79B";
    MDIIcons["gender_male"] = "\uF79C";
    MDIIcons["gender_male_female"] = "\uF79D";
    MDIIcons["gender_transgender"] = "\uF79E";
    MDIIcons["gesture"] = "\uFCC9";
    MDIIcons["gesture_double_tap"] = "\uFC3A";
    MDIIcons["gesture_swipe_down"] = "\uFC3B";
    MDIIcons["gesture_swipe_left"] = "\uFC3C";
    MDIIcons["gesture_swipe_right"] = "\uFC3D";
    MDIIcons["gesture_swipe_up"] = "\uFC3E";
    MDIIcons["gesture_tap"] = "\uFC3F";
    MDIIcons["gesture_two_double_tap"] = "\uFC40";
    MDIIcons["gesture_two_tap"] = "\uFC41";
    MDIIcons["ghost"] = "\uF79F";
    MDIIcons["gift"] = "\uF7A0";
    MDIIcons["git"] = "\uF7A1";
    MDIIcons["github_box"] = "\uF7A2";
    MDIIcons["github_circle"] = "\uF7A3";
    MDIIcons["github_face"] = "\uFBD9";
    MDIIcons["glass_flute"] = "\uF7A4";
    MDIIcons["glass_mug"] = "\uF7A5";
    MDIIcons["glass_stange"] = "\uF7A6";
    MDIIcons["glass_tulip"] = "\uF7A7";
    MDIIcons["glassdoor"] = "\uF7A8";
    MDIIcons["glasses"] = "\uF7A9";
    MDIIcons["gmail"] = "\uF7AA";
    MDIIcons["gnome"] = "\uF7AB";
    MDIIcons["golf"] = "\uFD21";
    MDIIcons["gondola"] = "\uFB84";
    MDIIcons["google"] = "\uF7AC";
    MDIIcons["google_analytics"] = "\uFCCA";
    MDIIcons["google_assistant"] = "\uFCCB";
    MDIIcons["google_cardboard"] = "\uF7AD";
    MDIIcons["google_chrome"] = "\uF7AE";
    MDIIcons["google_circles"] = "\uF7AF";
    MDIIcons["google_circles_communities"] = "\uF7B0";
    MDIIcons["google_circles_extended"] = "\uF7B1";
    MDIIcons["google_circles_group"] = "\uF7B2";
    MDIIcons["google_controller"] = "\uF7B3";
    MDIIcons["google_controller_off"] = "\uF7B4";
    MDIIcons["google_drive"] = "\uF7B5";
    MDIIcons["google_earth"] = "\uF7B6";
    MDIIcons["google_glass"] = "\uF7B7";
    MDIIcons["google_home"] = "\uFD22";
    MDIIcons["google_keep"] = "\uFBDA";
    MDIIcons["google_maps"] = "\uFAF4";
    MDIIcons["google_nearby"] = "\uF7B8";
    MDIIcons["google_pages"] = "\uF7B9";
    MDIIcons["google_photos"] = "\uFBDB";
    MDIIcons["google_physical_web"] = "\uF7BA";
    MDIIcons["google_play"] = "\uF7BB";
    MDIIcons["google_plus"] = "\uF7BC";
    MDIIcons["google_plus_box"] = "\uF7BD";
    MDIIcons["google_translate"] = "\uF7BE";
    MDIIcons["google_wallet"] = "\uF7BF";
    MDIIcons["gradient"] = "\uFB9E";
    MDIIcons["grease_pencil"] = "\uFB47";
    MDIIcons["grid"] = "\uF7C0";
    MDIIcons["grid_large"] = "\uFC56";
    MDIIcons["grid_off"] = "\uF7C1";
    MDIIcons["group"] = "\uF7C2";
    MDIIcons["guitar_acoustic"] = "\uFC6F";
    MDIIcons["guitar_electric"] = "\uF7C3";
    MDIIcons["guitar_pick"] = "\uF7C4";
    MDIIcons["guitar_pick_outline"] = "\uF7C5";
    MDIIcons["guy_fawkes_mask"] = "\uFD23";
    MDIIcons["hackernews"] = "\uFB23";
    MDIIcons["hamburger"] = "\uFB83";
    MDIIcons["hand_pointing_right"] = "\uF7C6";
    MDIIcons["hanger"] = "\uF7C7";
    MDIIcons["hangouts"] = "\uF7C8";
    MDIIcons["harddisk"] = "\uF7C9";
    MDIIcons["headphones"] = "\uF7CA";
    MDIIcons["headphones_box"] = "\uF7CB";
    MDIIcons["headphones_off"] = "\uFCCC";
    MDIIcons["headphones_settings"] = "\uF7CC";
    MDIIcons["headset"] = "\uF7CD";
    MDIIcons["headset_dock"] = "\uF7CE";
    MDIIcons["headset_off"] = "\uF7CF";
    MDIIcons["heart"] = "\uF7D0";
    MDIIcons["heart_box"] = "\uF7D1";
    MDIIcons["heart_box_outline"] = "\uF7D2";
    MDIIcons["heart_broken"] = "\uF7D3";
    MDIIcons["heart_half"] = "\uFBDD";
    MDIIcons["heart_half_full"] = "\uFBDC";
    MDIIcons["heart_half_outline"] = "\uFBDE";
    MDIIcons["heart_off"] = "\uFC57";
    MDIIcons["heart_outline"] = "\uF7D4";
    MDIIcons["heart_pulse"] = "\uFAF5";
    MDIIcons["help"] = "\uF7D5";
    MDIIcons["help_box"] = "\uFC89";
    MDIIcons["help_circle"] = "\uF7D6";
    MDIIcons["help_circle_outline"] = "\uFB24";
    MDIIcons["help_network"] = "\uFBF3";
    MDIIcons["hexagon"] = "\uF7D7";
    MDIIcons["hexagon_multiple"] = "\uFBDF";
    MDIIcons["hexagon_outline"] = "\uF7D8";
    MDIIcons["high_definition"] = "\uFCCD";
    MDIIcons["highway"] = "\uFAF6";
    MDIIcons["history"] = "\uF7D9";
    MDIIcons["hololens"] = "\uF7DA";
    MDIIcons["home"] = "\uF7DB";
    MDIIcons["home_account"] = "\uFD24";
    MDIIcons["home_assistant"] = "\uFCCE";
    MDIIcons["home_automation"] = "\uFCCF";
    MDIIcons["home_circle"] = "\uFCD0";
    MDIIcons["home_heart"] = "\uFD25";
    MDIIcons["home_map_marker"] = "\uFAF7";
    MDIIcons["home_modern"] = "\uF7DC";
    MDIIcons["home_outline"] = "\uFB9F";
    MDIIcons["home_variant"] = "\uF7DD";
    MDIIcons["hook"] = "\uFBE0";
    MDIIcons["hook_off"] = "\uFBE1";
    MDIIcons["hops"] = "\uF7DE";
    MDIIcons["hospital"] = "\uF7DF";
    MDIIcons["hospital_building"] = "\uF7E0";
    MDIIcons["hospital_marker"] = "\uF7E1";
    MDIIcons["hot_tub"] = "\uFD26";
    MDIIcons["hotel"] = "\uF7E2";
    MDIIcons["houzz"] = "\uF7E3";
    MDIIcons["houzz_box"] = "\uF7E4";
    MDIIcons["hulu"] = "\uFD27";
    MDIIcons["human"] = "\uF7E5";
    MDIIcons["human_child"] = "\uF7E6";
    MDIIcons["human_female"] = "\uFB48";
    MDIIcons["human_greeting"] = "\uFB49";
    MDIIcons["human_handsdown"] = "\uFB4A";
    MDIIcons["human_handsup"] = "\uFB4B";
    MDIIcons["human_male"] = "\uFB4C";
    MDIIcons["human_male_female"] = "\uF7E7";
    MDIIcons["human_pregnant"] = "\uFACE";
    MDIIcons["humble_bundle"] = "\uFC42";
    MDIIcons["ice_cream"] = "\uFD28";
    MDIIcons["image"] = "\uF7E8";
    MDIIcons["image_album"] = "\uF7E9";
    MDIIcons["image_area"] = "\uF7EA";
    MDIIcons["image_area_close"] = "\uF7EB";
    MDIIcons["image_broken"] = "\uF7EC";
    MDIIcons["image_broken_variant"] = "\uF7ED";
    MDIIcons["image_filter"] = "\uF7EE";
    MDIIcons["image_filter_black_white"] = "\uF7EF";
    MDIIcons["image_filter_center_focus"] = "\uF7F0";
    MDIIcons["image_filter_center_focus_weak"] = "\uF7F1";
    MDIIcons["image_filter_drama"] = "\uF7F2";
    MDIIcons["image_filter_frames"] = "\uF7F3";
    MDIIcons["image_filter_hdr"] = "\uF7F4";
    MDIIcons["image_filter_none"] = "\uF7F5";
    MDIIcons["image_filter_tilt_shift"] = "\uF7F6";
    MDIIcons["image_filter_vintage"] = "\uF7F7";
    MDIIcons["image_multiple"] = "\uF7F8";
    MDIIcons["image_off"] = "\uFD29";
    MDIIcons["import"] = "\uF7F9";
    MDIIcons["inbox"] = "\uFB85";
    MDIIcons["inbox_arrow_down"] = "\uF7FA";
    MDIIcons["inbox_arrow_up"] = "\uF8D0";
    MDIIcons["incognito"] = "\uFAF8";
    MDIIcons["infinity"] = "\uFBE2";
    MDIIcons["information"] = "\uF7FB";
    MDIIcons["information_outline"] = "\uF7FC";
    MDIIcons["information_variant"] = "\uFB4D";
    MDIIcons["instagram"] = "\uF7FD";
    MDIIcons["instapaper"] = "\uF7FE";
    MDIIcons["internet_explorer"] = "\uF7FF";
    MDIIcons["invert_colors"] = "\uF800";
    MDIIcons["itunes"] = "\uFB75";
    MDIIcons["jeepney"] = "\uF801";
    MDIIcons["jira"] = "\uF802";
    MDIIcons["jsfiddle"] = "\uF803";
    MDIIcons["json"] = "\uFB25";
    MDIIcons["karate"] = "\uFD2A";
    MDIIcons["keg"] = "\uF804";
    MDIIcons["kettle"] = "\uFAF9";
    MDIIcons["key"] = "\uF805";
    MDIIcons["key_change"] = "\uF806";
    MDIIcons["key_minus"] = "\uF807";
    MDIIcons["key_plus"] = "\uF808";
    MDIIcons["key_remove"] = "\uF809";
    MDIIcons["key_variant"] = "\uF80A";
    MDIIcons["keyboard"] = "\uF80B";
    MDIIcons["keyboard_backspace"] = "\uF80C";
    MDIIcons["keyboard_caps"] = "\uF80D";
    MDIIcons["keyboard_close"] = "\uF80E";
    MDIIcons["keyboard_off"] = "\uF80F";
    MDIIcons["keyboard_return"] = "\uF810";
    MDIIcons["keyboard_tab"] = "\uF811";
    MDIIcons["keyboard_variant"] = "\uF812";
    MDIIcons["kickstarter"] = "\uFC43";
    MDIIcons["kodi"] = "\uF813";
    MDIIcons["label"] = "\uF814";
    MDIIcons["label_outline"] = "\uF815";
    MDIIcons["ladybug"] = "\uFD2B";
    MDIIcons["lambda"] = "\uFB26";
    MDIIcons["lamp"] = "\uFBB3";
    MDIIcons["lan"] = "\uF816";
    MDIIcons["lan_connect"] = "\uF817";
    MDIIcons["lan_disconnect"] = "\uF818";
    MDIIcons["lan_pending"] = "\uF819";
    MDIIcons["language_c"] = "\uFB70";
    MDIIcons["language_cpp"] = "\uFB71";
    MDIIcons["language_csharp"] = "\uF81A";
    MDIIcons["language_css3"] = "\uF81B";
    MDIIcons["language_go"] = "\uFCD1";
    MDIIcons["language_html5"] = "\uF81C";
    MDIIcons["language_javascript"] = "\uF81D";
    MDIIcons["language_php"] = "\uF81E";
    MDIIcons["language_python"] = "\uF81F";
    MDIIcons["language_python_text"] = "\uF820";
    MDIIcons["language_r"] = "\uFCD2";
    MDIIcons["language_swift"] = "\uFBE3";
    MDIIcons["language_typescript"] = "\uFBE4";
    MDIIcons["laptop"] = "\uF821";
    MDIIcons["laptop_chromebook"] = "\uF822";
    MDIIcons["laptop_mac"] = "\uF823";
    MDIIcons["laptop_off"] = "\uFBE5";
    MDIIcons["laptop_windows"] = "\uF824";
    MDIIcons["lastfm"] = "\uF825";
    MDIIcons["lastpass"] = "\uF945";
    MDIIcons["launch"] = "\uF826";
    MDIIcons["lava_lamp"] = "\uFCD3";
    MDIIcons["layers"] = "\uF827";
    MDIIcons["layers_off"] = "\uF828";
    MDIIcons["lead_pencil"] = "\uFB4E";
    MDIIcons["leaf"] = "\uF829";
    MDIIcons["led_off"] = "\uF82A";
    MDIIcons["led_on"] = "\uF82B";
    MDIIcons["led_outline"] = "\uF82C";
    MDIIcons["led_strip"] = "\uFCD4";
    MDIIcons["led_variant_off"] = "\uF82D";
    MDIIcons["led_variant_on"] = "\uF82E";
    MDIIcons["led_variant_outline"] = "\uF82F";
    MDIIcons["library"] = "\uF830";
    MDIIcons["library_books"] = "\uF831";
    MDIIcons["library_music"] = "\uF832";
    MDIIcons["library_plus"] = "\uF833";
    MDIIcons["lightbulb"] = "\uF834";
    MDIIcons["lightbulb_on"] = "\uFBE6";
    MDIIcons["lightbulb_on_outline"] = "\uFBE7";
    MDIIcons["lightbulb_outline"] = "\uF835";
    MDIIcons["link"] = "\uF836";
    MDIIcons["link_off"] = "\uF837";
    MDIIcons["link_variant"] = "\uF838";
    MDIIcons["link_variant_off"] = "\uF839";
    MDIIcons["linkedin"] = "\uF83A";
    MDIIcons["linkedin_box"] = "\uF83B";
    MDIIcons["linux"] = "\uF83C";
    MDIIcons["loading"] = "\uFC70";
    MDIIcons["lock"] = "\uF83D";
    MDIIcons["lock_open"] = "\uF83E";
    MDIIcons["lock_open_outline"] = "\uF83F";
    MDIIcons["lock_outline"] = "\uF840";
    MDIIcons["lock_pattern"] = "\uFBE8";
    MDIIcons["lock_plus"] = "\uFAFA";
    MDIIcons["lock_reset"] = "\uFC71";
    MDIIcons["locker"] = "\uFCD5";
    MDIIcons["locker_multiple"] = "\uFCD6";
    MDIIcons["login"] = "\uF841";
    MDIIcons["login_variant"] = "\uFAFB";
    MDIIcons["logout"] = "\uF842";
    MDIIcons["logout_variant"] = "\uFAFC";
    MDIIcons["looks"] = "\uF843";
    MDIIcons["loop"] = "\uFBE9";
    MDIIcons["loupe"] = "\uF844";
    MDIIcons["lumx"] = "\uF845";
    MDIIcons["magnet"] = "\uF846";
    MDIIcons["magnet_on"] = "\uF847";
    MDIIcons["magnify"] = "\uF848";
    MDIIcons["magnify_minus"] = "\uF849";
    MDIIcons["magnify_minus_outline"] = "\uFBEA";
    MDIIcons["magnify_plus"] = "\uF84A";
    MDIIcons["magnify_plus_outline"] = "\uFBEB";
    MDIIcons["mail_ru"] = "\uF84B";
    MDIIcons["mailbox"] = "\uFBEC";
    MDIIcons["map"] = "\uF84C";
    MDIIcons["map_marker"] = "\uF84D";
    MDIIcons["map_marker_circle"] = "\uF84E";
    MDIIcons["map_marker_minus"] = "\uFB4F";
    MDIIcons["map_marker_multiple"] = "\uF84F";
    MDIIcons["map_marker_off"] = "\uF850";
    MDIIcons["map_marker_outline"] = "\uFCD7";
    MDIIcons["map_marker_plus"] = "\uFB50";
    MDIIcons["map_marker_radius"] = "\uF851";
    MDIIcons["margin"] = "\uF852";
    MDIIcons["markdown"] = "\uF853";
    MDIIcons["marker"] = "\uFB51";
    MDIIcons["marker_check"] = "\uF854";
    MDIIcons["martini"] = "\uF855";
    MDIIcons["material_ui"] = "\uF856";
    MDIIcons["math_compass"] = "\uF857";
    MDIIcons["matrix"] = "\uFB27";
    MDIIcons["maxcdn"] = "\uF858";
    MDIIcons["medical_bag"] = "\uFBED";
    MDIIcons["medium"] = "\uF859";
    MDIIcons["memory"] = "\uF85A";
    MDIIcons["menu"] = "\uF85B";
    MDIIcons["menu_down"] = "\uF85C";
    MDIIcons["menu_down_outline"] = "\uFBB4";
    MDIIcons["menu_left"] = "\uF85D";
    MDIIcons["menu_right"] = "\uF85E";
    MDIIcons["menu_up"] = "\uF85F";
    MDIIcons["menu_up_outline"] = "\uFBB5";
    MDIIcons["message"] = "\uF860";
    MDIIcons["message_alert"] = "\uF861";
    MDIIcons["message_bulleted"] = "\uFBA0";
    MDIIcons["message_bulleted_off"] = "\uFBA1";
    MDIIcons["message_draw"] = "\uF862";
    MDIIcons["message_image"] = "\uF863";
    MDIIcons["message_outline"] = "\uF864";
    MDIIcons["message_plus"] = "\uFB52";
    MDIIcons["message_processing"] = "\uF865";
    MDIIcons["message_reply"] = "\uF866";
    MDIIcons["message_reply_text"] = "\uF867";
    MDIIcons["message_settings"] = "\uFBEE";
    MDIIcons["message_settings_variant"] = "\uFBEF";
    MDIIcons["message_text"] = "\uF868";
    MDIIcons["message_text_outline"] = "\uF869";
    MDIIcons["message_video"] = "\uF86A";
    MDIIcons["meteor"] = "\uFB28";
    MDIIcons["metronome"] = "\uFCD8";
    MDIIcons["metronome_tick"] = "\uFCD9";
    MDIIcons["micro_sd"] = "\uFCDA";
    MDIIcons["microphone"] = "\uF86B";
    MDIIcons["microphone_off"] = "\uF86C";
    MDIIcons["microphone_outline"] = "\uF86D";
    MDIIcons["microphone_settings"] = "\uF86E";
    MDIIcons["microphone_variant"] = "\uF86F";
    MDIIcons["microphone_variant_off"] = "\uF870";
    MDIIcons["microscope"] = "\uFB53";
    MDIIcons["microsoft"] = "\uF871";
    MDIIcons["minecraft"] = "\uF872";
    MDIIcons["minus"] = "\uF873";
    MDIIcons["minus_box"] = "\uF874";
    MDIIcons["minus_box_outline"] = "\uFBF0";
    MDIIcons["minus_circle"] = "\uF875";
    MDIIcons["minus_circle_outline"] = "\uF876";
    MDIIcons["minus_network"] = "\uF877";
    MDIIcons["mixcloud"] = "\uFB29";
    MDIIcons["mixer"] = "\uFCDB";
    MDIIcons["monitor"] = "\uF878";
    MDIIcons["monitor_multiple"] = "\uF879";
    MDIIcons["more"] = "\uF87A";
    MDIIcons["motorbike"] = "\uF87B";
    MDIIcons["mouse"] = "\uF87C";
    MDIIcons["mouse_off"] = "\uF87D";
    MDIIcons["mouse_variant"] = "\uF87E";
    MDIIcons["mouse_variant_off"] = "\uF87F";
    MDIIcons["move_resize"] = "\uFB54";
    MDIIcons["move_resize_variant"] = "\uFB55";
    MDIIcons["movie"] = "\uF880";
    MDIIcons["movie_roll"] = "\uFCDC";
    MDIIcons["multiplication"] = "\uF881";
    MDIIcons["multiplication_box"] = "\uF882";
    MDIIcons["mushroom"] = "\uFCDD";
    MDIIcons["mushroom_outline"] = "\uFCDE";
    MDIIcons["music"] = "\uFC58";
    MDIIcons["music_box"] = "\uF883";
    MDIIcons["music_box_outline"] = "\uF884";
    MDIIcons["music_circle"] = "\uF885";
    MDIIcons["music_note"] = "\uF886";
    MDIIcons["music_note_bluetooth"] = "\uFAFD";
    MDIIcons["music_note_bluetooth_off"] = "\uFAFE";
    MDIIcons["music_note_eighth"] = "\uF887";
    MDIIcons["music_note_half"] = "\uF888";
    MDIIcons["music_note_off"] = "\uF889";
    MDIIcons["music_note_quarter"] = "\uF88A";
    MDIIcons["music_note_sixteenth"] = "\uF88B";
    MDIIcons["music_note_whole"] = "\uF88C";
    MDIIcons["music_off"] = "\uFC59";
    MDIIcons["nature"] = "\uF88D";
    MDIIcons["nature_people"] = "\uF88E";
    MDIIcons["navigation"] = "\uF88F";
    MDIIcons["near_me"] = "\uFACC";
    MDIIcons["needle"] = "\uF890";
    MDIIcons["nest_protect"] = "\uF891";
    MDIIcons["nest_thermostat"] = "\uF892";
    MDIIcons["netflix"] = "\uFC44";
    MDIIcons["network"] = "\uFBF1";
    MDIIcons["new_box"] = "\uF893";
    MDIIcons["newspaper"] = "\uF894";
    MDIIcons["nfc"] = "\uF895";
    MDIIcons["nfc_tap"] = "\uF896";
    MDIIcons["nfc_variant"] = "\uF897";
    MDIIcons["ninja"] = "\uFC72";
    MDIIcons["nintendo_switch"] = "\uFCDF";
    MDIIcons["nodejs"] = "\uF898";
    MDIIcons["note"] = "\uF899";
    MDIIcons["note_multiple"] = "\uFBB6";
    MDIIcons["note_multiple_outline"] = "\uFBB7";
    MDIIcons["note_outline"] = "\uF89A";
    MDIIcons["note_plus"] = "\uF89B";
    MDIIcons["note_plus_outline"] = "\uF89C";
    MDIIcons["note_text"] = "\uF89D";
    MDIIcons["notebook"] = "\uFD2C";
    MDIIcons["notification_clear_all"] = "\uF89E";
    MDIIcons["npm"] = "\uFBF5";
    MDIIcons["nuke"] = "\uFBA2";
    MDIIcons["null"] = "\uFCE0";
    MDIIcons["numeric"] = "\uF89F";
    MDIIcons["numeric_0_box"] = "\uF8A0";
    MDIIcons["numeric_0_box_multiple_outline"] = "\uF8A1";
    MDIIcons["numeric_0_box_outline"] = "\uF8A2";
    MDIIcons["numeric_1_box"] = "\uF8A3";
    MDIIcons["numeric_1_box_multiple_outline"] = "\uF8A4";
    MDIIcons["numeric_1_box_outline"] = "\uF8A5";
    MDIIcons["numeric_2_box"] = "\uF8A6";
    MDIIcons["numeric_2_box_multiple_outline"] = "\uF8A7";
    MDIIcons["numeric_2_box_outline"] = "\uF8A8";
    MDIIcons["numeric_3_box"] = "\uF8A9";
    MDIIcons["numeric_3_box_multiple_outline"] = "\uF8AA";
    MDIIcons["numeric_3_box_outline"] = "\uF8AB";
    MDIIcons["numeric_4_box"] = "\uF8AC";
    MDIIcons["numeric_4_box_multiple_outline"] = "\uF8AD";
    MDIIcons["numeric_4_box_outline"] = "\uF8AE";
    MDIIcons["numeric_5_box"] = "\uF8AF";
    MDIIcons["numeric_5_box_multiple_outline"] = "\uF8B0";
    MDIIcons["numeric_5_box_outline"] = "\uF8B1";
    MDIIcons["numeric_6_box"] = "\uF8B2";
    MDIIcons["numeric_6_box_multiple_outline"] = "\uF8B3";
    MDIIcons["numeric_6_box_outline"] = "\uF8B4";
    MDIIcons["numeric_7_box"] = "\uF8B5";
    MDIIcons["numeric_7_box_multiple_outline"] = "\uF8B6";
    MDIIcons["numeric_7_box_outline"] = "\uF8B7";
    MDIIcons["numeric_8_box"] = "\uF8B8";
    MDIIcons["numeric_8_box_multiple_outline"] = "\uF8B9";
    MDIIcons["numeric_8_box_outline"] = "\uF8BA";
    MDIIcons["numeric_9_box"] = "\uF8BB";
    MDIIcons["numeric_9_box_multiple_outline"] = "\uF8BC";
    MDIIcons["numeric_9_box_outline"] = "\uF8BD";
    MDIIcons["numeric_9_plus_box"] = "\uF8BE";
    MDIIcons["numeric_9_plus_box_multiple_outline"] = "\uF8BF";
    MDIIcons["numeric_9_plus_box_outline"] = "\uF8C0";
    MDIIcons["nut"] = "\uFBF6";
    MDIIcons["nutrition"] = "\uF8C1";
    MDIIcons["oar"] = "\uFB7A";
    MDIIcons["octagon"] = "\uF8C2";
    MDIIcons["octagon_outline"] = "\uF8C3";
    MDIIcons["octagram"] = "\uFBF7";
    MDIIcons["octagram_outline"] = "\uFC73";
    MDIIcons["odnoklassniki"] = "\uF8C4";
    MDIIcons["office"] = "\uF8C5";
    MDIIcons["oil"] = "\uF8C6";
    MDIIcons["oil_temperature"] = "\uF8C7";
    MDIIcons["omega"] = "\uF8C8";
    MDIIcons["onedrive"] = "\uF8C9";
    MDIIcons["onenote"] = "\uFC45";
    MDIIcons["opacity"] = "\uFACB";
    MDIIcons["open_in_app"] = "\uF8CA";
    MDIIcons["open_in_new"] = "\uF8CB";
    MDIIcons["openid"] = "\uF8CC";
    MDIIcons["opera"] = "\uF8CD";
    MDIIcons["orbit"] = "\uF517";
    MDIIcons["ornament"] = "\uF8CE";
    MDIIcons["ornament_variant"] = "\uF8CF";
    MDIIcons["owl"] = "\uF8D1";
    MDIIcons["package"] = "\uF8D2";
    MDIIcons["package_down"] = "\uF8D3";
    MDIIcons["package_up"] = "\uF8D4";
    MDIIcons["package_variant"] = "\uF8D5";
    MDIIcons["package_variant_closed"] = "\uF8D6";
    MDIIcons["page_first"] = "\uFAFF";
    MDIIcons["page_last"] = "\uFB00";
    MDIIcons["page_layout_body"] = "\uFBF8";
    MDIIcons["page_layout_footer"] = "\uFBF9";
    MDIIcons["page_layout_header"] = "\uFBFA";
    MDIIcons["page_layout_sidebar_left"] = "\uFBFB";
    MDIIcons["page_layout_sidebar_right"] = "\uFBFC";
    MDIIcons["palette"] = "\uF8D7";
    MDIIcons["palette_advanced"] = "\uF8D8";
    MDIIcons["panda"] = "\uF8D9";
    MDIIcons["pandora"] = "\uF8DA";
    MDIIcons["panorama"] = "\uF8DB";
    MDIIcons["panorama_fisheye"] = "\uF8DC";
    MDIIcons["panorama_horizontal"] = "\uF8DD";
    MDIIcons["panorama_vertical"] = "\uF8DE";
    MDIIcons["panorama_wide_angle"] = "\uF8DF";
    MDIIcons["paper_cut_vertical"] = "\uF8E0";
    MDIIcons["paperclip"] = "\uF8E1";
    MDIIcons["parking"] = "\uF8E2";
    MDIIcons["passport"] = "\uFCE1";
    MDIIcons["pause"] = "\uF8E3";
    MDIIcons["pause_circle"] = "\uF8E4";
    MDIIcons["pause_circle_outline"] = "\uF8E5";
    MDIIcons["pause_octagon"] = "\uF8E6";
    MDIIcons["pause_octagon_outline"] = "\uF8E7";
    MDIIcons["paw"] = "\uF8E8";
    MDIIcons["paw_off"] = "\uFB56";
    MDIIcons["pen"] = "\uF8E9";
    MDIIcons["pencil"] = "\uF8EA";
    MDIIcons["pencil_box"] = "\uF8EB";
    MDIIcons["pencil_box_outline"] = "\uF8EC";
    MDIIcons["pencil_circle"] = "\uFBFD";
    MDIIcons["pencil_circle_outline"] = "\uFC74";
    MDIIcons["pencil_lock"] = "\uF8ED";
    MDIIcons["pencil_off"] = "\uF8EE";
    MDIIcons["pentagon"] = "\uFBFE";
    MDIIcons["pentagon_outline"] = "\uFBFF";
    MDIIcons["percent"] = "\uF8EF";
    MDIIcons["periodic_table_co2"] = "\uFCE2";
    MDIIcons["periscope"] = "\uFC46";
    MDIIcons["pharmacy"] = "\uF8F0";
    MDIIcons["phone"] = "\uF8F1";
    MDIIcons["phone_bluetooth"] = "\uF8F2";
    MDIIcons["phone_classic"] = "\uFB01";
    MDIIcons["phone_forward"] = "\uF8F3";
    MDIIcons["phone_hangup"] = "\uF8F4";
    MDIIcons["phone_in_talk"] = "\uF8F5";
    MDIIcons["phone_incoming"] = "\uF8F6";
    MDIIcons["phone_locked"] = "\uF8F7";
    MDIIcons["phone_log"] = "\uF8F8";
    MDIIcons["phone_minus"] = "\uFB57";
    MDIIcons["phone_missed"] = "\uF8F9";
    MDIIcons["phone_outgoing"] = "\uF8FA";
    MDIIcons["phone_paused"] = "\uF8FB";
    MDIIcons["phone_plus"] = "\uFB58";
    MDIIcons["phone_return"] = "\uFD2D";
    MDIIcons["phone_settings"] = "\uF8FC";
    MDIIcons["phone_voip"] = "\uF8FD";
    MDIIcons["pi"] = "\uF8FE";
    MDIIcons["pi_box"] = "\uF8FF";
    MDIIcons["piano"] = "\uFB7B";
    MDIIcons["pig"] = "\uF900";
    MDIIcons["pill"] = "\uF901";
    MDIIcons["pillar"] = "\uFC00";
    MDIIcons["pin"] = "\uF902";
    MDIIcons["pin_off"] = "\uF903";
    MDIIcons["pine_tree"] = "\uF904";
    MDIIcons["pine_tree_box"] = "\uF905";
    MDIIcons["pinterest"] = "\uF906";
    MDIIcons["pinterest_box"] = "\uF907";
    MDIIcons["pipe"] = "\uFCE3";
    MDIIcons["pipe_disconnected"] = "\uFCE4";
    MDIIcons["pistol"] = "\uFC01";
    MDIIcons["pizza"] = "\uF908";
    MDIIcons["plane_shield"] = "\uFBB9";
    MDIIcons["play"] = "\uF909";
    MDIIcons["play_box_outline"] = "\uF90A";
    MDIIcons["play_circle"] = "\uF90B";
    MDIIcons["play_circle_outline"] = "\uF90C";
    MDIIcons["play_pause"] = "\uF90D";
    MDIIcons["play_protected_content"] = "\uF90E";
    MDIIcons["playlist_check"] = "\uFAC6";
    MDIIcons["playlist_minus"] = "\uF90F";
    MDIIcons["playlist_play"] = "\uF910";
    MDIIcons["playlist_plus"] = "\uF911";
    MDIIcons["playlist_remove"] = "\uF912";
    MDIIcons["playstation"] = "\uF913";
    MDIIcons["plex"] = "\uFBB8";
    MDIIcons["plus"] = "\uF914";
    MDIIcons["plus_box"] = "\uF915";
    MDIIcons["plus_box_outline"] = "\uFC02";
    MDIIcons["plus_circle"] = "\uF916";
    MDIIcons["plus_circle_multiple_outline"] = "\uF917";
    MDIIcons["plus_circle_outline"] = "\uF918";
    MDIIcons["plus_network"] = "\uF919";
    MDIIcons["plus_one"] = "\uF91A";
    MDIIcons["plus_outline"] = "\uFC03";
    MDIIcons["pocket"] = "\uF91B";
    MDIIcons["pokeball"] = "\uF91C";
    MDIIcons["poker_chip"] = "\uFD2E";
    MDIIcons["polaroid"] = "\uF91D";
    MDIIcons["poll"] = "\uF91E";
    MDIIcons["poll_box"] = "\uF91F";
    MDIIcons["polymer"] = "\uF920";
    MDIIcons["pool"] = "\uFB05";
    MDIIcons["popcorn"] = "\uF921";
    MDIIcons["pot"] = "\uFB59";
    MDIIcons["pot_mix"] = "\uFB5A";
    MDIIcons["pound"] = "\uF922";
    MDIIcons["pound_box"] = "\uF923";
    MDIIcons["power"] = "\uF924";
    MDIIcons["power_plug"] = "\uFBA3";
    MDIIcons["power_plug_off"] = "\uFBA4";
    MDIIcons["power_settings"] = "\uF925";
    MDIIcons["power_socket"] = "\uF926";
    MDIIcons["power_socket_eu"] = "\uFCE5";
    MDIIcons["power_socket_uk"] = "\uFCE6";
    MDIIcons["power_socket_us"] = "\uFCE7";
    MDIIcons["prescription"] = "\uFC04";
    MDIIcons["presentation"] = "\uF927";
    MDIIcons["presentation_play"] = "\uF928";
    MDIIcons["printer"] = "\uF929";
    MDIIcons["printer_3d"] = "\uF92A";
    MDIIcons["printer_alert"] = "\uF92B";
    MDIIcons["printer_settings"] = "\uFC05";
    MDIIcons["priority_high"] = "\uFB02";
    MDIIcons["priority_low"] = "\uFB03";
    MDIIcons["professional_hexagon"] = "\uF92C";
    MDIIcons["projector"] = "\uF92D";
    MDIIcons["projector_screen"] = "\uF92E";
    MDIIcons["publish"] = "\uFBA5";
    MDIIcons["pulse"] = "\uF92F";
    MDIIcons["puzzle"] = "\uF930";
    MDIIcons["qqchat"] = "\uFB04";
    MDIIcons["qrcode"] = "\uF931";
    MDIIcons["qrcode_scan"] = "\uF932";
    MDIIcons["quadcopter"] = "\uF933";
    MDIIcons["quality_high"] = "\uF934";
    MDIIcons["quicktime"] = "\uF935";
    MDIIcons["radar"] = "\uF936";
    MDIIcons["radiator"] = "\uF937";
    MDIIcons["radio"] = "\uF938";
    MDIIcons["radio_handheld"] = "\uF939";
    MDIIcons["radio_tower"] = "\uF93A";
    MDIIcons["radioactive"] = "\uF93B";
    MDIIcons["radiobox_blank"] = "\uF93C";
    MDIIcons["radiobox_marked"] = "\uF93D";
    MDIIcons["raspberrypi"] = "\uF93E";
    MDIIcons["ray_end"] = "\uF93F";
    MDIIcons["ray_end_arrow"] = "\uF940";
    MDIIcons["ray_start"] = "\uF941";
    MDIIcons["ray_start_arrow"] = "\uF942";
    MDIIcons["ray_start_end"] = "\uF943";
    MDIIcons["ray_vertex"] = "\uF944";
    MDIIcons["react"] = "\uFC06";
    MDIIcons["read"] = "\uF946";
    MDIIcons["receipt"] = "\uF948";
    MDIIcons["record"] = "\uF949";
    MDIIcons["record_rec"] = "\uF94A";
    MDIIcons["recycle"] = "\uF94B";
    MDIIcons["reddit"] = "\uF94C";
    MDIIcons["redo"] = "\uF94D";
    MDIIcons["redo_variant"] = "\uF94E";
    MDIIcons["refresh"] = "\uF94F";
    MDIIcons["regex"] = "\uF950";
    MDIIcons["relative_scale"] = "\uF951";
    MDIIcons["reload"] = "\uF952";
    MDIIcons["remote"] = "\uF953";
    MDIIcons["rename_box"] = "\uF954";
    MDIIcons["reorder_horizontal"] = "\uFB86";
    MDIIcons["reorder_vertical"] = "\uFB87";
    MDIIcons["repeat"] = "\uF955";
    MDIIcons["repeat_off"] = "\uF956";
    MDIIcons["repeat_once"] = "\uF957";
    MDIIcons["replay"] = "\uF958";
    MDIIcons["reply"] = "\uF959";
    MDIIcons["reply_all"] = "\uF95A";
    MDIIcons["reproduction"] = "\uF95B";
    MDIIcons["resize_bottom_right"] = "\uF95C";
    MDIIcons["responsive"] = "\uF95D";
    MDIIcons["restart"] = "\uFC07";
    MDIIcons["restore"] = "\uFBA6";
    MDIIcons["rewind"] = "\uF95E";
    MDIIcons["rewind_outline"] = "\uFC08";
    MDIIcons["rhombus"] = "\uFC09";
    MDIIcons["rhombus_outline"] = "\uFC0A";
    MDIIcons["ribbon"] = "\uF95F";
    MDIIcons["rice"] = "\uFCE8";
    MDIIcons["ring"] = "\uFCE9";
    MDIIcons["road"] = "\uF960";
    MDIIcons["road_variant"] = "\uF961";
    MDIIcons["robot"] = "\uFBA7";
    MDIIcons["rocket"] = "\uF962";
    MDIIcons["roomba"] = "\uFC0B";
    MDIIcons["rotate_3d"] = "\uF963";
    MDIIcons["rotate_left"] = "\uF964";
    MDIIcons["rotate_left_variant"] = "\uF965";
    MDIIcons["rotate_right"] = "\uF966";
    MDIIcons["rotate_right_variant"] = "\uF967";
    MDIIcons["rounded_corner"] = "\uFB06";
    MDIIcons["router_wireless"] = "\uF968";
    MDIIcons["routes"] = "\uF969";
    MDIIcons["rowing"] = "\uFB07";
    MDIIcons["rss"] = "\uF96A";
    MDIIcons["rss_box"] = "\uF96B";
    MDIIcons["ruler"] = "\uF96C";
    MDIIcons["run"] = "\uFC0C";
    MDIIcons["run_fast"] = "\uF96D";
    MDIIcons["sale"] = "\uF96E";
    MDIIcons["sass"] = "\uFCEA";
    MDIIcons["satellite"] = "\uF96F";
    MDIIcons["satellite_variant"] = "\uF970";
    MDIIcons["saxophone"] = "\uFB08";
    MDIIcons["scale"] = "\uF971";
    MDIIcons["scale_balance"] = "\uFAD0";
    MDIIcons["scale_bathroom"] = "\uF972";
    MDIIcons["scanner"] = "\uFBA9";
    MDIIcons["school"] = "\uF973";
    MDIIcons["screen_rotation"] = "\uF974";
    MDIIcons["screen_rotation_lock"] = "\uF975";
    MDIIcons["screwdriver"] = "\uF976";
    MDIIcons["script"] = "\uF977";
    MDIIcons["sd"] = "\uF978";
    MDIIcons["seal"] = "\uF979";
    MDIIcons["search_web"] = "\uFC0D";
    MDIIcons["seat_flat"] = "\uF97A";
    MDIIcons["seat_flat_angled"] = "\uF97B";
    MDIIcons["seat_individual_suite"] = "\uF97C";
    MDIIcons["seat_legroom_extra"] = "\uF97D";
    MDIIcons["seat_legroom_normal"] = "\uF97E";
    MDIIcons["seat_legroom_reduced"] = "\uF97F";
    MDIIcons["seat_recline_extra"] = "\uF980";
    MDIIcons["seat_recline_normal"] = "\uF981";
    MDIIcons["security"] = "\uF982";
    MDIIcons["security_home"] = "\uFB88";
    MDIIcons["security_network"] = "\uF983";
    MDIIcons["select"] = "\uF984";
    MDIIcons["select_all"] = "\uF985";
    MDIIcons["select_inverse"] = "\uF986";
    MDIIcons["select_off"] = "\uF987";
    MDIIcons["selection"] = "\uF988";
    MDIIcons["selection_off"] = "\uFC75";
    MDIIcons["send"] = "\uF989";
    MDIIcons["send_secure"] = "\uFCEB";
    MDIIcons["serial_port"] = "\uFB5B";
    MDIIcons["server"] = "\uF98A";
    MDIIcons["server_minus"] = "\uF98B";
    MDIIcons["server_network"] = "\uF98C";
    MDIIcons["server_network_off"] = "\uF98D";
    MDIIcons["server_off"] = "\uF98E";
    MDIIcons["server_plus"] = "\uF98F";
    MDIIcons["server_remove"] = "\uF990";
    MDIIcons["server_security"] = "\uF991";
    MDIIcons["set_all"] = "\uFC76";
    MDIIcons["set_center"] = "\uFC77";
    MDIIcons["set_center_right"] = "\uFC78";
    MDIIcons["set_left"] = "\uFC79";
    MDIIcons["set_left_center"] = "\uFC7A";
    MDIIcons["set_left_right"] = "\uFC7B";
    MDIIcons["set_none"] = "\uFC7C";
    MDIIcons["set_right"] = "\uFC7D";
    MDIIcons["settings"] = "\uF992";
    MDIIcons["settings_box"] = "\uF993";
    MDIIcons["shape"] = "\uFD2F";
    MDIIcons["shape_circle_plus"] = "\uFB5C";
    MDIIcons["shape_outline"] = "\uFD30";
    MDIIcons["shape_plus"] = "\uF994";
    MDIIcons["shape_polygon_plus"] = "\uFB5D";
    MDIIcons["shape_rectangle_plus"] = "\uFB5E";
    MDIIcons["shape_square_plus"] = "\uFB5F";
    MDIIcons["share"] = "\uF995";
    MDIIcons["share_variant"] = "\uF996";
    MDIIcons["shield"] = "\uF997";
    MDIIcons["shield_half_full"] = "\uFC7E";
    MDIIcons["shield_outline"] = "\uF998";
    MDIIcons["ship_wheel"] = "\uFD31";
    MDIIcons["shopping"] = "\uF999";
    MDIIcons["shopping_music"] = "\uF99A";
    MDIIcons["shovel"] = "\uFC0E";
    MDIIcons["shovel_off"] = "\uFC0F";
    MDIIcons["shredder"] = "\uF99B";
    MDIIcons["shuffle"] = "\uF99C";
    MDIIcons["shuffle_disabled"] = "\uF99D";
    MDIIcons["shuffle_variant"] = "\uF99E";
    MDIIcons["sigma"] = "\uF99F";
    MDIIcons["sigma_lower"] = "\uFB2A";
    MDIIcons["sign_caution"] = "\uF9A0";
    MDIIcons["sign_direction"] = "\uFC7F";
    MDIIcons["sign_text"] = "\uFC80";
    MDIIcons["signal"] = "\uF9A1";
    MDIIcons["signal_2g"] = "\uFC10";
    MDIIcons["signal_3g"] = "\uFC11";
    MDIIcons["signal_4g"] = "\uFC12";
    MDIIcons["signal_hspa"] = "\uFC13";
    MDIIcons["signal_hspa_plus"] = "\uFC14";
    MDIIcons["signal_off"] = "\uFC81";
    MDIIcons["signal_variant"] = "\uFB09";
    MDIIcons["silverware"] = "\uF9A2";
    MDIIcons["silverware_fork"] = "\uF9A3";
    MDIIcons["silverware_spoon"] = "\uF9A4";
    MDIIcons["silverware_variant"] = "\uF9A5";
    MDIIcons["sim"] = "\uF9A6";
    MDIIcons["sim_alert"] = "\uF9A7";
    MDIIcons["sim_off"] = "\uF9A8";
    MDIIcons["sitemap"] = "\uF9A9";
    MDIIcons["skip_backward"] = "\uF9AA";
    MDIIcons["skip_forward"] = "\uF9AB";
    MDIIcons["skip_next"] = "\uF9AC";
    MDIIcons["skip_next_circle"] = "\uFB60";
    MDIIcons["skip_next_circle_outline"] = "\uFB61";
    MDIIcons["skip_previous"] = "\uF9AD";
    MDIIcons["skip_previous_circle"] = "\uFB62";
    MDIIcons["skip_previous_circle_outline"] = "\uFB63";
    MDIIcons["skull"] = "\uFB8A";
    MDIIcons["skype"] = "\uF9AE";
    MDIIcons["skype_business"] = "\uF9AF";
    MDIIcons["slack"] = "\uF9B0";
    MDIIcons["sleep"] = "\uF9B1";
    MDIIcons["sleep_off"] = "\uF9B2";
    MDIIcons["smoking"] = "\uF9B3";
    MDIIcons["smoking_off"] = "\uF9B4";
    MDIIcons["snapchat"] = "\uF9B5";
    MDIIcons["snowflake"] = "\uFC15";
    MDIIcons["snowman"] = "\uF9B6";
    MDIIcons["soccer"] = "\uF9B7";
    MDIIcons["soccer_field"] = "\uFD32";
    MDIIcons["sofa"] = "\uF9B8";
    MDIIcons["solid"] = "\uFB8B";
    MDIIcons["sort"] = "\uF9B9";
    MDIIcons["sort_alphabetical"] = "\uF9BA";
    MDIIcons["sort_ascending"] = "\uF9BB";
    MDIIcons["sort_descending"] = "\uF9BC";
    MDIIcons["sort_numeric"] = "\uF9BD";
    MDIIcons["sort_variant"] = "\uF9BE";
    MDIIcons["soundcloud"] = "\uF9BF";
    MDIIcons["source_branch"] = "\uFB2B";
    MDIIcons["source_commit"] = "\uFC16";
    MDIIcons["source_commit_end"] = "\uFC17";
    MDIIcons["source_commit_end_local"] = "\uFC18";
    MDIIcons["source_commit_local"] = "\uFC19";
    MDIIcons["source_commit_next_local"] = "\uFC1A";
    MDIIcons["source_commit_start"] = "\uFC1B";
    MDIIcons["source_commit_start_next_local"] = "\uFC1C";
    MDIIcons["source_fork"] = "\uF9C0";
    MDIIcons["source_merge"] = "\uFB2C";
    MDIIcons["source_pull"] = "\uF9C1";
    MDIIcons["soy_sauce"] = "\uFCEC";
    MDIIcons["speaker"] = "\uF9C2";
    MDIIcons["speaker_off"] = "\uF9C3";
    MDIIcons["speaker_wireless"] = "\uFC1D";
    MDIIcons["speedometer"] = "\uF9C4";
    MDIIcons["spellcheck"] = "\uF9C5";
    MDIIcons["spotify"] = "\uF9C6";
    MDIIcons["spotlight"] = "\uF9C7";
    MDIIcons["spotlight_beam"] = "\uF9C8";
    MDIIcons["spray"] = "\uFB64";
    MDIIcons["square"] = "\uFC62";
    MDIIcons["square_inc"] = "\uF9C9";
    MDIIcons["square_inc_cash"] = "\uF9CA";
    MDIIcons["square_outline"] = "\uFC61";
    MDIIcons["square_root"] = "\uFC82";
    MDIIcons["stack_overflow"] = "\uF9CB";
    MDIIcons["stackexchange"] = "\uFB0A";
    MDIIcons["stadium"] = "\uFC1E";
    MDIIcons["stairs"] = "\uF9CC";
    MDIIcons["standard_definition"] = "\uFCED";
    MDIIcons["star"] = "\uF9CD";
    MDIIcons["star_circle"] = "\uF9CE";
    MDIIcons["star_half"] = "\uF9CF";
    MDIIcons["star_off"] = "\uF9D0";
    MDIIcons["star_outline"] = "\uF9D1";
    MDIIcons["steam"] = "\uF9D2";
    MDIIcons["steering"] = "\uF9D3";
    MDIIcons["step_backward"] = "\uF9D4";
    MDIIcons["step_backward_2"] = "\uF9D5";
    MDIIcons["step_forward"] = "\uF9D6";
    MDIIcons["step_forward_2"] = "\uF9D7";
    MDIIcons["stethoscope"] = "\uF9D8";
    MDIIcons["sticker"] = "\uFACF";
    MDIIcons["sticker_emoji"] = "\uFC83";
    MDIIcons["stocking"] = "\uF9D9";
    MDIIcons["stop"] = "\uF9DA";
    MDIIcons["stop_circle"] = "\uFB65";
    MDIIcons["stop_circle_outline"] = "\uFB66";
    MDIIcons["store"] = "\uF9DB";
    MDIIcons["store_24_hour"] = "\uF9DC";
    MDIIcons["stove"] = "\uF9DD";
    MDIIcons["subdirectory_arrow_left"] = "\uFB0B";
    MDIIcons["subdirectory_arrow_right"] = "\uFB0C";
    MDIIcons["subway"] = "\uFBAA";
    MDIIcons["subway_variant"] = "\uF9DE";
    MDIIcons["summit"] = "\uFC84";
    MDIIcons["sunglasses"] = "\uF9DF";
    MDIIcons["surround_sound"] = "\uFAC4";
    MDIIcons["surround_sound_2_0"] = "\uFCEE";
    MDIIcons["surround_sound_3_1"] = "\uFCEF";
    MDIIcons["surround_sound_5_1"] = "\uFCF0";
    MDIIcons["surround_sound_7_1"] = "\uFCF1";
    MDIIcons["svg"] = "\uFC1F";
    MDIIcons["swap_horizontal"] = "\uF9E0";
    MDIIcons["swap_vertical"] = "\uF9E1";
    MDIIcons["swim"] = "\uF9E2";
    MDIIcons["switch"] = "\uF9E3";
    MDIIcons["sword"] = "\uF9E4";
    MDIIcons["sword_cross"] = "\uFC85";
    MDIIcons["sync"] = "\uF9E5";
    MDIIcons["sync_alert"] = "\uF9E6";
    MDIIcons["sync_off"] = "\uF9E7";
    MDIIcons["tab"] = "\uF9E8";
    MDIIcons["tab_plus"] = "\uFC5A";
    MDIIcons["tab_unselected"] = "\uF9E9";
    MDIIcons["table"] = "\uF9EA";
    MDIIcons["table_column"] = "\uFD33";
    MDIIcons["table_column_plus_after"] = "\uF9EB";
    MDIIcons["table_column_plus_before"] = "\uF9EC";
    MDIIcons["table_column_remove"] = "\uF9ED";
    MDIIcons["table_column_width"] = "\uF9EE";
    MDIIcons["table_edit"] = "\uF9EF";
    MDIIcons["table_large"] = "\uF9F0";
    MDIIcons["table_of_contents"] = "\uFD34";
    MDIIcons["table_row"] = "\uFD35";
    MDIIcons["table_row_height"] = "\uF9F1";
    MDIIcons["table_row_plus_after"] = "\uF9F2";
    MDIIcons["table_row_plus_before"] = "\uF9F3";
    MDIIcons["table_row_remove"] = "\uF9F4";
    MDIIcons["table_settings"] = "\uFD36";
    MDIIcons["tablet"] = "\uF9F5";
    MDIIcons["tablet_android"] = "\uF9F6";
    MDIIcons["tablet_ipad"] = "\uF9F7";
    MDIIcons["taco"] = "\uFC60";
    MDIIcons["tag"] = "\uF9F8";
    MDIIcons["tag_faces"] = "\uF9F9";
    MDIIcons["tag_heart"] = "\uFB89";
    MDIIcons["tag_multiple"] = "\uF9FA";
    MDIIcons["tag_outline"] = "\uF9FB";
    MDIIcons["tag_plus"] = "\uFC20";
    MDIIcons["tag_remove"] = "\uFC21";
    MDIIcons["tag_text_outline"] = "\uF9FC";
    MDIIcons["target"] = "\uF9FD";
    MDIIcons["taxi"] = "\uF9FE";
    MDIIcons["teamviewer"] = "\uF9FF";
    MDIIcons["telegram"] = "\uFA00";
    MDIIcons["television"] = "\uFA01";
    MDIIcons["television_box"] = "\uFD37";
    MDIIcons["television_classic"] = "\uFCF2";
    MDIIcons["television_classic_off"] = "\uFD38";
    MDIIcons["television_guide"] = "\uFA02";
    MDIIcons["television_off"] = "\uFD39";
    MDIIcons["temperature_celsius"] = "\uFA03";
    MDIIcons["temperature_fahrenheit"] = "\uFA04";
    MDIIcons["temperature_kelvin"] = "\uFA05";
    MDIIcons["tennis"] = "\uFA06";
    MDIIcons["tent"] = "\uFA07";
    MDIIcons["terrain"] = "\uFA08";
    MDIIcons["test_tube"] = "\uFB67";
    MDIIcons["text_shadow"] = "\uFB68";
    MDIIcons["text_to_speech"] = "\uFA09";
    MDIIcons["text_to_speech_off"] = "\uFA0A";
    MDIIcons["textbox"] = "\uFB0D";
    MDIIcons["textbox_password"] = "\uFCF3";
    MDIIcons["texture"] = "\uFA0B";
    MDIIcons["theater"] = "\uFA0C";
    MDIIcons["theme_light_dark"] = "\uFA0D";
    MDIIcons["thermometer"] = "\uFA0E";
    MDIIcons["thermometer_lines"] = "\uFA0F";
    MDIIcons["thought_bubble"] = "\uFCF4";
    MDIIcons["thought_bubble_outline"] = "\uFCF5";
    MDIIcons["thumb_down"] = "\uFA10";
    MDIIcons["thumb_down_outline"] = "\uFA11";
    MDIIcons["thumb_up"] = "\uFA12";
    MDIIcons["thumb_up_outline"] = "\uFA13";
    MDIIcons["thumbs_up_down"] = "\uFA14";
    MDIIcons["ticket"] = "\uFA15";
    MDIIcons["ticket_account"] = "\uFA16";
    MDIIcons["ticket_confirmation"] = "\uFA17";
    MDIIcons["ticket_percent"] = "\uFC22";
    MDIIcons["tie"] = "\uFA18";
    MDIIcons["tilde"] = "\uFC23";
    MDIIcons["timelapse"] = "\uFA19";
    MDIIcons["timer"] = "\uFA1A";
    MDIIcons["timer_10"] = "\uFA1B";
    MDIIcons["timer_3"] = "\uFA1C";
    MDIIcons["timer_off"] = "\uFA1D";
    MDIIcons["timer_sand"] = "\uFA1E";
    MDIIcons["timer_sand_empty"] = "\uFBAB";
    MDIIcons["timer_sand_full"] = "\uFC8A";
    MDIIcons["timetable"] = "\uFA1F";
    MDIIcons["toggle_switch"] = "\uFA20";
    MDIIcons["toggle_switch_off"] = "\uFA21";
    MDIIcons["tooltip"] = "\uFA22";
    MDIIcons["tooltip_edit"] = "\uFA23";
    MDIIcons["tooltip_image"] = "\uFA24";
    MDIIcons["tooltip_outline"] = "\uFA25";
    MDIIcons["tooltip_outline_plus"] = "\uFA26";
    MDIIcons["tooltip_text"] = "\uFA27";
    MDIIcons["tooth"] = "\uFA28";
    MDIIcons["tor"] = "\uFA29";
    MDIIcons["tower_beach"] = "\uFB7F";
    MDIIcons["tower_fire"] = "\uFB80";
    MDIIcons["towing"] = "\uFD3A";
    MDIIcons["trackpad"] = "\uFCF6";
    MDIIcons["traffic_light"] = "\uFA2A";
    MDIIcons["train"] = "\uFA2B";
    MDIIcons["tram"] = "\uFA2C";
    MDIIcons["transcribe"] = "\uFA2D";
    MDIIcons["transcribe_close"] = "\uFA2E";
    MDIIcons["transfer"] = "\uFA2F";
    MDIIcons["transit_transfer"] = "\uFBAC";
    MDIIcons["translate"] = "\uFAC9";
    MDIIcons["treasure_chest"] = "\uFC24";
    MDIIcons["tree"] = "\uFA30";
    MDIIcons["trello"] = "\uFA31";
    MDIIcons["trending_down"] = "\uFA32";
    MDIIcons["trending_neutral"] = "\uFA33";
    MDIIcons["trending_up"] = "\uFA34";
    MDIIcons["triangle"] = "\uFA35";
    MDIIcons["triangle_outline"] = "\uFA36";
    MDIIcons["trophy"] = "\uFA37";
    MDIIcons["trophy_award"] = "\uFA38";
    MDIIcons["trophy_outline"] = "\uFA39";
    MDIIcons["trophy_variant"] = "\uFA3A";
    MDIIcons["trophy_variant_outline"] = "\uFA3B";
    MDIIcons["truck"] = "\uFA3C";
    MDIIcons["truck_delivery"] = "\uFA3D";
    MDIIcons["truck_fast"] = "\uFC86";
    MDIIcons["truck_trailer"] = "\uFC25";
    MDIIcons["tshirt_crew"] = "\uFA3E";
    MDIIcons["tshirt_v"] = "\uFA3F";
    MDIIcons["tumblr"] = "\uFA40";
    MDIIcons["tumblr_reblog"] = "\uFA41";
    MDIIcons["tune"] = "\uFB2D";
    MDIIcons["tune_vertical"] = "\uFB69";
    MDIIcons["twitch"] = "\uFA42";
    MDIIcons["twitter"] = "\uFA43";
    MDIIcons["twitter_box"] = "\uFA44";
    MDIIcons["twitter_circle"] = "\uFA45";
    MDIIcons["twitter_retweet"] = "\uFA46";
    MDIIcons["uber"] = "\uFC47";
    MDIIcons["ubuntu"] = "\uFA47";
    MDIIcons["ultra_high_definition"] = "\uFCF7";
    MDIIcons["umbraco"] = "\uFA48";
    MDIIcons["umbrella"] = "\uFA49";
    MDIIcons["umbrella_outline"] = "\uFA4A";
    MDIIcons["undo"] = "\uFA4B";
    MDIIcons["undo_variant"] = "\uFA4C";
    MDIIcons["unfold_less_horizontal"] = "\uFA4D";
    MDIIcons["unfold_less_vertical"] = "\uFC5E";
    MDIIcons["unfold_more_horizontal"] = "\uFA4E";
    MDIIcons["unfold_more_vertical"] = "\uFC5F";
    MDIIcons["ungroup"] = "\uFA4F";
    MDIIcons["unity"] = "\uFBAD";
    MDIIcons["untappd"] = "\uFA50";
    MDIIcons["update"] = "\uFBAE";
    MDIIcons["upload"] = "\uFA51";
    MDIIcons["upload_multiple"] = "\uFD3B";
    MDIIcons["upload_network"] = "\uFBF4";
    MDIIcons["usb"] = "\uFA52";
    MDIIcons["van_passenger"] = "\uFCF8";
    MDIIcons["van_utility"] = "\uFCF9";
    MDIIcons["vanish"] = "\uFCFA";
    MDIIcons["vector_arrange_above"] = "\uFA53";
    MDIIcons["vector_arrange_below"] = "\uFA54";
    MDIIcons["vector_circle"] = "\uFA55";
    MDIIcons["vector_circle_variant"] = "\uFA56";
    MDIIcons["vector_combine"] = "\uFA57";
    MDIIcons["vector_curve"] = "\uFA58";
    MDIIcons["vector_difference"] = "\uFA59";
    MDIIcons["vector_difference_ab"] = "\uFA5A";
    MDIIcons["vector_difference_ba"] = "\uFA5B";
    MDIIcons["vector_intersection"] = "\uFA5C";
    MDIIcons["vector_line"] = "\uFA5D";
    MDIIcons["vector_point"] = "\uFA5E";
    MDIIcons["vector_polygon"] = "\uFA5F";
    MDIIcons["vector_polyline"] = "\uFA60";
    MDIIcons["vector_radius"] = "\uFC48";
    MDIIcons["vector_rectangle"] = "\uFAC5";
    MDIIcons["vector_selection"] = "\uFA61";
    MDIIcons["vector_square"] = "\uF500";
    MDIIcons["vector_triangle"] = "\uFA62";
    MDIIcons["vector_union"] = "\uFA63";
    MDIIcons["venmo"] = "\uFA77";
    MDIIcons["verified"] = "\uFA64";
    MDIIcons["vibrate"] = "\uFA65";
    MDIIcons["video"] = "\uFA66";
    MDIIcons["video_3d"] = "\uFCFB";
    MDIIcons["video_4k_box"] = "\uFD3C";
    MDIIcons["video_input_antenna"] = "\uFD3D";
    MDIIcons["video_input_component"] = "\uFD3E";
    MDIIcons["video_input_hdmi"] = "\uFD3F";
    MDIIcons["video_input_svideo"] = "\uFD40";
    MDIIcons["video_off"] = "\uFA67";
    MDIIcons["video_switch"] = "\uFA68";
    MDIIcons["view_agenda"] = "\uFA69";
    MDIIcons["view_array"] = "\uFA6A";
    MDIIcons["view_carousel"] = "\uFA6B";
    MDIIcons["view_column"] = "\uFA6C";
    MDIIcons["view_dashboard"] = "\uFA6D";
    MDIIcons["view_dashboard_variant"] = "\uFD41";
    MDIIcons["view_day"] = "\uFA6E";
    MDIIcons["view_grid"] = "\uFA6F";
    MDIIcons["view_headline"] = "\uFA70";
    MDIIcons["view_list"] = "\uFA71";
    MDIIcons["view_module"] = "\uFA72";
    MDIIcons["view_parallel"] = "\uFC26";
    MDIIcons["view_quilt"] = "\uFA73";
    MDIIcons["view_sequential"] = "\uFC27";
    MDIIcons["view_stream"] = "\uFA74";
    MDIIcons["view_week"] = "\uFA75";
    MDIIcons["vimeo"] = "\uFA76";
    MDIIcons["violin"] = "\uFB0E";
    MDIIcons["visualstudio"] = "\uFB0F";
    MDIIcons["vk"] = "\uFA78";
    MDIIcons["vk_box"] = "\uFA79";
    MDIIcons["vk_circle"] = "\uFA7A";
    MDIIcons["vlc"] = "\uFA7B";
    MDIIcons["voice"] = "\uFACA";
    MDIIcons["voicemail"] = "\uFA7C";
    MDIIcons["volume_high"] = "\uFA7D";
    MDIIcons["volume_low"] = "\uFA7E";
    MDIIcons["volume_medium"] = "\uFA7F";
    MDIIcons["volume_minus"] = "\uFC5C";
    MDIIcons["volume_mute"] = "\uFC5D";
    MDIIcons["volume_off"] = "\uFA80";
    MDIIcons["volume_plus"] = "\uFC5B";
    MDIIcons["vpn"] = "\uFA81";
    MDIIcons["vuejs"] = "\uFD42";
    MDIIcons["walk"] = "\uFA82";
    MDIIcons["wall"] = "\uFCFC";
    MDIIcons["wallet"] = "\uFA83";
    MDIIcons["wallet_giftcard"] = "\uFA84";
    MDIIcons["wallet_membership"] = "\uFA85";
    MDIIcons["wallet_travel"] = "\uFA86";
    MDIIcons["wan"] = "\uFA87";
    MDIIcons["washing_machine"] = "\uFC28";
    MDIIcons["watch"] = "\uFA88";
    MDIIcons["watch_export"] = "\uFA89";
    MDIIcons["watch_import"] = "\uFA8A";
    MDIIcons["watch_vibrate"] = "\uFBAF";
    MDIIcons["water"] = "\uFA8B";
    MDIIcons["water_off"] = "\uFA8C";
    MDIIcons["water_percent"] = "\uFA8D";
    MDIIcons["water_pump"] = "\uFA8E";
    MDIIcons["watermark"] = "\uFB11";
    MDIIcons["waves"] = "\uFC8B";
    MDIIcons["weather_cloudy"] = "\uFA8F";
    MDIIcons["weather_fog"] = "\uFA90";
    MDIIcons["weather_hail"] = "\uFA91";
    MDIIcons["weather_lightning"] = "\uFA92";
    MDIIcons["weather_lightning_rainy"] = "\uFB7C";
    MDIIcons["weather_night"] = "\uFA93";
    MDIIcons["weather_partlycloudy"] = "\uFA94";
    MDIIcons["weather_pouring"] = "\uFA95";
    MDIIcons["weather_rainy"] = "\uFA96";
    MDIIcons["weather_snowy"] = "\uFA97";
    MDIIcons["weather_snowy_rainy"] = "\uFB7D";
    MDIIcons["weather_sunny"] = "\uFA98";
    MDIIcons["weather_sunset"] = "\uFA99";
    MDIIcons["weather_sunset_down"] = "\uFA9A";
    MDIIcons["weather_sunset_up"] = "\uFA9B";
    MDIIcons["weather_windy"] = "\uFA9C";
    MDIIcons["weather_windy_variant"] = "\uFA9D";
    MDIIcons["web"] = "\uFA9E";
    MDIIcons["webcam"] = "\uFA9F";
    MDIIcons["webhook"] = "\uFB2E";
    MDIIcons["webpack"] = "\uFC29";
    MDIIcons["wechat"] = "\uFB10";
    MDIIcons["weight"] = "\uFAA0";
    MDIIcons["weight_kilogram"] = "\uFAA1";
    MDIIcons["whatsapp"] = "\uFAA2";
    MDIIcons["wheelchair_accessibility"] = "\uFAA3";
    MDIIcons["white_balance_auto"] = "\uFAA4";
    MDIIcons["white_balance_incandescent"] = "\uFAA5";
    MDIIcons["white_balance_iridescent"] = "\uFAA6";
    MDIIcons["white_balance_sunny"] = "\uFAA7";
    MDIIcons["widgets"] = "\uFC2A";
    MDIIcons["wifi"] = "\uFAA8";
    MDIIcons["wifi_off"] = "\uFAA9";
    MDIIcons["wii"] = "\uFAAA";
    MDIIcons["wiiu"] = "\uFC2B";
    MDIIcons["wikipedia"] = "\uFAAB";
    MDIIcons["window_close"] = "\uFAAC";
    MDIIcons["window_closed"] = "\uFAAD";
    MDIIcons["window_maximize"] = "\uFAAE";
    MDIIcons["window_minimize"] = "\uFAAF";
    MDIIcons["window_open"] = "\uFAB0";
    MDIIcons["window_restore"] = "\uFAB1";
    MDIIcons["windows"] = "\uFAB2";
    MDIIcons["wordpress"] = "\uFAB3";
    MDIIcons["worker"] = "\uFAB4";
    MDIIcons["wrap"] = "\uFAB5";
    MDIIcons["wrench"] = "\uFAB6";
    MDIIcons["wunderlist"] = "\uFAB7";
    MDIIcons["xamarin"] = "\uFD43";
    MDIIcons["xamarin_outline"] = "\uFD44";
    MDIIcons["xaml"] = "\uFB72";
    MDIIcons["xbox"] = "\uFAB8";
    MDIIcons["xbox_controller"] = "\uFAB9";
    MDIIcons["xbox_controller_battery_alert"] = "\uFC49";
    MDIIcons["xbox_controller_battery_empty"] = "\uFC4A";
    MDIIcons["xbox_controller_battery_full"] = "\uFC4B";
    MDIIcons["xbox_controller_battery_low"] = "\uFC4C";
    MDIIcons["xbox_controller_battery_medium"] = "\uFC4D";
    MDIIcons["xbox_controller_battery_unknown"] = "\uFC4E";
    MDIIcons["xbox_controller_off"] = "\uFABA";
    MDIIcons["xda"] = "\uFABB";
    MDIIcons["xing"] = "\uFABC";
    MDIIcons["xing_box"] = "\uFABD";
    MDIIcons["xing_circle"] = "\uFABE";
    MDIIcons["xml"] = "\uFABF";
    MDIIcons["xmpp"] = "\uFCFD";
    MDIIcons["yammer"] = "\uFC87";
    MDIIcons["yeast"] = "\uFAC0";
    MDIIcons["yelp"] = "\uFAC1";
    MDIIcons["yin_yang"] = "\uFB7E";
    MDIIcons["youtube_creator_studio"] = "\uFD45";
    MDIIcons["youtube_gaming"] = "\uFD46";
    MDIIcons["youtube_play"] = "\uFAC2";
    MDIIcons["youtube_tv"] = "\uF947";
    MDIIcons["zip_box"] = "\uFAC3";
})(MDIIcons = exports.MDIIcons || (exports.MDIIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/misc-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MiscIcons = void 0;
var MiscIcons;
(function (MiscIcons) {
    MiscIcons["power"] = "\u23FB";
    MiscIcons["power_off"] = "\u2B58";
    MiscIcons["power_on"] = "\u23FD";
    MiscIcons["sleep_mode"] = "\u23FE";
    MiscIcons["toggle_power"] = "\u23FC";
    MiscIcons["indent-dotted_guide"] = "\uE621";
    MiscIcons["indent-line"] = "\uE621";
    MiscIcons["indentation-line"] = "\uE621";
})(MiscIcons = exports.MiscIcons || (exports.MiscIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/oct-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OctIcons = void 0;
var OctIcons;
(function (OctIcons) {
    OctIcons["alert"] = "\uF421";
    OctIcons["arrow_down"] = "\uF433";
    OctIcons["arrow_left"] = "\uF434";
    OctIcons["arrow_right"] = "\uF432";
    OctIcons["arrow_small_down"] = "\uF479";
    OctIcons["arrow_small_left"] = "\uF47A";
    OctIcons["arrow_small_right"] = "\uF45C";
    OctIcons["arrow_small_up"] = "\uF478";
    OctIcons["arrow_up"] = "\uF431";
    OctIcons["beaker"] = "\uF499";
    OctIcons["bell"] = "\uF49A";
    OctIcons["bold"] = "\uF49D";
    OctIcons["book"] = "\uF405";
    OctIcons["bookmark"] = "\uF461";
    OctIcons["briefcase"] = "\uF491";
    OctIcons["broadcast"] = "\uF43C";
    OctIcons["browser"] = "\uF488";
    OctIcons["bug"] = "\uF46F";
    OctIcons["calendar"] = "\uF455";
    OctIcons["check"] = "\uF42E";
    OctIcons["checklist"] = "\uF45E";
    OctIcons["chevron_down"] = "\uF47C";
    OctIcons["chevron_left"] = "\uF47D";
    OctIcons["chevron_right"] = "\uF460";
    OctIcons["chevron_up"] = "\uF47B";
    OctIcons["circle_slash"] = "\uF468";
    OctIcons["circuit_board"] = "\uF493";
    OctIcons["clippy"] = "\uF429";
    OctIcons["clock"] = "\uF43A";
    OctIcons["cloud_download"] = "\uF409";
    OctIcons["cloud_upload"] = "\uF40A";
    OctIcons["code"] = "\uF44F";
    OctIcons["comment"] = "\uF41F";
    OctIcons["comment_discussion"] = "\uF442";
    OctIcons["credit_card"] = "\uF439";
    OctIcons["dash"] = "\uF48B";
    OctIcons["dashboard"] = "\uF463";
    OctIcons["database"] = "\uF472";
    OctIcons["desktop_download"] = "\uF498";
    OctIcons["device_camera"] = "\uF446";
    OctIcons["device_camera_video"] = "\uF447";
    OctIcons["device_desktop"] = "\uF67C";
    OctIcons["device_mobile"] = "\uF42C";
    OctIcons["diff"] = "\uF440";
    OctIcons["diff_added"] = "\uF457";
    OctIcons["diff_ignored"] = "\uF474";
    OctIcons["diff_modified"] = "\uF459";
    OctIcons["diff_removed"] = "\uF458";
    OctIcons["diff_renamed"] = "\uF45A";
    OctIcons["ellipses"] = "\uF4A4";
    OctIcons["ellipsis"] = "\uF475";
    OctIcons["eye"] = "\uF441";
    OctIcons["file"] = "\uF4A5";
    OctIcons["file_binary"] = "\uF471";
    OctIcons["file_code"] = "\uF40D";
    OctIcons["file_directory"] = "\uF413";
    OctIcons["file_media"] = "\uF40F";
    OctIcons["file_pdf"] = "\uF411";
    OctIcons["file_submodule"] = "\uF414";
    OctIcons["file_symlink_directory"] = "\uF482";
    OctIcons["file_symlink_file"] = "\uF481";
    OctIcons["file_text"] = "\uF40E";
    OctIcons["file_zip"] = "\uF410";
    OctIcons["flame"] = "\uF490";
    OctIcons["fold"] = "\uF48C";
    OctIcons["gear"] = "\uF423";
    OctIcons["gift"] = "\uF436";
    OctIcons["gist"] = "\uF40C";
    OctIcons["gist_secret"] = "\uF46C";
    OctIcons["git_branch"] = "\uF418";
    OctIcons["git_commit"] = "\uF417";
    OctIcons["git_compare"] = "\uF47F";
    OctIcons["git_merge"] = "\uF419";
    OctIcons["git_pull_request"] = "\uF407";
    OctIcons["globe"] = "\uF484";
    OctIcons["grabber"] = "\uF4A6";
    OctIcons["graph"] = "\uF437";
    OctIcons["heart"] = "\u2665";
    OctIcons["history"] = "\uF464";
    OctIcons["home"] = "\uF46D";
    OctIcons["horizontal_rule"] = "\uF45B";
    OctIcons["hubot"] = "\uF477";
    OctIcons["inbox"] = "\uF48D";
    OctIcons["info"] = "\uF449";
    OctIcons["issue_closed"] = "\uF41D";
    OctIcons["issue_opened"] = "\uF41B";
    OctIcons["issue_reopened"] = "\uF41C";
    OctIcons["italic"] = "\uF49F";
    OctIcons["jersey"] = "\uF416";
    OctIcons["key"] = "\uF43D";
    OctIcons["keyboard"] = "\uF40B";
    OctIcons["law"] = "\uF495";
    OctIcons["light_bulb"] = "\uF400";
    OctIcons["link"] = "\uF44C";
    OctIcons["link_external"] = "\uF465";
    OctIcons["list_ordered"] = "\uF452";
    OctIcons["list_unordered"] = "\uF451";
    OctIcons["location"] = "\uF450";
    OctIcons["lock"] = "\uF456";
    OctIcons["logo_gist"] = "\uF480";
    OctIcons["logo_github"] = "\uF470";
    OctIcons["mail"] = "\uF42F";
    OctIcons["mail_read"] = "\uF430";
    OctIcons["mail_reply"] = "\uF443";
    OctIcons["mark_github"] = "\uF408";
    OctIcons["markdown"] = "\uF48A";
    OctIcons["megaphone"] = "\uF45F";
    OctIcons["mention"] = "\uF486";
    OctIcons["milestone"] = "\uF45D";
    OctIcons["mirror"] = "\uF41A";
    OctIcons["mortar_board"] = "\uF494";
    OctIcons["mute"] = "\uF466";
    OctIcons["no_newline"] = "\uF476";
    OctIcons["octoface"] = "\uF406";
    OctIcons["organization"] = "\uF42B";
    OctIcons["package"] = "\uF487";
    OctIcons["paintcan"] = "\uF48F";
    OctIcons["pencil"] = "\uF448";
    OctIcons["person"] = "\uF415";
    OctIcons["pin"] = "\uF435";
    OctIcons["plug"] = "\uF492";
    OctIcons["plus"] = "\uF44D";
    OctIcons["plus_small"] = "\uF4A7";
    OctIcons["primitive_dot"] = "\uF444";
    OctIcons["primitive_square"] = "\uF445";
    OctIcons["pulse"] = "\uF469";
    OctIcons["question"] = "\uF420";
    OctIcons["quote"] = "\uF453";
    OctIcons["radio_tower"] = "\uF424";
    OctIcons["reply"] = "\uF4A8";
    OctIcons["repo"] = "\uF401";
    OctIcons["repo_clone"] = "\uF43F";
    OctIcons["repo_force_push"] = "\uF43E";
    OctIcons["repo_forked"] = "\uF402";
    OctIcons["repo_pull"] = "\uF404";
    OctIcons["repo_push"] = "\uF403";
    OctIcons["rocket"] = "\uF427";
    OctIcons["rss"] = "\uF428";
    OctIcons["ruby"] = "\uF43B";
    OctIcons["search"] = "\uF422";
    OctIcons["server"] = "\uF473";
    OctIcons["settings"] = "\uF462";
    OctIcons["shield"] = "\uF49C";
    OctIcons["sign_in"] = "\uF42A";
    OctIcons["sign_out"] = "\uF426";
    OctIcons["smiley"] = "\uF4A2";
    OctIcons["squirrel"] = "\uF483";
    OctIcons["star"] = "\uF41E";
    OctIcons["stop"] = "\uF46E";
    OctIcons["sync"] = "\uF46A";
    OctIcons["tag"] = "\uF412";
    OctIcons["tasklist"] = "\uF4A0";
    OctIcons["telescope"] = "\uF46B";
    OctIcons["terminal"] = "\uF489";
    OctIcons["text_size"] = "\uF49E";
    OctIcons["three_bars"] = "\uF44E";
    OctIcons["thumbsdown"] = "\uF497";
    OctIcons["thumbsup"] = "\uF496";
    OctIcons["tools"] = "\uF425";
    OctIcons["trashcan"] = "\uF48E";
    OctIcons["triangle_down"] = "\uF44B";
    OctIcons["triangle_left"] = "\uF438";
    OctIcons["triangle_right"] = "\uF44A";
    OctIcons["triangle_up"] = "\uF47E";
    OctIcons["unfold"] = "\uF42D";
    OctIcons["unmute"] = "\uF485";
    OctIcons["unverified"] = "\uF4A3";
    OctIcons["verified"] = "\uF4A1";
    OctIcons["versions"] = "\uF454";
    OctIcons["watch"] = "\uF49B";
    OctIcons["x"] = "\uF467";
    OctIcons["zap"] = "\u26A1";
})(OctIcons = exports.OctIcons || (exports.OctIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/pl-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlIcons = void 0;
var PlIcons;
(function (PlIcons) {
    PlIcons["branch"] = "\uE0A0";
    PlIcons["current_line"] = "\uE0A1";
    PlIcons["hostname"] = "\uE0A2";
    PlIcons["left_hard_divider"] = "\uE0B0";
    PlIcons["left_soft_divider"] = "\uE0B1";
    PlIcons["line_number"] = "\uE0A1";
    PlIcons["readonly"] = "\uE0A2";
    PlIcons["right_hard_divider"] = "\uE0B2";
    PlIcons["right_soft_divider"] = "\uE0B3";
    PlIcons["backslash_separator"] = "\uE0B9";
    PlIcons["backslash_separator_redundant"] = "\uE0BF";
    PlIcons["column_number"] = "\uE0A3";
    PlIcons["current_column"] = "\uE0A3";
    PlIcons["flame_thick"] = "\uE0C0";
    PlIcons["flame_thick_mirrored"] = "\uE0C2";
    PlIcons["flame_thin"] = "\uE0C1";
    PlIcons["flame_thin_mirrored"] = "\uE0C3";
    PlIcons["forwardslash_separator"] = "\uE0BB";
    PlIcons["forwardslash_separator_redundant"] = "\uE0BD";
    PlIcons["honeycomb"] = "\uE0CC";
    PlIcons["honeycomb_outline"] = "\uE0CD";
    PlIcons["ice_waveform"] = "\uE0C8";
    PlIcons["ice_waveform_mirrored"] = "\uE0CA";
    PlIcons["left_half_circle_thick"] = "\uE0B6";
    PlIcons["left_half_circle_thin"] = "\uE0B7";
    PlIcons["lego_block_facing"] = "\uE0D0";
    PlIcons["lego_block_sideways"] = "\uE0D1";
    PlIcons["lego_separator"] = "\uE0CE";
    PlIcons["lego_separator_thin"] = "\uE0CF";
    PlIcons["lower_left_triangle"] = "\uE0B8";
    PlIcons["lower_right_triangle"] = "\uE0BA";
    PlIcons["pixelated_squares_big"] = "\uE0C6";
    PlIcons["pixelated_squares_big_mirrored"] = "\uE0C7";
    PlIcons["pixelated_squares_small"] = "\uE0C4";
    PlIcons["pixelated_squares_small_mirrored"] = "\uE0C5";
    PlIcons["right_half_circle_thick"] = "\uE0B4";
    PlIcons["right_half_circle_thin"] = "\uE0B5";
    PlIcons["trapezoid_top_bottom"] = "\uE0D2";
    PlIcons["trapezoid_top_bottom_mirrored"] = "\uE0D4";
    PlIcons["upper_left_triangle"] = "\uE0BC";
    PlIcons["upper_right_triangle"] = "\uE0BE";
})(PlIcons = exports.PlIcons || (exports.PlIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/pom-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PomIcons = void 0;
var PomIcons;
(function (PomIcons) {
    PomIcons["away"] = "\uE007";
    PomIcons["clean_code"] = "\uE000";
    PomIcons["external_interruption"] = "\uE00A";
    PomIcons["internal_interruption"] = "\uE009";
    PomIcons["long_pause"] = "\uE006";
    PomIcons["pair_programming"] = "\uE008";
    PomIcons["pomodoro_done"] = "\uE001";
    PomIcons["pomodoro_estimated"] = "\uE002";
    PomIcons["pomodoro_squashed"] = "\uE004";
    PomIcons["pomodoro_ticking"] = "\uE003";
    PomIcons["short_pause"] = "\uE005";
})(PomIcons = exports.PomIcons || (exports.PomIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/set-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SetiIcons = void 0;
var SetiIcons;
(function (SetiIcons) {
    SetiIcons["bower"] = "\uE61A";
    SetiIcons["cjsx"] = "\uE61B";
    SetiIcons["coffee"] = "\uE61B";
    SetiIcons["config"] = "\uE615";
    SetiIcons["css"] = "\uE614";
    SetiIcons["default"] = "\uE612";
    SetiIcons["ejs"] = "\uE618";
    SetiIcons["favicon"] = "\uE623";
    SetiIcons["folder"] = "\uE613";
    SetiIcons["go"] = "\uE627";
    SetiIcons["grunt"] = "\uE611";
    SetiIcons["gulp"] = "\uE610";
    SetiIcons["haskell"] = "\uE61F";
    SetiIcons["heroku"] = "\uE607";
    SetiIcons["home"] = "\uE617";
    SetiIcons["html"] = "\uE60E";
    SetiIcons["image"] = "\uE60D";
    SetiIcons["javascript"] = "\uE60C";
    SetiIcons["json"] = "\uE60B";
    SetiIcons["julia"] = "\uE624";
    SetiIcons["karma"] = "\uE622";
    SetiIcons["less"] = "\uE60B";
    SetiIcons["license"] = "\uE60A";
    SetiIcons["lua"] = "\uE620";
    SetiIcons["markdown"] = "\uE609";
    SetiIcons["mustache"] = "\uE60F";
    SetiIcons["npm"] = "\uE616";
    SetiIcons["php"] = "\uE608";
    SetiIcons["play_arrow"] = "\uE602";
    SetiIcons["project"] = "\uE601";
    SetiIcons["python"] = "\uE606";
    SetiIcons["rails"] = "\uE604";
    SetiIcons["react"] = "\uE625";
    SetiIcons["ruby"] = "\uE605";
    SetiIcons["sass"] = "\uE603";
    SetiIcons["stylus"] = "\uE600";
    SetiIcons["text"] = "\uE612";
    SetiIcons["twig"] = "\uE61C";
    SetiIcons["typescript"] = "\uE628";
    SetiIcons["xml"] = "\uE619";
})(SetiIcons = exports.SetiIcons || (exports.SetiIcons = {}));


/***/ }),

/***/ "./libs/tty/src/icons/weather-icons.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WeatherIcons = void 0;
var WeatherIcons;
(function (WeatherIcons) {
    WeatherIcons["alien"] = "\uE36E";
    WeatherIcons["aliens"] = "\uE345";
    WeatherIcons["barometer"] = "\uE372";
    WeatherIcons["celsius"] = "\uE339";
    WeatherIcons["cloud"] = "\uE33D";
    WeatherIcons["cloud_down"] = "\uE33A";
    WeatherIcons["cloud_refresh"] = "\uE33B";
    WeatherIcons["cloud_up"] = "\uE33C";
    WeatherIcons["cloudy"] = "\uE312";
    WeatherIcons["cloudy_gusts"] = "\uE310";
    WeatherIcons["cloudy_windy"] = "\uE311";
    WeatherIcons["day_cloudy"] = "\uE302";
    WeatherIcons["day_cloudy_gusts"] = "\uE300";
    WeatherIcons["day_cloudy_high"] = "\uE376";
    WeatherIcons["day_cloudy_windy"] = "\uE301";
    WeatherIcons["day_fog"] = "\uE303";
    WeatherIcons["day_hail"] = "\uE304";
    WeatherIcons["day_haze"] = "\uE3AE";
    WeatherIcons["day_light_wind"] = "\uE3BC";
    WeatherIcons["day_lightning"] = "\uE305";
    WeatherIcons["day_rain"] = "\uE308";
    WeatherIcons["day_rain_mix"] = "\uE306";
    WeatherIcons["day_rain_wind"] = "\uE307";
    WeatherIcons["day_showers"] = "\uE309";
    WeatherIcons["day_sleet"] = "\uE3AA";
    WeatherIcons["day_sleet_storm"] = "\uE362";
    WeatherIcons["day_snow"] = "\uE30A";
    WeatherIcons["day_snow_thunderstorm"] = "\uE365";
    WeatherIcons["day_snow_wind"] = "\uE35F";
    WeatherIcons["day_sprinkle"] = "\uE30B";
    WeatherIcons["day_storm_showers"] = "\uE30E";
    WeatherIcons["day_sunny"] = "\uE30D";
    WeatherIcons["day_sunny_overcast"] = "\uE30C";
    WeatherIcons["day_thunderstorm"] = "\uE30F";
    WeatherIcons["day_windy"] = "\uE37D";
    WeatherIcons["degrees"] = "\uE33E";
    WeatherIcons["direction_down"] = "\uE340";
    WeatherIcons["direction_down_left"] = "\uE33F";
    WeatherIcons["direction_down_right"] = "\uE380";
    WeatherIcons["direction_left"] = "\uE344";
    WeatherIcons["direction_right"] = "\uE349";
    WeatherIcons["direction_up"] = "\uE353";
    WeatherIcons["direction_up_left"] = "\uE37F";
    WeatherIcons["direction_up_right"] = "\uE352";
    WeatherIcons["dust"] = "\uE35D";
    WeatherIcons["earthquake"] = "\uE3BE";
    WeatherIcons["fahrenheit"] = "\uE341";
    WeatherIcons["fire"] = "\uE3BF";
    WeatherIcons["flood"] = "\uE375";
    WeatherIcons["fog"] = "\uE313";
    WeatherIcons["gale_warning"] = "\uE3C5";
    WeatherIcons["hail"] = "\uE314";
    WeatherIcons["horizon"] = "\uE343";
    WeatherIcons["horizon_alt"] = "\uE342";
    WeatherIcons["hot"] = "\uE36B";
    WeatherIcons["humidity"] = "\uE373";
    WeatherIcons["hurricane"] = "\uE36C";
    WeatherIcons["hurricane_warning"] = "\uE3C7";
    WeatherIcons["lightning"] = "\uE315";
    WeatherIcons["lunar_eclipse"] = "\uE369";
    WeatherIcons["meteor"] = "\uE36A";
    WeatherIcons["moon_alt_first_quarter"] = "\uE3CE";
    WeatherIcons["moon_alt_full"] = "\uE3D5";
    WeatherIcons["moon_alt_new"] = "\uE3E3";
    WeatherIcons["moon_alt_third_quarter"] = "\uE3DC";
    WeatherIcons["moon_alt_waning_crescent_1"] = "\uE3DD";
    WeatherIcons["moon_alt_waning_crescent_2"] = "\uE3DE";
    WeatherIcons["moon_alt_waning_crescent_3"] = "\uE3DF";
    WeatherIcons["moon_alt_waning_crescent_4"] = "\uE3E0";
    WeatherIcons["moon_alt_waning_crescent_5"] = "\uE3E1";
    WeatherIcons["moon_alt_waning_crescent_6"] = "\uE3E2";
    WeatherIcons["moon_alt_waning_gibbous_1"] = "\uE3D6";
    WeatherIcons["moon_alt_waning_gibbous_2"] = "\uE3D7";
    WeatherIcons["moon_alt_waning_gibbous_3"] = "\uE3D8";
    WeatherIcons["moon_alt_waning_gibbous_4"] = "\uE3D9";
    WeatherIcons["moon_alt_waning_gibbous_5"] = "\uE3DA";
    WeatherIcons["moon_alt_waning_gibbous_6"] = "\uE3DB";
    WeatherIcons["moon_alt_waxing_crescent_1"] = "\uE3C8";
    WeatherIcons["moon_alt_waxing_crescent_2"] = "\uE3C9";
    WeatherIcons["moon_alt_waxing_crescent_3"] = "\uE3CA";
    WeatherIcons["moon_alt_waxing_crescent_4"] = "\uE3CB";
    WeatherIcons["moon_alt_waxing_crescent_5"] = "\uE3CC";
    WeatherIcons["moon_alt_waxing_crescent_6"] = "\uE3CD";
    WeatherIcons["moon_alt_waxing_gibbous_1"] = "\uE3CF";
    WeatherIcons["moon_alt_waxing_gibbous_2"] = "\uE3D0";
    WeatherIcons["moon_alt_waxing_gibbous_3"] = "\uE3D1";
    WeatherIcons["moon_alt_waxing_gibbous_4"] = "\uE3D2";
    WeatherIcons["moon_alt_waxing_gibbous_5"] = "\uE3D3";
    WeatherIcons["moon_alt_waxing_gibbous_6"] = "\uE3D4";
    WeatherIcons["moon_first_quarter"] = "\uE394";
    WeatherIcons["moon_full"] = "\uE39B";
    WeatherIcons["moon_new"] = "\uE38D";
    WeatherIcons["moon_third_quarter"] = "\uE3A2";
    WeatherIcons["moon_waning_crescent_1"] = "\uE3A3";
    WeatherIcons["moon_waning_crescent_2"] = "\uE3A4";
    WeatherIcons["moon_waning_crescent_3"] = "\uE3A5";
    WeatherIcons["moon_waning_crescent_4"] = "\uE3A6";
    WeatherIcons["moon_waning_crescent_5"] = "\uE3A7";
    WeatherIcons["moon_waning_crescent_6"] = "\uE3A8";
    WeatherIcons["moon_waning_gibbous_1"] = "\uE39C";
    WeatherIcons["moon_waning_gibbous_2"] = "\uE39D";
    WeatherIcons["moon_waning_gibbous_3"] = "\uE39E";
    WeatherIcons["moon_waning_gibbous_4"] = "\uE39F";
    WeatherIcons["moon_waning_gibbous_5"] = "\uE3A0";
    WeatherIcons["moon_waning_gibbous_6"] = "\uE3A1";
    WeatherIcons["moon_waxing_crescent_1"] = "\uE38E";
    WeatherIcons["moon_waxing_crescent_2"] = "\uE38F";
    WeatherIcons["moon_waxing_crescent_3"] = "\uE390";
    WeatherIcons["moon_waxing_crescent_4"] = "\uE391";
    WeatherIcons["moon_waxing_crescent_5"] = "\uE392";
    WeatherIcons["moon_waxing_crescent_6"] = "\uE393";
    WeatherIcons["moon_waxing_gibbous_1"] = "\uE395";
    WeatherIcons["moon_waxing_gibbous_2"] = "\uE396";
    WeatherIcons["moon_waxing_gibbous_3"] = "\uE397";
    WeatherIcons["moon_waxing_gibbous_4"] = "\uE398";
    WeatherIcons["moon_waxing_gibbous_5"] = "\uE399";
    WeatherIcons["moon_waxing_gibbous_6"] = "\uE39A";
    WeatherIcons["moonrise"] = "\uE3C1";
    WeatherIcons["moonset"] = "\uE3C2";
    WeatherIcons["na"] = "\uE374";
    WeatherIcons["night_alt_cloudy"] = "\uE37E";
    WeatherIcons["night_alt_cloudy_gusts"] = "\uE31F";
    WeatherIcons["night_alt_cloudy_high"] = "\uE377";
    WeatherIcons["night_alt_cloudy_windy"] = "\uE320";
    WeatherIcons["night_alt_hail"] = "\uE321";
    WeatherIcons["night_alt_lightning"] = "\uE322";
    WeatherIcons["night_alt_partly_cloudy"] = "\uE379";
    WeatherIcons["night_alt_rain"] = "\uE325";
    WeatherIcons["night_alt_rain_mix"] = "\uE326";
    WeatherIcons["night_alt_rain_wind"] = "\uE324";
    WeatherIcons["night_alt_sleet"] = "\uE3AC";
    WeatherIcons["night_alt_sleet_storm"] = "\uE364";
    WeatherIcons["night_alt_snow"] = "\uE327";
    WeatherIcons["night_alt_snow_thunderstorm"] = "\uE367";
    WeatherIcons["night_alt_snow_wind"] = "\uE361";
    WeatherIcons["night_alt_sprinkle"] = "\uE328";
    WeatherIcons["night_alt_storm_showers"] = "\uE329";
    WeatherIcons["night_alt_thunderstorm"] = "\uE32A";
    WeatherIcons["night_clear"] = "\uE32B";
    WeatherIcons["night_cloudy"] = "\uE32E";
    WeatherIcons["night_cloudy_gusts"] = "\uE32C";
    WeatherIcons["night_cloudy_high"] = "\uE378";
    WeatherIcons["night_cloudy_windy"] = "\uE32D";
    WeatherIcons["night_fog"] = "\uE346";
    WeatherIcons["night_hail"] = "\uE32F";
    WeatherIcons["night_lightning"] = "\uE330";
    WeatherIcons["night_partly_cloudy"] = "\uE37B";
    WeatherIcons["night_rain"] = "\uE333";
    WeatherIcons["night_rain_mix"] = "\uE331";
    WeatherIcons["night_rain_wind"] = "\uE332";
    WeatherIcons["night_showers"] = "\uE334";
    WeatherIcons["night_sleet"] = "\uE3AB";
    WeatherIcons["night_sleet_storm"] = "\uE363";
    WeatherIcons["night_snow"] = "\uE335";
    WeatherIcons["night_snow_thunderstorm"] = "\uE366";
    WeatherIcons["night_snow_wind"] = "\uE360";
    WeatherIcons["night_sprinkle"] = "\uE336";
    WeatherIcons["night_storm_showers"] = "\uE337";
    WeatherIcons["night_thunderstorm"] = "\uE338";
    WeatherIcons["rain"] = "\uE318";
    WeatherIcons["rain_mix"] = "\uE316";
    WeatherIcons["rain_wind"] = "\uE317";
    WeatherIcons["raindrop"] = "\uE371";
    WeatherIcons["raindrops"] = "\uE34A";
    WeatherIcons["refresh"] = "\uE348";
    WeatherIcons["refresh_alt"] = "\uE347";
    WeatherIcons["sandstorm"] = "\uE37A";
    WeatherIcons["showers"] = "\uE319";
    WeatherIcons["sleet"] = "\uE3AD";
    WeatherIcons["small_craft_advisory"] = "\uE3C4";
    WeatherIcons["smog"] = "\uE36D";
    WeatherIcons["smoke"] = "\uE35C";
    WeatherIcons["snow"] = "\uE31A";
    WeatherIcons["snow_wind"] = "\uE35E";
    WeatherIcons["snowflake_cold"] = "\uE36F";
    WeatherIcons["solar_eclipse"] = "\uE368";
    WeatherIcons["sprinkle"] = "\uE31B";
    WeatherIcons["stars"] = "\uE370";
    WeatherIcons["storm_showers"] = "\uE31C";
    WeatherIcons["storm_warning"] = "\uE3C6";
    WeatherIcons["strong_wind"] = "\uE34B";
    WeatherIcons["sunrise"] = "\uE34C";
    WeatherIcons["sunset"] = "\uE34D";
    WeatherIcons["thermometer"] = "\uE350";
    WeatherIcons["thermometer_exterior"] = "\uE34E";
    WeatherIcons["thermometer_internal"] = "\uE34F";
    WeatherIcons["thunderstorm"] = "\uE31D";
    WeatherIcons["time_1"] = "\uE382";
    WeatherIcons["time_10"] = "\uE38B";
    WeatherIcons["time_11"] = "\uE38C";
    WeatherIcons["time_12"] = "\uE381";
    WeatherIcons["time_2"] = "\uE383";
    WeatherIcons["time_3"] = "\uE384";
    WeatherIcons["time_4"] = "\uE385";
    WeatherIcons["time_5"] = "\uE386";
    WeatherIcons["time_6"] = "\uE387";
    WeatherIcons["time_7"] = "\uE388";
    WeatherIcons["time_8"] = "\uE389";
    WeatherIcons["time_9"] = "\uE38A";
    WeatherIcons["tornado"] = "\uE351";
    WeatherIcons["train"] = "\uE3C3";
    WeatherIcons["tsunami"] = "\uE3BD";
    WeatherIcons["umbrella"] = "\uE37C";
    WeatherIcons["volcano"] = "\uE3C0";
    WeatherIcons["wind_beaufort_0"] = "\uE3AF";
    WeatherIcons["wind_beaufort_1"] = "\uE3B0";
    WeatherIcons["wind_beaufort_10"] = "\uE3B9";
    WeatherIcons["wind_beaufort_11"] = "\uE3BA";
    WeatherIcons["wind_beaufort_12"] = "\uE3BB";
    WeatherIcons["wind_beaufort_2"] = "\uE3B1";
    WeatherIcons["wind_beaufort_3"] = "\uE3B2";
    WeatherIcons["wind_beaufort_4"] = "\uE3B3";
    WeatherIcons["wind_beaufort_5"] = "\uE3B4";
    WeatherIcons["wind_beaufort_6"] = "\uE3B5";
    WeatherIcons["wind_beaufort_7"] = "\uE3B6";
    WeatherIcons["wind_beaufort_8"] = "\uE3B7";
    WeatherIcons["wind_beaufort_9"] = "\uE3B8";
    WeatherIcons["wind_direction"] = "\uE3A9";
    WeatherIcons["wind_east"] = "\uE35B";
    WeatherIcons["wind_north"] = "\uE35A";
    WeatherIcons["wind_north_east"] = "\uE359";
    WeatherIcons["wind_north_west"] = "\uE358";
    WeatherIcons["wind_south"] = "\uE357";
    WeatherIcons["wind_south_east"] = "\uE356";
    WeatherIcons["wind_south_west"] = "\uE355";
    WeatherIcons["wind_west"] = "\uE354";
    WeatherIcons["windy"] = "\uE31E";
})(WeatherIcons = exports.WeatherIcons || (exports.WeatherIcons = {}));


/***/ }),

/***/ "./libs/tty/src/includes/ansi.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ansiEscapes = exports.ansiMaxLength = exports.ansiSort = exports.ansiPadStart = exports.ansiPadEnd = exports.ansiStrip = exports.ansiRegex = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');
const ELLIPSES = '...';
/**
 * Regex from ansi-regex package
 */
function ansiRegex({ onlyFirst = false } = {}) {
    const pattern = [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
    ].join('|');
    return new RegExp(pattern, onlyFirst ? undefined : 'g');
}
exports.ansiRegex = ansiRegex;
function ansiStrip(text = '') {
    return text.replace(ansiRegex(), '');
}
exports.ansiStrip = ansiStrip;
function ansiPadEnd(text, amount, bgColor, char = ' ') {
    const stripped = ansiStrip(text);
    let length = stripped.length;
    if (length > amount) {
        const update = stripped.slice(utilities_1.START, amount - ELLIPSES.length) + ELLIPSES;
        text = text.replace(stripped, update);
        length = update.length;
    }
    let padding = char.repeat(amount - length);
    if (bgColor) {
        padding = chalk_1.default.hex(bgColor)(padding);
    }
    return text + padding;
}
exports.ansiPadEnd = ansiPadEnd;
function ansiPadStart(text, amount) {
    const stripped = ansiStrip(text);
    const padding = stripped.padStart(amount, ' ').slice(stripped.length);
    return text + padding;
}
exports.ansiPadStart = ansiPadStart;
function ansiSort(text) {
    return text.sort((a, b) => ansiStrip(a).replace(UNSORTABLE, '') > ansiStrip(b).replace(UNSORTABLE, '')
        ? utilities_1.UP
        : utilities_1.DOWN);
}
exports.ansiSort = ansiSort;
/**
 * Return back the ansi-stripped longest element / line
 */
function ansiMaxLength(...items) {
    return Math.max(...items.flatMap(list => (Array.isArray(list) ? list : (list ?? '').split(`\n`)).map(line => ansiStrip(String(line)).length)));
}
exports.ansiMaxLength = ansiMaxLength;
const ESC = '\u001B[';
const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';
const isTerminalApp = process.env.TERM_PROGRAM === 'Apple_Terminal';
const eraseScreen = ESC + '2J';
exports.ansiEscapes = {
    beep: BEL,
    clearScreen: '\u001Bc',
    clearTerminal: process.platform === 'win32'
        ? `${eraseScreen}${ESC}0f`
        : // 1. Erases the screen (Only done in case `2` is not supported)
            // 2. Erases the whole screen including scrollback buffer
            // 3. Moves cursor to the top-left position
            // More info: https://www.real-world-systems.com/docs/ANSIcode.html
            `${eraseScreen}${ESC}3J${ESC}H`,
    cursorBackward(count = utilities_1.SINGLE) {
        return ESC + count + 'D';
    },
    cursorDown(count = utilities_1.SINGLE) {
        return ESC + count + 'B';
    },
    cursorForward(count = utilities_1.SINGLE) {
        return ESC + count + 'C';
    },
    cursorGetPosition: ESC + '6n',
    cursorHide: ESC + '?25l',
    cursorLeft: ESC + 'G',
    cursorMove(x, y) {
        if (!utilities_1.is.number(x)) {
            throw new TypeError('The `x` argument is required');
        }
        let returnValue = '';
        if (x < utilities_1.START) {
            returnValue += ESC + -x + 'D';
        }
        else if (x > utilities_1.START) {
            returnValue += ESC + x + 'C';
        }
        if (y < utilities_1.START) {
            returnValue += ESC + -y + 'A';
        }
        else if (y > utilities_1.START) {
            returnValue += ESC + y + 'B';
        }
        return returnValue;
    },
    cursorNextLine: ESC + 'E',
    cursorPrevLine: ESC + 'F',
    cursorRestorePosition: isTerminalApp ? '\u001B8' : ESC + 'u',
    cursorSavePosition: isTerminalApp ? '\u001B7' : ESC + 's',
    cursorShow: ESC + '?25h',
    cursorTo(x, y) {
        if (!utilities_1.is.number(x)) {
            throw new TypeError('The `x` argument is required');
        }
        if (!utilities_1.is.number(y)) {
            return ESC + (x + utilities_1.INCREMENT) + 'G';
        }
        return ESC + (y + utilities_1.INCREMENT) + ';' + (x + utilities_1.INCREMENT) + 'H';
    },
    cursorUp(count = utilities_1.SINGLE) {
        return ESC + count + 'A';
    },
    eraseDown: ESC + 'J',
    eraseEndLine: ESC + 'K',
    eraseLine: ESC + '2K',
    eraseLines(count) {
        let clear = '';
        for (let i = 0; i < count; i++) {
            clear +=
                exports.ansiEscapes.eraseLine +
                    (i < count - utilities_1.ARRAY_OFFSET ? exports.ansiEscapes.cursorUp() : '');
        }
        if (count) {
            clear += exports.ansiEscapes.cursorLeft;
        }
        return clear;
    },
    eraseScreen,
    eraseStartLine: ESC + '1K',
    eraseUp: ESC + '1J',
    iTerm: {
        annotation(message, options = {}) {
            let returnValue = `${OSC}1337;`;
            const hasX = typeof options.x !== 'undefined';
            const hasY = typeof options.y !== 'undefined';
            if ((hasX || hasY) &&
                !(hasX && hasY && typeof options.length !== 'undefined')) {
                throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined');
            }
            message = message.replace(/\|/g, '');
            returnValue += options.isHidden
                ? 'AddHiddenAnnotation='
                : 'AddAnnotation=';
            returnValue +=
                options.length > utilities_1.EMPTY
                    ? (hasX
                        ? [message, options.length, options.x, options.y]
                        : [options.length, message]).join('|')
                    : message;
            return returnValue + BEL;
        },
        setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,
    },
    image(buffer, options = {}) {
        let returnValue = `${OSC}1337;File=inline=1`;
        if (options.width) {
            returnValue += `;width=${options.width}`;
        }
        if (options.height) {
            returnValue += `;height=${options.height}`;
        }
        if (options.preserveAspectRatio === false) {
            returnValue += ';preserveAspectRatio=0';
        }
        return returnValue + ':' + buffer.toString('base64') + BEL;
    },
    link(text, url) {
        return [OSC, '8', SEP, SEP, url, BEL, text, OSC, '8', SEP, SEP, BEL].join('');
    },
    scrollDown: ESC + 'T',
    scrollUp: ESC + 'S',
};


/***/ }),

/***/ "./libs/tty/src/includes/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/includes/ansi.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/includes/version-printer.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/includes/version-printer.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.VersionPrinter = void 0;
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const cli_cursor_1 = __webpack_require__("cli-cursor");
const js_yaml_1 = __webpack_require__("js-yaml");
const services_1 = __webpack_require__("./libs/tty/src/services/index.ts");
/**
 * Attach to preInit
 */
function VersionPrinter(app) {
    if (process.argv.includes(`--version`)) {
        const workspace = app.get(boilerplate_1.WorkspaceService);
        const prompt = app.get(services_1.ScreenService);
        const application = app.get(boilerplate_1.ACTIVE_APPLICATION);
        workspace.initMetadata();
        const { rootVersion, projects: versions } = workspace.version();
        prompt.print((0, js_yaml_1.dump)({
            ['Application Version']: versions[application.description],
            ['Root Version']: rootVersion,
        }));
        (0, cli_cursor_1.show)();
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit();
    }
}
exports.VersionPrinter = VersionPrinter;


/***/ }),

/***/ "./libs/tty/src/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/config.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/contracts/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/decorators/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/icons/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/includes/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/modules/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/index.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/modules/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/modules/main-cli.module.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/modules/main-cli.module.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainCLIModule = void 0;
const core_1 = __webpack_require__("@nestjs/core");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
const services_1 = __webpack_require__("./libs/tty/src/services/index.ts");
let MainCLIModule = class MainCLIModule {
};
MainCLIModule = __decorate([
    (0, boilerplate_1.LibraryModule)({
        configuration: {
            [config_1.BACKGROUND_MENU]: {
                default: '6B7F82',
                description: '',
                type: 'string',
            },
            [config_1.BORDER_COLOR_ACTIVE]: {
                default: '607D8B',
                description: '',
                type: 'string',
            },
            [config_1.BORDER_COLOR_ERROR]: {
                default: 'DD2C00',
                description: '',
                type: 'string',
            },
            [config_1.BORDER_COLOR_INACTIVE]: {
                default: '263238',
                description: '',
                type: 'string',
            },
            [config_1.BORDER_COLOR_WARN]: {
                default: 'FFAB00',
                description: '',
                type: 'string',
            },
            [config_1.DEFAULT_HEADER_FONT]: {
                default: 'DOS Rebel',
                description: 'Figlet font',
                type: 'string',
            },
            [config_1.HEADER_COLOR]: {
                default: 'bgBlue.black',
                description: 'Color for primary header text + dividing line. Color must make sense to chalk',
                type: 'string',
            },
            [config_1.PAGE_SIZE]: {
                default: 20,
                description: 'Maxmimum number of items displayed in pickMany prompts',
                type: 'number',
            },
            [config_1.PINNED_ITEMS]: {
                configurable: false,
                default: [],
                description: 'Stick some callbacks at the top of main cli. Managed from application',
                type: 'internal',
            },
            [config_1.SECONDARY_HEADER_FONT]: {
                default: 'Pagga',
                description: 'Figlet font',
                type: 'string',
            },
            [config_1.TEXT_DETAILS]: {
                default: 'A1E44D',
                description: '',
                type: 'string',
            },
            [config_1.TEXT_HELP]: {
                default: 'FF9100',
                description: '',
                type: 'string',
            },
            [config_1.TEXT_IMPORTANT]: {
                default: '1DE9B6',
                description: '',
                type: 'string',
            },
            [config_1.TEXT_INFO]: {
                default: '00B0FF',
                description: '',
                type: 'string',
            },
        },
        exports: [
            services_1.ApplicationManagerService,
            services_1.ChartingService,
            services_1.ColorsService,
            services_1.ComparisonToolsService,
            services_1.ConfigBuilderService,
            services_1.EnvironmentService,
            services_1.LayoutManagerService,
            services_1.GitService,
            services_1.KeymapService,
            services_1.PinnedItemService,
            services_1.PromptService,
            services_1.ScreenService,
            services_1.StackService,
            services_1.SystemService,
            services_1.TableService,
            services_1.TextRenderingService,
        ],
        imports: [core_1.DiscoveryModule, (0, boilerplate_1.RegisterCache)()],
        library: config_1.LIB_TTY,
        providers: [
            services_1.AcknowledgeComponentService,
            services_1.ApplicationManagerService,
            services_1.BooleanEditorService,
            services_1.ChartingService,
            services_1.ColorsService,
            services_1.ComparisonToolsService,
            services_1.ComponentExplorerService,
            services_1.ConfigBuilderService,
            services_1.ConfirmEditorService,
            services_1.DateEditorService,
            services_1.DiscriminatorEditorService,
            services_1.EditorExplorerService,
            services_1.EnumEditorService,
            services_1.EnvironmentService,
            services_1.FooterEditorService,
            services_1.GitService,
            services_1.KeyboardManagerService,
            services_1.KeymapService,
            services_1.LayoutManagerService,
            services_1.ListBuilderComponentService,
            services_1.MainCLIService,
            services_1.MenuComponentService,
            services_1.NumberEditorService,
            services_1.PinnedItemService,
            services_1.PromptService,
            services_1.ReplExplorerService,
            services_1.ScreenService,
            services_1.StackService,
            services_1.StringEditorService,
            services_1.SystemService,
            services_1.TableBuilderComponentService,
            services_1.TableService,
            services_1.TextRenderingService,
            services_1.ThemeService,
        ],
    })
], MainCLIModule);
exports.MainCLIModule = MainCLIModule;


/***/ }),

/***/ "./libs/tty/src/services/colors.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColorsService = void 0;
/* This file is full of ported code */
/* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/no-nested-ternary */
const common_1 = __webpack_require__("@nestjs/common");
const prompt_service_1 = __webpack_require__("./libs/tty/src/services/prompt.service.ts");
const clamp = (input, min, max) => {
    if (input < min) {
        return min;
    }
    return input > max ? max : input;
};
const OFF = 0;
const HEX_SIZE = 2;
const R_LUMINANCE = 0.2126;
const G_LUMINANCE = 0.7152;
const B_LUMINANCE = 0.722;
let ColorsService = class ColorsService {
    promptService;
    constructor(promptService) {
        this.promptService = promptService;
    }
    async buildHex(current) {
        return await this.promptService.string(`Hex Color`, current);
    }
    async buildRGB({ r, g, b } = { b: OFF, g: OFF, r: OFF }) {
        r = await this.promptService.number('Red', r);
        g = await this.promptService.number('Green', g);
        b = await this.promptService.number('Blue', b);
        return { b, g, r };
    }
    hexToRGB(hex = '000000') {
        const split = hex.match(new RegExp('.{1,2}', 'g'));
        return {
            b: Number.parseInt(split[2], 16),
            g: Number.parseInt(split[1], 16),
            r: Number.parseInt(split[0], 16),
        };
    }
    /**
     * Reference code: https://gist.github.com/mjackson/5311256#gistcomment-2789005
     */
    hsvToRGB({ h, s, v }) {
        const hprime = h / 60;
        hprime.toString(2);
        const c = v * s;
        const x = c * (1 - Math.abs((hprime % 2) - 1));
        const m = v - c;
        let r, g, b;
        if (!hprime) {
            r = 0;
            g = 0;
            b = 0;
        }
        if (hprime >= 0 && hprime < 1) {
            r = c;
            g = x;
            b = 0;
        }
        if (hprime >= 1 && hprime < 2) {
            r = x;
            g = c;
            b = 0;
        }
        if (hprime >= 2 && hprime < 3) {
            r = 0;
            g = c;
            b = x;
        }
        if (hprime >= 3 && hprime < 4) {
            r = 0;
            g = x;
            b = c;
        }
        if (hprime >= 4 && hprime < 5) {
            r = x;
            g = 0;
            b = c;
        }
        if (hprime >= 5 && hprime < 6) {
            r = c;
            g = 0;
            b = x;
        }
        return {
            b: Math.round((b + m) * 255),
            g: Math.round((g + m) * 255),
            r: Math.round((r + m) * 255),
        };
    }
    isBright(color) {
        const { r, g, b } = this.hexToRGB(color);
        return r * R_LUMINANCE + g * G_LUMINANCE + b * B_LUMINANCE < 255 / 2;
    }
    /**
     * Reference code: https://gist.github.com/EDais/1ba1be0fe04eca66bbd588a6c9cbd666
     */
    kelvinToRGB(kelvin) {
        kelvin = clamp(kelvin, 1000, 40_000) / 100;
        const r = kelvin <= 66
            ? 255
            : clamp(329.698_727_446 * Math.pow(kelvin - 60, -0.133_204_759_2), 0, 255);
        const g = kelvin <= 66
            ? clamp(99.470_802_586_1 * Math.log(kelvin) - 161.119_568_166_1, 0, 255)
            : clamp(288.122_169_528_3 * Math.pow(kelvin - 60, -0.075_514_849_2), 0, 255);
        const b = kelvin >= 66
            ? 255
            : kelvin <= 19
                ? 0
                : clamp(138.517_731_223_1 * Math.log(kelvin - 10) - 305.044_792_730_7, 0, 255);
        return { b, g, r };
    }
    rgbToHEX({ r = OFF, b = OFF, g = OFF } = {}) {
        return (r.toString(16).padStart(HEX_SIZE, '0') +
            b.toString(16).padStart(HEX_SIZE, '0') +
            g.toString(16).padStart(HEX_SIZE, '0'));
    }
    /**
     * Reference code: https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js-L84
     */
    rgbToHSV({ r, g, b }) {
        (r /= 255), (g /= 255), (b /= 255);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        const d = max - min;
        if (max === min) {
            h = 0; // achromatic
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h,
            s: max == 0 ? 0 : d / max,
            v: max,
        };
    }
};
ColorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prompt_service_1.PromptService !== "undefined" && prompt_service_1.PromptService) === "function" ? _a : Object])
], ColorsService);
exports.ColorsService = ColorsService;


/***/ }),

/***/ "./libs/tty/src/services/comparison-tools.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ComparisonToolsService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const prompt_service_1 = __webpack_require__("./libs/tty/src/services/prompt.service.ts");
const dateMessage = [
    `Compare 2 things relative to each other.`,
    `Numbers are `,
].join(`\n`);
const FILTER_OPERATIONS_HELP = new Map([
    [
        utilities_1.FILTER_OPERATIONS.eq,
        [
            (0, chalk_1.default) `Attempt to compare 2 values for equality. Values will be coerced to {yellow number} / {magenta boolean} / {gray null} as needed`,
            ` `,
            (0, chalk_1.default) ` {cyan -} {blue y/true} = {magenta true}`,
            (0, chalk_1.default) ` {cyan -} {blue n/false} = {magenta false}`,
        ].join(`\n`),
    ],
    [utilities_1.FILTER_OPERATIONS.gt, dateMessage],
    [
        utilities_1.FILTER_OPERATIONS.ne,
        [(0, chalk_1.default) `Attempt to compare 2 values inequality`].join(`\n`),
    ],
    [
        utilities_1.FILTER_OPERATIONS.regex,
        [(0, chalk_1.default) `Does the property conform to a regular expression?`].join(`\n`),
    ],
    [
        utilities_1.FILTER_OPERATIONS.elem,
        [
            (0, chalk_1.default) `{cyan - } {bold.gray comparison value} [{blue banana}, {blue apple}, {blue kitten}] {green elem} {bold.gray value} {blue kitten}`,
            (0, chalk_1.default) `{cyan - } {bold.gray comparison value} [{blue banana}, {blue apple}, {blue kitten}] {green elem} {bold.gray value} {blue vulture}`,
        ].join(`\n`),
    ],
]);
let ComparisonToolsService = class ComparisonToolsService {
    promptService;
    constructor(promptService) {
        this.promptService = promptService;
    }
    async pickOperation() {
        return (await this.promptService.menu({
            keyMap: {},
            right: [
                {
                    entry: ['Equals', utilities_1.FILTER_OPERATIONS.eq],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.eq),
                },
                {
                    entry: ['Not Equals', utilities_1.FILTER_OPERATIONS.ne],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.ne),
                },
                {
                    entry: ['Greater Than', utilities_1.FILTER_OPERATIONS.gt],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.gt),
                },
                {
                    entry: ['Less Than', utilities_1.FILTER_OPERATIONS.lt],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.lt),
                },
                {
                    entry: ['Greater Than / Equals', utilities_1.FILTER_OPERATIONS.gte],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.gte),
                },
                {
                    entry: ['Less Than / Equals', utilities_1.FILTER_OPERATIONS.lte],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.lte),
                },
                {
                    entry: ['In List', utilities_1.FILTER_OPERATIONS.in],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.in),
                },
                {
                    entry: ['Not In List', utilities_1.FILTER_OPERATIONS.nin],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.nin),
                },
                {
                    entry: ['Regex Match', utilities_1.FILTER_OPERATIONS.regex],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.regex),
                },
                {
                    entry: ['Contains Value', utilities_1.FILTER_OPERATIONS.elem],
                    helpText: FILTER_OPERATIONS_HELP.get(utilities_1.FILTER_OPERATIONS.elem),
                },
            ],
        }));
    }
};
ComparisonToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prompt_service_1.PromptService !== "undefined" && prompt_service_1.PromptService) === "function" ? _a : Object])
], ComparisonToolsService);
exports.ComparisonToolsService = ComparisonToolsService;


/***/ }),

/***/ "./libs/tty/src/services/components/acknowledge-component.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AcknowledgeComponentService = void 0;
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
let AcknowledgeComponentService = class AcknowledgeComponentService {
    screenService;
    keyboardService;
    constructor(screenService, keyboardService) {
        this.screenService = screenService;
        this.keyboardService = keyboardService;
    }
    done;
    configure(config, callback) {
        this.done = callback;
        this.keyboardService.setKeyMap(this, new Map([[{}, 'complete']]));
    }
    render() {
        this.screenService.print(`Any key to continue`);
    }
    complete() {
        this.done();
    }
};
AcknowledgeComponentService = __decorate([
    (0, decorators_1.Component)({ type: 'acknowledge' }),
    __metadata("design:paramtypes", [typeof (_a = typeof meta_1.ScreenService !== "undefined" && meta_1.ScreenService) === "function" ? _a : Object, typeof (_b = typeof meta_1.KeyboardManagerService !== "undefined" && meta_1.KeyboardManagerService) === "function" ? _b : Object])
], AcknowledgeComponentService);
exports.AcknowledgeComponentService = AcknowledgeComponentService;


/***/ }),

/***/ "./libs/tty/src/services/components/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/services/components/acknowledge-component.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/components/list-builder-component.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/components/menu-component.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/components/table-builder-component.service.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/services/components/list-builder-component.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ListBuilderComponentService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');
const KEYMAP_FIND = new Map([
    [{ key: 'backspace' }, 'searchBack'],
    [{ key: ['f4', '`'] }, 'toggle'],
    [{ key: 'left' }, 'onLeft'],
    [{ key: 'tab' }, 'toggleFind'],
    [{ key: 'right' }, 'onRight'],
    [{}, 'searchAppend'],
    [
        { key: ['up', 'down', 'home', 'pageup', 'end', 'pagedown'] },
        'navigateSearch',
    ],
]);
const KEYMAP_NORMAL = new Map([
    [{ key: 'i' }, 'invert'],
    [{ description: 'select all', key: ['a', '['] }, 'selectAll'],
    [{ description: 'select none', key: ['n', ']'] }, 'selectNone'],
    [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
    [{ key: ['space', 'f4', '`'] }, 'toggle'],
    [{ key: 'f12' }, 'reset'],
    [{ key: 'c' }, 'cancel'],
    [{ description: 'done', key: 'd' }, 'onEnd'],
    [{ description: 'left', key: 'left' }, 'onLeft'],
    [{ description: 'right', key: 'right' }, 'onRight'],
    [{ key: ['home', 'pageup'] }, 'top'],
    [{ key: ['end', 'pagedown'] }, 'bottom'],
    [{ key: 'up' }, 'previous'],
    [{ key: 'down' }, 'next'],
    [{ key: [...'0123456789'], noHelp: true }, 'numericSelect'],
]);
let ListBuilderComponentService = class ListBuilderComponentService {
    keymap;
    textRender;
    screenService;
    keyboardService;
    constructor(keymap, textRender, screenService, keyboardService) {
        this.keymap = keymap;
        this.textRender = textRender;
        this.screenService = screenService;
        this.keyboardService = keyboardService;
    }
    current;
    done;
    mode = 'select';
    numericSelection = '';
    opt;
    searchText = '';
    selectedType = 'source';
    source;
    value;
    configure(options, done) {
        this.done = done;
        this.opt = options;
        this.opt.source ??= [];
        this.opt.current ??= [];
        this.current = [...this.opt.current];
        this.source = [...this.opt.source];
        this.opt.items ??= `Items`;
        this.value ??= (utilities_1.is.empty(this.source)
            ? this.current[utilities_1.START][utilities_1.VALUE]
            : this.source[utilities_1.START][utilities_1.VALUE]);
        this.detectSide();
        this.keyboardService.setKeyMap(this, KEYMAP_NORMAL);
    }
    render(updateValue = false) {
        const left = `Current ${this.opt.items}`;
        const right = `Available ${this.opt.items}`;
        const current = this.renderSide('current', updateValue && this.selectedType === 'current');
        const source = this.renderSide('source', updateValue && this.selectedType === 'source');
        const search = this.mode === 'find' ? this.searchText : undefined;
        const message = this.textRender.assemble(current, source, {
            left,
            right,
            search,
        });
        this.screenService.render(message.join(`\n`), this.keymap.keymapHelp({ message: message.join(`\n`) }));
    }
    add() {
        if (this.selectedType === 'current') {
            return;
        }
        // retrieve source list (prior to removal)
        const source = this.side('source', false);
        // Move item to current list
        const item = this.source.find(item => item[utilities_1.VALUE] === this.value);
        this.current.push(item);
        // Remove from source
        this.source = this.source.filter(check => check[utilities_1.VALUE] !== this.value);
        // Find move item in original source list
        const index = source.findIndex(i => i[utilities_1.VALUE] === this.value);
        // If at bottom, move up one
        if (index === source.length - utilities_1.ARRAY_OFFSET) {
            // If only item, flip sides
            if (index === utilities_1.START) {
                this.selectedType = 'current';
                return;
            }
            this.value = source[index - utilities_1.INCREMENT][utilities_1.VALUE];
            return;
        }
        // If not bottom, move down one
        this.value = source[index + utilities_1.INCREMENT][utilities_1.VALUE];
    }
    bottom() {
        const list = this.side();
        this.value = list[list.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE];
    }
    cancel() {
        this.reset();
        this.onEnd();
    }
    invert() {
        const temporary = this.source;
        this.source = this.current;
        this.current = temporary;
        this.detectSide();
    }
    navigateSearch(key) {
        const all = this.side();
        let available = this.filterMenu(all);
        if (utilities_1.is.empty(available)) {
            available = all;
        }
        if (['pageup', 'home'].includes(key)) {
            this.value = available[utilities_1.START][utilities_1.VALUE];
            return this.render();
        }
        if (['pagedown', 'end'].includes(key)) {
            this.value = available[available.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE];
            return this.render();
        }
        const index = available.findIndex(entry => entry[utilities_1.VALUE] === this.value);
        if (index === utilities_1.NOT_FOUND) {
            this.value = available[utilities_1.START][utilities_1.VALUE];
            return this.render();
        }
        if (index === utilities_1.START && key === 'up') {
            this.value = available[available.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE];
        }
        else if (index === available.length - utilities_1.ARRAY_OFFSET && key === 'down') {
            this.value = available[utilities_1.START][utilities_1.VALUE];
        }
        else {
            this.value =
                available[key === 'up' ? index - utilities_1.INCREMENT : index + utilities_1.INCREMENT][utilities_1.VALUE];
        }
    }
    next() {
        const list = this.side();
        const index = list.findIndex(i => i[utilities_1.VALUE] === this.value);
        if (index === utilities_1.NOT_FOUND) {
            this.value = list[utilities_1.FIRST][utilities_1.VALUE];
            return;
        }
        if (index === list.length - utilities_1.ARRAY_OFFSET) {
            // Loop around
            this.value = list[utilities_1.FIRST][utilities_1.VALUE];
            return;
        }
        this.value = list[index + utilities_1.INCREMENT][utilities_1.VALUE];
    }
    numericSelect(mixed) {
        this.numericSelection = mixed;
        this.value =
            this.side()[Number(utilities_1.is.empty(this.numericSelection) ? '1' : this.numericSelection) -
                utilities_1.ARRAY_OFFSET][utilities_1.VALUE] ?? this.value;
    }
    onEnd() {
        this.mode = 'select';
        this.done(this.current.map(i => i[utilities_1.VALUE]));
    }
    onLeft() {
        const [left, right] = [
            this.side('current', true),
            this.side('source', true),
        ];
        if (utilities_1.is.empty(left) || this.selectedType === 'current') {
            return;
        }
        this.selectedType = 'current';
        let current = right.findIndex(i => i[utilities_1.VALUE] === this.value);
        if (current === utilities_1.NOT_FOUND) {
            current = utilities_1.START;
        }
        if (current > left.length) {
            current = left.length - utilities_1.ARRAY_OFFSET;
        }
        this.value =
            left.length < current
                ? left[left.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE]
                : left[current][utilities_1.VALUE];
    }
    onRight() {
        const [right, left] = [
            this.side('source', true),
            this.side('current', true),
        ];
        if (this.selectedType === 'source' || utilities_1.is.empty(right)) {
            return;
        }
        this.selectedType = 'source';
        let current = left.findIndex(i => i[utilities_1.VALUE] === this.value);
        if (current === utilities_1.NOT_FOUND) {
            current = utilities_1.START;
        }
        if (current > right.length) {
            current = right.length - utilities_1.ARRAY_OFFSET;
        }
        this.value =
            right.length - utilities_1.ARRAY_OFFSET < current
                ? right[right.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE]
                : right[current][utilities_1.VALUE];
    }
    previous() {
        const list = this.side();
        const index = list.findIndex(i => i[utilities_1.VALUE] === this.value);
        if (index === utilities_1.NOT_FOUND) {
            this.value = list[utilities_1.FIRST][utilities_1.VALUE];
            return;
        }
        if (index === utilities_1.FIRST) {
            // Loop around
            this.value = list[list.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE];
            return;
        }
        this.value = list[index - utilities_1.INCREMENT][utilities_1.VALUE];
    }
    reset() {
        this.current = [...this.opt.current];
        this.source = [...this.opt.source];
    }
    searchAppend(key) {
        if ((key.length > utilities_1.SINGLE && key !== 'space') || ['`'].includes(key)) {
            return false;
        }
        this.searchText += key === 'space' ? ' ' : key;
        if (utilities_1.is.empty(this.side())) {
            this.selectedType = this.selectedType === 'source' ? 'current' : 'source';
        }
        this.render(true);
        return false;
    }
    searchBack() {
        this.searchText = this.searchText.slice(utilities_1.START, utilities_1.ARRAY_OFFSET * utilities_1.INVERT_VALUE);
        this.render(true);
        return false;
    }
    selectAll() {
        this.current = [...this.current, ...this.source];
        this.source = [];
        this.detectSide();
    }
    selectNone() {
        this.source = [...this.current, ...this.source];
        this.current = [];
        this.detectSide();
    }
    toggle() {
        if (this.selectedType === 'current') {
            this.remove();
            return;
        }
        this.add();
    }
    toggleFind() {
        this.mode = this.mode === 'find' ? 'select' : 'find';
        this.searchText = '';
        this.keyboardService.setKeyMap(this, this.mode === 'find' ? KEYMAP_FIND : KEYMAP_NORMAL);
    }
    top() {
        const list = this.side();
        this.value = list[utilities_1.FIRST][utilities_1.VALUE];
    }
    detectSide() {
        const isLeftSide = this.side('current').some(i => i[utilities_1.VALUE] === this.value);
        this.selectedType = isLeftSide ? 'current' : 'source';
    }
    filterMenu(data, updateValue = false) {
        const highlighted = this.textRender.fuzzySort(this.searchText, data);
        if (utilities_1.is.empty(highlighted) || updateValue === false) {
            return highlighted;
        }
        this.value = highlighted[utilities_1.START][utilities_1.VALUE];
        return highlighted;
    }
    remove() {
        if (this.selectedType === 'source') {
            return;
        }
        // retrieve current list (prior to removal)
        const current = this.side('current', false);
        // Move item to current list
        const item = this.current.find(item => item[utilities_1.VALUE] === this.value);
        this.source.push(item);
        // Remove from source
        this.current = this.current.filter(check => check[utilities_1.VALUE] !== this.value);
        // Find move item in original source list
        const index = current.findIndex(i => i[utilities_1.VALUE] === this.value);
        // If at bottom, move up one
        if (index === current.length - utilities_1.ARRAY_OFFSET) {
            // If only item, flip sides
            if (index === utilities_1.START) {
                this.selectedType = 'current';
                return;
            }
            this.value = current[index - utilities_1.INCREMENT][utilities_1.VALUE];
            return;
        }
        // If not bottom, move down one
        this.value = current[index + utilities_1.INCREMENT][utilities_1.VALUE];
    }
    renderSide(side = this.selectedType, updateValue = false) {
        const out = [];
        let menu = this.side(side, true);
        if (this.mode === 'find' && !utilities_1.is.empty(this.searchText)) {
            menu = this.filterMenu(menu, updateValue);
        }
        const maxLabel = (0, includes_1.ansiMaxLength)(...menu.map(entry => entry[utilities_1.LABEL])) + utilities_1.ARRAY_OFFSET;
        if (utilities_1.is.empty(menu)) {
            out.push(chalk_1.default.bold ` ${contracts_1.ICONS.MANUAL}{gray.inverse  List is empty } `);
        }
        menu.forEach(item => {
            const inverse = item[utilities_1.VALUE] === this.value;
            const padded = (0, includes_1.ansiPadEnd)(item[utilities_1.LABEL], maxLabel);
            if (this.selectedType === side) {
                out.push((0, chalk_1.default) ` {${inverse ? 'bgCyanBright.black' : 'white'}  ${padded} }`);
                return;
            }
            out.push((0, chalk_1.default) ` {gray  ${padded} }`);
        });
        return out;
    }
    side(side = this.selectedType, range = false) {
        if (range) {
            return this.textRender.selectRange(this.side(side, false), this.value);
        }
        if (this.mode === 'find') {
            return this.textRender.fuzzySort(this.searchText, this[side]);
        }
        return this[side].sort((a, b) => {
            return a[utilities_1.LABEL].replace(UNSORTABLE, '') > b[utilities_1.LABEL].replace(UNSORTABLE, '')
                ? utilities_1.UP
                : utilities_1.DOWN;
        });
    }
};
ListBuilderComponentService = __decorate([
    (0, decorators_1.Component)({ type: 'list' }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => render_1.KeymapService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => render_1.TextRenderingService))),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.KeymapService !== "undefined" && render_1.KeymapService) === "function" ? _a : Object, typeof (_b = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _b : Object, typeof (_c = typeof meta_1.ScreenService !== "undefined" && meta_1.ScreenService) === "function" ? _c : Object, typeof (_d = typeof meta_1.KeyboardManagerService !== "undefined" && meta_1.KeyboardManagerService) === "function" ? _d : Object])
], ListBuilderComponentService);
exports.ListBuilderComponentService = ListBuilderComponentService;


/***/ }),

/***/ "./libs/tty/src/services/components/menu-component.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MenuComponentService = exports.ToMenuEntry = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');
function ToMenuEntry(entries) {
    const out = [];
    let header = '';
    entries.forEach(i => {
        if (Array.isArray(i)) {
            out.push({
                entry: i,
                type: (0, includes_1.ansiStrip)(header),
            });
            return;
        }
        header = i.line;
    });
    return out;
}
exports.ToMenuEntry = ToMenuEntry;
const DEFAULT_HEADER_PADDING = 4;
const EMPTY_TEXT = ' ';
const SEARCH_KEYMAP = new Map([
    [{ catchAll: true, noHelp: true }, 'onSearchKeyPress'],
    [{ description: 'next', key: 'down' }, 'navigateSearch'],
    [{ description: 'previous', key: 'up' }, 'navigateSearch'],
    [{ description: 'bottom', key: ['end', 'pagedown'] }, 'navigateSearch'],
    [{ description: 'top', key: ['home', 'pageup'] }, 'navigateSearch'],
    [{ description: 'select entry', key: 'enter' }, 'onEnd'],
    [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
]);
let MenuComponentService = class MenuComponentService {
    keymap;
    textRender;
    keyboardService;
    screen;
    constructor(keymap, textRender, keyboardService, screen) {
        this.keymap = keymap;
        this.textRender = textRender;
        this.keyboardService = keyboardService;
        this.screen = screen;
    }
    callbackOutput = '';
    done;
    headerPadding;
    leftHeader;
    mode = 'select';
    numericSelection = '';
    opt;
    rightHeader;
    searchText = '';
    selectedType = 'right';
    value;
    configure(config, done) {
        this.opt = config;
        // this.showHelp = this.opt.showHelp ?? true;
        this.opt.left ??= [];
        this.opt.item ??= 'actions';
        this.opt.right ??= [];
        this.opt.showHeaders ??= !utilities_1.is.empty(this.opt.left);
        this.opt.left.forEach(i => (i.type ??= ''));
        this.opt.right.forEach(i => (i.type ??= ''));
        this.opt.keyMap ??= {};
        // This shouldn't need casting...
        this.value = this.opt.value;
        this.headerPadding = this.opt.headerPadding ?? DEFAULT_HEADER_PADDING;
        this.rightHeader = this.opt.rightHeader ?? 'Menu';
        this.leftHeader = this.opt.leftHeader ?? 'Secondary';
        const defaultValue = this.side('right')[utilities_1.START]?.entry[utilities_1.VALUE];
        this.value ??= defaultValue;
        this.detectSide();
        const oldKeymap = this.keyboardService.save();
        this.done = value => {
            this.keyboardService.load(oldKeymap);
            done(value);
        };
        this.setKeymap();
        const contained = this.side().find(i => i.entry[utilities_1.VALUE] === this.value);
        if (!contained) {
            this.value = defaultValue;
        }
    }
    /**
     * Entrypoint for rendering logic
     */
    render(updateValue = false) {
        if (this.mode === 'select') {
            return this.renderSelect();
        }
        this.renderFind(updateValue);
    }
    /**
     * Run callbacks from the keyMap
     */
    async activateKeyMap(mixed) {
        const { keyMap, keyMapCallback: callback } = this.opt;
        if (utilities_1.is.undefined(keyMap[mixed])) {
            return false;
        }
        if (utilities_1.is.undefined(callback)) {
            this.value = keyMap[mixed][utilities_1.VALUE];
            this.onEnd();
            return false;
        }
        const result = await callback(keyMap[mixed][utilities_1.VALUE], this.getSelected()?.entry);
        if (utilities_1.is.string(result)) {
            this.callbackOutput = result;
            return;
        }
        if (result) {
            this.value = keyMap[mixed][utilities_1.VALUE];
            this.onEnd();
            return false;
        }
    }
    /**
     * Move the cursor to the bottom of the list
     */
    bottom() {
        const list = this.side();
        this.value = list[list.length - utilities_1.ARRAY_OFFSET].entry[utilities_1.VALUE];
    }
    /**
     * Move the cursor around
     */
    navigateSearch(key) {
        const all = this.side();
        let available = this.filterMenu(all);
        if (utilities_1.is.empty(available)) {
            available = all;
        }
        if (['pageup', 'home'].includes(key)) {
            this.value = available[utilities_1.START].entry[utilities_1.VALUE];
            return;
        }
        if (['pagedown', 'end'].includes(key)) {
            this.value = available[available.length - utilities_1.ARRAY_OFFSET].entry[utilities_1.VALUE];
            return;
        }
        const index = available.findIndex(({ entry }) => entry[utilities_1.VALUE] === this.value);
        if (index === utilities_1.NOT_FOUND) {
            this.value = available[utilities_1.START].entry[utilities_1.VALUE];
            return;
        }
        if (index === utilities_1.START && key === 'up') {
            this.value = available[available.length - utilities_1.ARRAY_OFFSET].entry[utilities_1.VALUE];
        }
        else if (index === available.length - utilities_1.ARRAY_OFFSET && key === 'down') {
            this.value = available[utilities_1.START].entry[utilities_1.VALUE];
        }
        else {
            this.value =
                available[key === 'up' ? index - utilities_1.INCREMENT : index + utilities_1.INCREMENT].entry[utilities_1.VALUE];
        }
    }
    /**
     * Move down 1 entry
     */
    next() {
        const list = this.side();
        const index = list.findIndex(i => i.entry[utilities_1.VALUE] === this.value);
        if (index === utilities_1.NOT_FOUND) {
            this.value = list[utilities_1.FIRST].entry[utilities_1.VALUE];
            return;
        }
        if (index === list.length - utilities_1.ARRAY_OFFSET) {
            // Loop around
            this.value = list[utilities_1.FIRST].entry[utilities_1.VALUE];
            return;
        }
        this.value = list[index + utilities_1.INCREMENT].entry[utilities_1.VALUE];
    }
    numberSelect(mixed) {
        this.numericSelection = mixed;
        this.value =
            this.side()[Number(utilities_1.is.empty(this.numericSelection) ? '1' : this.numericSelection) -
                utilities_1.ARRAY_OFFSET]?.entry[utilities_1.VALUE] ?? this.value;
    }
    /**
     * Terminate the editor
     */
    onEnd() {
        this.mode = 'select';
        this.done(this.value);
        return false;
    }
    /**
     * on left key press - attempt to move to left menu
     */
    onLeft() {
        const [right, left] = [this.side('right'), this.side('left')];
        if (utilities_1.is.empty(this.opt.left) || this.selectedType === 'left') {
            return;
        }
        this.selectedType = 'left';
        let current = right.findIndex(i => i.entry[utilities_1.VALUE] === this.value);
        if (current === utilities_1.NOT_FOUND) {
            current = utilities_1.START;
        }
        if (current > left.length) {
            current = left.length - utilities_1.ARRAY_OFFSET;
        }
        this.value =
            left.length - utilities_1.ARRAY_OFFSET < current
                ? left[left.length - utilities_1.ARRAY_OFFSET].entry[utilities_1.VALUE]
                : left[current].entry[utilities_1.VALUE];
    }
    /**
     * On right key press - attempt to move editor to right side
     */
    onRight() {
        if (this.selectedType === 'right') {
            return;
        }
        const [right, left] = [this.side('right'), this.side('left')];
        this.selectedType = 'right';
        let current = left.findIndex(i => i.entry[utilities_1.VALUE] === this.value);
        if (current === utilities_1.NOT_FOUND) {
            current = utilities_1.START;
        }
        if (current > right.length) {
            current = right.length - utilities_1.ARRAY_OFFSET;
        }
        this.value =
            right.length - utilities_1.ARRAY_OFFSET < current
                ? right[right.length - utilities_1.ARRAY_OFFSET].entry[utilities_1.VALUE]
                : right[current].entry[utilities_1.VALUE];
    }
    /**
     * Key handler for widget while in search mode
     */
    onSearchKeyPress(key) {
        if (key === 'backspace') {
            this.searchText = this.searchText.slice(utilities_1.START, utilities_1.ARRAY_OFFSET * utilities_1.INVERT_VALUE);
            this.render(true);
            return false;
        }
        if (['up', 'down', 'home', 'pageup', 'end', 'pagedown'].includes(key)) {
            this.navigateSearch(key);
        }
        if (key === 'space') {
            this.searchText += ' ';
            this.render(true);
            return false;
        }
        if (key.length > utilities_1.SINGLE) {
            if (!utilities_1.is.undefined(this.opt.keyMap[key])) {
                this.value = this.opt.keyMap[key][utilities_1.VALUE];
                this.onEnd();
            }
            return;
        }
        this.searchText += key;
        this.render(true);
        return false;
    }
    /**
     * Attempt to move up 1 item in the active list
     */
    previous() {
        const list = this.side();
        const index = list.findIndex(i => i.entry[utilities_1.VALUE] === this.value);
        if (index === utilities_1.NOT_FOUND) {
            this.value = list[utilities_1.FIRST].entry[utilities_1.VALUE];
            return;
        }
        if (index === utilities_1.FIRST) {
            // Loop around
            this.value = list[list.length - utilities_1.ARRAY_OFFSET].entry[utilities_1.VALUE];
            return;
        }
        this.value = list[index - utilities_1.INCREMENT].entry[utilities_1.VALUE];
    }
    /**
     * Simple toggle function
     */
    toggleFind() {
        this.mode = this.mode === 'find' ? 'select' : 'find';
        if (this.mode === 'select') {
            this.detectSide();
            this.setKeymap();
        }
        else {
            this.searchText = '';
            this.keyboardService.setKeyMap(this, SEARCH_KEYMAP);
        }
    }
    /**
     * Move cursor to the top of the current list
     */
    top() {
        const list = this.side();
        this.value = list[utilities_1.FIRST].entry[utilities_1.VALUE];
    }
    /**
     * Auto detect selectedType based on the current value
     */
    detectSide() {
        const isLeftSide = this.side('left').some(i => i.entry[utilities_1.VALUE] === this.value);
        this.selectedType = isLeftSide ? 'left' : 'right';
    }
    /**
     * Search mode - limit results based on the search text
     */
    filterMenu(data, updateValue = false) {
        const highlighted = this.textRender
            .fuzzySort(this.searchText, data.map(({ entry }) => entry))
            .map(i => {
            const item = data.find(({ entry }) => entry[utilities_1.VALUE] === i[utilities_1.VALUE]);
            return {
                ...item,
                entry: i,
            };
        });
        if (updateValue) {
            this.value = utilities_1.is.empty(highlighted)
                ? undefined
                : highlighted[utilities_1.START].entry[utilities_1.VALUE];
        }
        return highlighted;
    }
    /**
     * Retrieve the currently selected menu entry
     */
    getSelected() {
        const list = [
            ...this.opt.left,
            ...this.opt.right,
            ...Object.values(this.opt.keyMap).map(entry => ({ entry })),
        ];
        const out = list.find(i => i.entry[utilities_1.VALUE] === this.value);
        return out ?? list[utilities_1.START];
    }
    /**
     * Rendering for search mode
     */
    renderFind(updateValue = false) {
        const message = [
            ...this.textRender.searchBox(this.searchText),
            ...this.renderSide(undefined, false, updateValue),
        ].join(`\n`);
        this.screen.render(message, this.keymap.keymapHelp({ message }));
    }
    /**
     * Rendering for while not in find mode
     */
    renderSelect() {
        let message = '';
        if (!utilities_1.is.empty(this.callbackOutput)) {
            message = this.callbackOutput + `\n\n`;
        }
        const out = !utilities_1.is.empty(this.opt.left)
            ? this.textRender.assemble(this.renderSide('left'), this.renderSide('right'))
            : this.renderSide('right');
        if (this.opt.showHeaders) {
            out[utilities_1.FIRST] = `\n  ${out[utilities_1.FIRST]}\n `;
        }
        else {
            message += `\n \n`;
        }
        message += out.map(i => `  ${i}`).join(`\n`);
        const selectedItem = this.getSelected();
        if (utilities_1.is.string(selectedItem?.helpText)) {
            message += (0, chalk_1.default) `\n \n {blue ?} ${selectedItem.helpText
                .split(`\n`)
                .map(line => line.replace(new RegExp('^ -'), chalk_1.default.cyan('   -')))
                .join(`\n`)}`;
        }
        this.screen.render(message, this.keymap.keymapHelp({
            message,
            prefix: new Map(Object.entries(this.opt.keyMap).map(([description, item]) => {
                if (!Array.isArray(item)) {
                    return;
                }
                const [label] = item;
                return [
                    { description: (label + '  '), key: description },
                    '',
                ];
            })),
        }));
    }
    /**
     * Render a menu from a side
     */
    // eslint-disable-next-line radar/cognitive-complexity
    renderSide(side = this.selectedType, header = this.opt.showHeaders, updateValue = false) {
        const out = [''];
        let menu = this.side(side);
        if (this.mode === 'find' && !utilities_1.is.empty(this.searchText)) {
            menu = this.filterMenu(menu, updateValue);
        }
        const temporary = this.textRender.selectRange(menu.map(({ entry }) => entry), this.value);
        menu = temporary.map(i => menu.find(({ entry }) => i[utilities_1.VALUE] === entry[utilities_1.VALUE]));
        const maxType = (0, includes_1.ansiMaxLength)(...menu.map(({ type }) => type));
        let last = '';
        const maxLabel = (0, includes_1.ansiMaxLength)(...menu.map(({ entry }) => entry[utilities_1.LABEL])) + utilities_1.ARRAY_OFFSET;
        if (utilities_1.is.empty(menu) && !this.opt.keyOnly) {
            out.push(chalk_1.default.bold ` ${contracts_1.ICONS.WARNING}{yellowBright.inverse  No ${this.opt.item} to select from }`);
        }
        menu.forEach(item => {
            let prefix = (0, includes_1.ansiPadEnd)(item.type, maxType);
            if (this.opt.titleTypes) {
                prefix = (0, utilities_1.TitleCase)(prefix);
            }
            if (last === prefix) {
                prefix = (0, chalk_1.default)(''.padEnd(maxType, ' '));
            }
            else {
                if (last !== '' && this.mode !== 'find') {
                    out.push(EMPTY_TEXT);
                }
                last = prefix;
                prefix = (0, chalk_1.default)(prefix);
            }
            if (this.mode === 'find') {
                prefix = ``;
            }
            const inverse = item.entry[utilities_1.VALUE] === this.value;
            const padded = (0, includes_1.ansiPadEnd)(item.entry[utilities_1.LABEL], maxLabel);
            if (this.selectedType === side) {
                out.push((0, chalk_1.default) ` {magenta.bold ${prefix}} {${inverse ? 'bgCyanBright.black' : 'white'}  ${padded}}`);
                return;
            }
            out.push((0, chalk_1.default) ` {gray ${prefix}  {gray ${padded}}}`);
        });
        const max = (0, includes_1.ansiMaxLength)(...out);
        if (header) {
            if (side === 'left') {
                out[utilities_1.FIRST] = chalk_1.default.bold.blue.dim(`${this.leftHeader}${''.padEnd(this.headerPadding, ' ')}`.padStart(max, ' '));
            }
            else {
                out[utilities_1.FIRST] = chalk_1.default.bold.blue.dim(`${''.padEnd(this.headerPadding, ' ')}${this.rightHeader}`.padEnd(max, ' '));
            }
        }
        else {
            out.shift();
        }
        return out;
    }
    setKeymap() {
        const PARTIAL_LIST = [
            [{ catchAll: true, noHelp: true }, 'activateKeyMap'],
            [{ key: 'down' }, 'next'],
            [{ description: 'select entry', key: 'enter' }, 'onEnd'],
            [{ key: 'up' }, 'previous'],
            [
                { description: 'select item', key: [...'0123456789'], noHelp: true },
                'numberSelect',
            ],
            [{ key: ['end', 'pagedown'] }, 'bottom'],
            [{ key: ['home', 'pageup'] }, 'top'],
        ];
        const LEFT_RIGHT = [
            [{ description: 'left', key: 'left' }, 'onLeft'],
            [{ description: 'right', key: 'right' }, 'onRight'],
        ];
        const SEARCH = [
            [{ description: 'toggle find', key: 'tab' }, 'toggleFind'],
        ];
        const keymap = new Map([
            ...PARTIAL_LIST,
            ...(utilities_1.is.empty(this.opt.left) || utilities_1.is.empty(this.opt.right)
                ? []
                : LEFT_RIGHT),
            ...(this.opt.hideSearch ? [] : SEARCH),
        ]);
        this.keyboardService.setKeyMap(this, keymap);
    }
    /**
     * Retrieve a sorted list of entries
     *
     * In find mode, both lists get merged into a single one
     */
    side(side = this.selectedType, noRecurse = false) {
        if (this.mode === 'find' && !noRecurse) {
            return [...this.side('right', true), ...this.side('left', true)];
        }
        return this.opt[side].sort((a, b) => {
            if (a.type === b.type) {
                return a.entry[utilities_1.LABEL].replace(UNSORTABLE, '') >
                    b.entry[utilities_1.LABEL].replace(UNSORTABLE, '')
                    ? utilities_1.UP
                    : utilities_1.DOWN;
            }
            if (a.type > b.type) {
                return utilities_1.UP;
            }
            return utilities_1.DOWN;
        });
    }
};
MenuComponentService = __decorate([
    (0, decorators_1.Component)({ type: 'menu' }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => render_1.KeymapService))),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => render_1.TextRenderingService))),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.KeymapService !== "undefined" && render_1.KeymapService) === "function" ? _a : Object, typeof (_b = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _b : Object, typeof (_c = typeof meta_1.KeyboardManagerService !== "undefined" && meta_1.KeyboardManagerService) === "function" ? _c : Object, typeof (_d = typeof meta_1.ScreenService !== "undefined" && meta_1.ScreenService) === "function" ? _d : Object])
], MenuComponentService);
exports.MenuComponentService = MenuComponentService;


/***/ }),

/***/ "./libs/tty/src/services/components/table-builder-component.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TableBuilderComponentService = void 0;
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const object_path_1 = __webpack_require__("object-path");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
let TableBuilderComponentService = class TableBuilderComponentService {
    tableService;
    textRendering;
    moduleScanner;
    footerEditor;
    keymapService;
    applicationManager;
    screenService;
    keyboardService;
    constructor(tableService, textRendering, moduleScanner, footerEditor, keymapService, applicationManager, screenService, keyboardService) {
        this.tableService = tableService;
        this.textRendering = textRendering;
        this.moduleScanner = moduleScanner;
        this.footerEditor = footerEditor;
        this.keymapService = keymapService;
        this.applicationManager = applicationManager;
        this.screenService = screenService;
        this.keyboardService = keyboardService;
    }
    confirmCB;
    currentEditor;
    done;
    editorOptions;
    isSelected = false;
    opt;
    rows;
    selectedCell = utilities_1.START;
    selectedRow = utilities_1.START;
    configure(config, done) {
        this.opt = config;
        this.done = done;
        this.opt.current ??= [];
        this.rows = Array.isArray(this.opt.current)
            ? this.opt.current
            : [this.opt.current];
        this.createKeymap();
    }
    render() {
        const message = this.textRendering.pad(this.tableService.renderTable(this.opt, this.rows, this.selectedRow, this.selectedCell));
        const column = this.opt.elements[this.selectedCell];
        const keymap = this.keymapService.keymapHelp({
            message,
            prefix: this.currentEditor
                ? this.footerEditor.getKeyMap(this.currentEditor, column, this.rows[this.selectedRow])
                : new Map(),
        });
        const max = (0, includes_1.ansiMaxLength)(keymap, message);
        this.screenService.render(message, [` `, ...this.renderEditor(max), keymap].join(`\n`));
    }
    get columns() {
        return this.opt.elements;
    }
    add() {
        this.rows.push({});
    }
    async delete() {
        const result = await new Promise(done => {
            this.confirmCB = done;
            this.currentEditor = contracts_1.TABLE_CELL_TYPE.confirm;
            this.editorOptions = {
                current: false,
                label: `Are you sure you want to delete this?`,
            };
            this.render();
        });
        this.currentEditor = undefined;
        this.editorOptions = undefined;
        this.confirmCB = undefined;
        if (!result) {
            return;
        }
        this.rows = this.rows.filter((item, index) => index !== this.selectedRow);
        if (this.selectedRow > this.rows.length - utilities_1.ARRAY_OFFSET) {
            this.selectedRow = this.rows.length - utilities_1.ARRAY_OFFSET;
        }
        this.render();
    }
    editComplete() {
        if (!this.currentEditor) {
            return;
        }
        if (this.confirmCB) {
            this.confirmCB(this.editorOptions.current);
            return;
        }
        const column = this.opt.elements[this.selectedCell];
        const current = this.rows[this.selectedRow];
        (0, object_path_1.set)(utilities_1.is.object(current) ? current : {}, column.path, this.editorOptions.current);
        this.currentEditor = undefined;
        this.editorOptions = undefined;
    }
    enableEdit() {
        this.keyboardService.wrap(async () => {
            const column = this.opt.elements[this.selectedCell];
            this.currentEditor = await column.type;
            const row = this.rows[this.selectedRow];
            const current = (0, object_path_1.get)(utilities_1.is.object(row) ? row : {}, column.path);
            this.editorOptions = this.footerEditor.initConfig(current, column);
        });
    }
    onDown() {
        if (this.selectedRow === this.rows.length - utilities_1.ARRAY_OFFSET) {
            return false;
        }
        this.selectedRow++;
    }
    onEnd() {
        this.done(this.rows);
    }
    onLeft() {
        if (this.selectedCell === utilities_1.START) {
            return false;
        }
        this.selectedCell--;
    }
    onRight() {
        if (this.selectedCell === this.columns.length - utilities_1.ARRAY_OFFSET) {
            return false;
        }
        this.selectedCell++;
    }
    onUp() {
        if (this.selectedRow === utilities_1.START) {
            return false;
        }
        this.selectedRow--;
    }
    selectCell() {
        this.isSelected = !this.isSelected;
    }
    createKeymap() {
        this.keyboardService.setKeyMap(this, new Map([
            // While there is no editor
            ...[
                [
                    { description: 'done', key: 's', modifiers: { ctrl: true } },
                    'onEnd',
                ],
                [{ description: 'cursor left', key: 'left' }, 'onLeft'],
                [{ description: 'cursor right', key: 'right' }, 'onRight'],
                [{ description: 'cursor up', key: 'up' }, 'onUp'],
                [{ description: 'cursor down', key: 'down' }, 'onDown'],
                [{ description: 'add row', key: '+' }, 'add'],
                [{ description: 'delete row', key: ['-', 'delete'] }, 'delete'],
                [{ description: 'edit cell', key: 'enter' }, 'enableEdit'],
            ].map(([options, key]) => [
                { active: () => utilities_1.is.empty(this.currentEditor), ...options },
                key,
            ]),
            // Only with editor
            ...[
                [{ description: 'done editing', key: 'enter' }, 'editComplete'],
            ].map(([options, key]) => [
                { active: () => !utilities_1.is.empty(this.currentEditor), ...options },
                key,
            ]),
            // Others
            [
                { catchAll: true, noHelp: true },
                (key, modifiers) => this.editorKeyPress(key, modifiers),
            ],
        ]));
    }
    async editorKeyPress(key, modifiers) {
        if (!this.currentEditor) {
            return;
        }
        const column = this.opt.elements[this.selectedCell];
        this.editorOptions = await this.footerEditor.onKeyPress(column, this.editorOptions, key, modifiers, this.currentEditor);
        if (utilities_1.is.undefined(this.editorOptions)) {
            // It cancelled itself
            this.currentEditor = undefined;
        }
        this.render();
    }
    renderEditor(width) {
        if (!this.currentEditor) {
            return [];
        }
        const column = this.opt.elements[this.selectedCell];
        const line = (0, chalk_1.default) `{${this.footerEditor.lineColor(this.currentEditor, this.editorOptions)} ${'='.repeat(width)}}`;
        return [
            line,
            this.footerEditor.render(column, this.editorOptions, width, this.currentEditor),
        ];
    }
};
TableBuilderComponentService = __decorate([
    (0, decorators_1.Component)({ type: 'table' }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TableService !== "undefined" && render_1.TableService) === "function" ? _a : Object, typeof (_b = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _b : Object, typeof (_c = typeof boilerplate_1.ModuleScannerService !== "undefined" && boilerplate_1.ModuleScannerService) === "function" ? _c : Object, typeof (_d = typeof render_1.FooterEditorService !== "undefined" && render_1.FooterEditorService) === "function" ? _d : Object, typeof (_e = typeof render_1.KeymapService !== "undefined" && render_1.KeymapService) === "function" ? _e : Object, typeof (_f = typeof meta_1.ApplicationManagerService !== "undefined" && meta_1.ApplicationManagerService) === "function" ? _f : Object, typeof (_g = typeof meta_1.ScreenService !== "undefined" && meta_1.ScreenService) === "function" ? _g : Object, typeof (_h = typeof meta_1.KeyboardManagerService !== "undefined" && meta_1.KeyboardManagerService) === "function" ? _h : Object])
], TableBuilderComponentService);
exports.TableBuilderComponentService = TableBuilderComponentService;


/***/ }),

/***/ "./libs/tty/src/services/config-builder.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfigBuilderService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const async_1 = __webpack_require__("async");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const fs_1 = __webpack_require__("fs");
const ini_1 = __webpack_require__("ini");
const inquirer_1 = __importDefault(__webpack_require__("inquirer"));
const object_path_1 = __webpack_require__("object-path");
const os_1 = __webpack_require__("os");
const path_1 = __webpack_require__("path");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const components_1 = __webpack_require__("./libs/tty/src/services/components/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const prompt_service_1 = __webpack_require__("./libs/tty/src/services/prompt.service.ts");
const ARGV_APP = 3;
const DATA = 1;
const COMMAIFY = 10_000;
const HEADER_END_PADDING = 20;
const NONE = 0;
const NO_VALUE = { no: 'value' };
let initialApp = process.argv[ARGV_APP];
let ConfigBuilderService = class ConfigBuilderService {
    activeApplication;
    logger;
    workspace;
    promptService;
    configService;
    applicationManager;
    screenService;
    constructor(activeApplication, logger, workspace, promptService, configService, applicationManager, screenService) {
        this.activeApplication = activeApplication;
        this.logger = logger;
        this.workspace = workspace;
        this.promptService = promptService;
        this.configService = configService;
        this.applicationManager = applicationManager;
        this.screenService = screenService;
    }
    config;
    loadedApplication = '';
    /**
     * Generic entrypoint for interface
     *
     * - Prompts user for library + priority
     * - Assembles a config
     * - Passes off to handler
     */
    async exec() {
        const application = initialApp ||
            (await this.promptService.menu({
                keyMap: {},
                right: (0, components_1.ToMenuEntry)(this.applicationChoices()),
                rightHeader: `Application choices`,
            }));
        initialApp = undefined;
        if (!this.workspace.isProject(application)) {
            this.logger.error({ application }, `Invalid application`);
            throw new common_1.InternalServerErrorException();
        }
        await this.handleConfig(application);
    }
    /**
     * Prompt the user for what to do
     */
    async handleConfig(application = this.activeApplication) {
        application = utilities_1.is.string(application)
            ? application
            : application.description;
        this.loadConfig(application);
        const action = await this.promptService.menu({
            keyMap: {
                d: [chalk_1.default.bold `Done`, contracts_1.DONE],
            },
            right: (0, components_1.ToMenuEntry)([
                [`${contracts_1.ICONS.EDIT}Edit`, 'edit'],
                [`${contracts_1.ICONS.DESCRIBE}Show`, 'describe'],
                [`${contracts_1.ICONS.SAVE}Save`, 'save'],
            ]),
        });
        if ((0, contracts_1.IsDone)(action)) {
            return;
        }
        switch (action) {
            case 'edit':
                await this.buildApplication(application);
                return await this.handleConfig(application);
            case 'describe':
                this.screenService.print((0, ini_1.encode)(this.config));
                return await this.handleConfig(application);
            case 'save':
                (0, fs_1.writeFileSync)((0, path_1.join)((0, os_1.homedir)(), '.config', application), (0, ini_1.encode)(this.config));
                return await this.handleConfig(application);
        }
    }
    applicationChoices() {
        return [];
        // return this.workspace
        //   .list('application')
        //   .filter(item => {
        //     const { projects } = this.workspace.workspace;
        //     const { targets } = projects[item];
        //     const scanner =
        //       targets?.build?.configurations[SCAN_CONFIG_CONFIGURATION];
        //     return !is.undefined(scanner);
        //   })
        //   .map(item => {
        //     const tag = existsSync(join(homedir(), '.config', item))
        //       ? chalk.green('*')
        //       : chalk.yellow('*');
        //     const name = this.workspace.PACKAGES.get(item).displayName;
        //     return [`${tag} ${name}`, item];
        //   });
    }
    async buildApplication(application) {
        const configEntries = await this.scan(application);
        this.applicationManager.setHeader(`Available Configs`);
        this.screenService.print((0, chalk_1.default) `Configuring {yellow.bold ${(0, utilities_1.TitleCase)(application)}}\n\n`);
        const entries = await this.buildEntries(configEntries);
        const list = await this.promptService.pickMany(`Select properties to change\n`, entries);
        await (0, async_1.eachSeries)(list, async (item, callback) => {
            await this.prompt(item);
            if (callback) {
                callback();
            }
        });
    }
    buildEntries(config) {
        let maxLibrary = 0;
        let maxDefault = 0;
        let maxProperty = 0;
        config.forEach(entry => {
            entry.default ??= '';
            maxLibrary = Math.max(maxLibrary, entry.library.length);
            maxDefault = Math.max(maxDefault, entry.default.toString().length);
            maxProperty = Math.max(maxProperty, entry.property.toString().length);
        });
        const build = [];
        config.forEach(entry => {
            entry.metadata.configurable = utilities_1.is.undefined(entry.metadata.configurable)
                ? true
                : entry.metadata.configurable;
            if (entry.metadata.configurable === false) {
                return;
            }
            build.push([
                {
                    name: (0, chalk_1.default) `{bold ${this.colorProperty(entry, maxProperty)}} {cyan |} ${entry.library.padEnd(maxLibrary, ' ')} {cyan |} ${this.colorDefault(entry, maxDefault)} {cyan |} {gray ${entry.metadata.description}}`,
                    short: this.colorProperty(entry, NONE),
                },
                entry,
            ]);
        });
        this.screenService.print([
            (0, chalk_1.default) `{bold.yellow Property colors} - {gray Lower colors take precedence}`,
            (0, chalk_1.default) ` {cyan -} {white.bold Defaults}    {cyanBright :} {white System is using default value}`,
            (0, chalk_1.default) ` {cyan -} {magenta.bold Careful}     {cyanBright :} {white Don't set these unless you know what you're doing}`,
            (0, chalk_1.default) ` {cyan -} {yellow.bold Recommended} {cyanBright :} {white Setting the value of this property is recommended}`,
            (0, chalk_1.default) ` {cyan -} {red.bold Required}    {cyanBright :} {white Property is required, and not currently set}`,
            (0, chalk_1.default) ` {cyan -} {greenBright.bold Overridden}  {cyanBright :} {white You have provided a value for this property}`,
            ``,
            chalk_1.default.bold.white.bgBlue `   ${'     Property'.padEnd(maxProperty, ' ')}   ${'  Project'.padEnd(maxLibrary, ' ')}   ${'    Default Value'.padEnd(maxDefault, ' ')}           Description   ${''.padEnd(HEADER_END_PADDING, ' ')}`,
        ].join(`\n`));
        const out = [];
        let lastLibrary = ``;
        build
            .sort((aa, bb) => {
            const a = aa[DATA];
            const b = bb[DATA];
            if (a.library !== b.library) {
                return a.library > b.library ? utilities_1.UP : utilities_1.DOWN;
            }
            return a.property > b.property ? utilities_1.UP : utilities_1.DOWN;
        })
            .forEach(entry => {
            const data = entry[DATA];
            if (data.library !== lastLibrary) {
                lastLibrary = data.library;
                out.push(new inquirer_1.default.Separator(chalk_1.default.white((0, utilities_1.TitleCase)(data.library))));
            }
            out.push(entry);
        });
        return out;
    }
    colorDefault(entry, max) {
        const defaultValue = entry.default;
        if (utilities_1.is.undefined(defaultValue) || defaultValue === '') {
            return chalk_1.default.gray(`none`.padEnd(max, ' '));
        }
        if (utilities_1.is.number(defaultValue)) {
            return chalk_1.default.yellowBright((defaultValue > COMMAIFY
                ? defaultValue.toLocaleString()
                : defaultValue.toString()).padEnd(max, ' '));
        }
        if (utilities_1.is.boolean(defaultValue)) {
            return chalk_1.default.blueBright(defaultValue.toString().padEnd(max, ' '));
        }
        if (utilities_1.is.string(defaultValue)) {
            return chalk_1.default.magentaBright(defaultValue.toString().padEnd(max, ' '));
        }
        return chalk_1.default.whiteBright(defaultValue.toString().padEnd(max, ' '));
    }
    colorProperty(entry, maxProperty) {
        const property = entry.property.padEnd(maxProperty, ' ');
        const path = this.path(entry);
        const value = (0, object_path_1.get)(this.config, path, NO_VALUE);
        if (value !== NO_VALUE) {
            return chalk_1.default.greenBright(property);
        }
        if (entry.metadata.required) {
            return chalk_1.default.redBright(property);
        }
        if (entry.metadata.warnDefault) {
            return chalk_1.default.yellowBright(property);
        }
        if (entry.metadata.careful) {
            return chalk_1.default.magentaBright(property);
        }
        return chalk_1.default.whiteBright(property);
    }
    loadConfig(application) {
        this.config = this.configService.config;
        this.loadedApplication = application;
    }
    path(config) {
        if (config.library && config.library !== this.loadedApplication) {
            return `libs.${config.library}.${config.property}`;
        }
        return `application.${config.property}`;
    }
    async prompt(config) {
        const path = this.path(config);
        const label = this.colorProperty(config, NONE);
        const current = (0, object_path_1.get)(this.config, path, config.default);
        let result;
        switch (config.metadata.type) {
            case 'boolean':
                result = await this.promptService.boolean(label, current);
                break;
            case 'number':
                result = await this.promptService.number(label, current);
                break;
            case 'password':
                result = await this.promptService.password(label, current);
                break;
            case 'url':
            case 'string':
                const { metadata } = config;
                result = Array.isArray(metadata.enum)
                    ? await this.promptService.pickOne(label, metadata.enum.map(i => [i, i]), current)
                    : await this.promptService.string(label, current);
                break;
        }
        if (result === config.default || result === current) {
            // Don't set defaults
            return;
        }
        (0, object_path_1.set)(this.config, path, result);
    }
    async scan(application) {
        // if (!this.workspace.IS_DEVELOPMENT) {
        //   // Production builds ship with assembled config
        //   // Running in dev environment will do live scan
        //   const config: ConfigTypeDTO[] = JSON.parse(
        //     readFileSync(join(__dirname, 'assets', 'config.json'), 'utf8'),
        //   );
        //   return new Set(config);
        // }
        // this.logger.debug(`Preparing scanner`);
        // const build = execa(`npx`, [
        //   `nx`,
        //   `build`,
        //   application,
        //   `--configuration=${SCAN_CONFIG_CONFIGURATION}`,
        // ]);
        // build.stdout.pipe(process.stdout);
        // await build;
        // this.logger.debug(`Scanning`);
        // this.workspace.initMetadata();
        // const { outputPath } =
        //   this.workspace.workspace.projects[application].targets.build
        //     .configurations[SCAN_CONFIG_CONFIGURATION];
        // const config: ConfigTypeDTO[] = [];
        // try {
        //   const out = await execa(`node`, [join(outputPath, 'main.js')], {});
        //   config.push(...(JSON.parse(out.stdout) as ConfigTypeDTO[]));
        // } catch (error) {
        //   // FIXME: Kill signal error that sometimes shows up
        //   // Just ignoring the error here
        //   config.push(...(JSON.parse(error.stdout) as ConfigTypeDTO[]));
        // }
        // return new Set(config);
        return new Set();
    }
};
ConfigBuilderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(boilerplate_1.ACTIVE_APPLICATION)),
    __param(1, (0, boilerplate_1.InjectLogger)()),
    __metadata("design:paramtypes", [Symbol, typeof (_a = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _a : Object, typeof (_b = typeof boilerplate_1.WorkspaceService !== "undefined" && boilerplate_1.WorkspaceService) === "function" ? _b : Object, typeof (_c = typeof prompt_service_1.PromptService !== "undefined" && prompt_service_1.PromptService) === "function" ? _c : Object, typeof (_d = typeof boilerplate_1.AutoConfigService !== "undefined" && boilerplate_1.AutoConfigService) === "function" ? _d : Object, typeof (_e = typeof meta_1.ApplicationManagerService !== "undefined" && meta_1.ApplicationManagerService) === "function" ? _e : Object, typeof (_f = typeof meta_1.ScreenService !== "undefined" && meta_1.ScreenService) === "function" ? _f : Object])
], ConfigBuilderService);
exports.ConfigBuilderService = ConfigBuilderService;


/***/ }),

/***/ "./libs/tty/src/services/editors/boolean-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BooleanEditorService = void 0;
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
let BooleanEditorService = class BooleanEditorService {
    textRendering;
    constructor(textRendering) {
        this.textRendering = textRendering;
    }
    onKeyPress(config, key) {
        if (key === 'left') {
            config.current = true;
        }
        if (key === 'right') {
            config.current = false;
        }
        return config;
    }
    render(config) {
        const content = [
            (0, chalk_1.default) `{${config.current ? 'magenta.bold' : 'gray'} true}`,
            (0, chalk_1.default) `{${!config.current ? 'magenta.bold' : 'gray'} false}`, // [!config.current ? 'magenta' : 'gray']('false'),
        ].join(' ');
        return this.textRendering.pad(content);
    }
};
BooleanEditorService = __decorate([
    (0, decorators_1.Editor)({
        keyMap: new Map([
            [{ description: 'cancel', key: 'tab' }, ''],
            [{ description: 'left', key: 'left' }, ''],
            [{ description: 'right', key: 'right' }, ''],
        ]),
        type: 'boolean',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _a : Object])
], BooleanEditorService);
exports.BooleanEditorService = BooleanEditorService;


/***/ }),

/***/ "./libs/tty/src/services/editors/confirm.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConfirmEditorService = void 0;
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
let ConfirmEditorService = class ConfirmEditorService {
    textRendering;
    constructor(textRendering) {
        this.textRendering = textRendering;
    }
    lineColor() {
        return 'yellow';
    }
    onKeyPress(config, key) {
        if (key === 'left') {
            config.current = true;
        }
        if (key === 'right') {
            config.current = false;
        }
        if (key === 'tab') {
            return undefined;
        }
        return config;
    }
    render({ ...config }) {
        const content = [
            (0, chalk_1.default) `{${config.current ? 'magenta.bold' : 'gray'} yes}`,
            (0, chalk_1.default) `{${!config.current ? 'magenta.bold' : 'gray'} no}`,
        ].join(' ');
        return this.textRendering.pad((0, chalk_1.default) `{yellow.bold ${config.label}}\n${content}`);
    }
};
ConfirmEditorService = __decorate([
    (0, decorators_1.Editor)({
        keyMap: new Map([
            [{ description: 'cancel', key: 'tab' }, ''],
            [{ description: 'left', key: 'left' }, ''],
            [{ description: 'right', key: 'right' }, ''],
        ]),
        type: 'confirm',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _a : Object])
], ConfirmEditorService);
exports.ConfirmEditorService = ConfirmEditorService;


/***/ }),

/***/ "./libs/tty/src/services/editors/date-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DateEditorService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
let DateEditorService = class DateEditorService {
};
DateEditorService = __decorate([
    (0, common_1.Injectable)()
], DateEditorService);
exports.DateEditorService = DateEditorService;


/***/ }),

/***/ "./libs/tty/src/services/editors/discriminator-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiscriminatorEditorService = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
let DiscriminatorEditorService = class DiscriminatorEditorService {
    textRendering;
    constructor(textRendering) {
        this.textRendering = textRendering;
    }
    onKeyPress(config, key) {
        switch (key) {
            case 'escape':
                return undefined;
            case 'up':
                this.previous(config);
                break;
            case 'down':
                this.next(config);
                break;
        }
        return config;
    }
    render(config) {
        config.current ??= config.entries[utilities_1.START][utilities_1.VALUE];
        const items = this.textRendering.selectRange(config.entries, config.current);
        const longest = (0, includes_1.ansiMaxLength)(...items.map(([i]) => i));
        const content = items
            .map(([label, value]) => {
            if (value === config.current) {
                return chalk_1.default.black.bgCyan((0, includes_1.ansiPadEnd)(label, longest));
            }
            return label;
        })
            .join(`\n`);
        return this.textRendering.pad(content);
    }
    next(config) {
        config.current ??= config.entries[utilities_1.START][utilities_1.VALUE];
        const index = config.entries.findIndex(([, value]) => config.current === value);
        if (index === config.entries.length - utilities_1.ARRAY_OFFSET) {
            config.current = config.entries[utilities_1.START][utilities_1.VALUE];
            return;
        }
        config.current = config.entries[index + utilities_1.INCREMENT][utilities_1.VALUE];
    }
    previous(config) {
        config.current ??= config.entries[utilities_1.START][utilities_1.VALUE];
        const index = config.entries.findIndex(([, value]) => config.current === value);
        if (index === utilities_1.START) {
            config.current =
                config.entries[config.entries.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE];
            return;
        }
        config.current = config.entries[index - utilities_1.INCREMENT][utilities_1.VALUE];
    }
};
DiscriminatorEditorService = __decorate([
    (0, decorators_1.Editor)({
        keyMap: new Map([
            [{ description: 'cancel', key: 'escape' }, ''],
            [{ description: 'up', key: 'up' }, ''],
            [{ description: 'down', key: 'down' }, ''],
        ]),
        type: 'discriminator',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _a : Object])
], DiscriminatorEditorService);
exports.DiscriminatorEditorService = DiscriminatorEditorService;


/***/ }),

/***/ "./libs/tty/src/services/editors/enum-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnumEditorService = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
let EnumEditorService = class EnumEditorService {
    textRendering;
    constructor(textRendering) {
        this.textRendering = textRendering;
    }
    onKeyPress(config, key) {
        switch (key) {
            case 'escape':
                return undefined;
            case 'up':
                this.previous(config);
                break;
            case 'down':
                this.next(config);
                break;
        }
        return config;
    }
    render(config) {
        config.current ??= config.entries[utilities_1.START][utilities_1.VALUE];
        const items = this.textRendering.selectRange(config.entries, config.current);
        const longest = (0, includes_1.ansiMaxLength)(...items.map(([i]) => i));
        const content = items
            .map(([label, value]) => {
            if (value === config.current) {
                return chalk_1.default.black.bgCyan((0, includes_1.ansiPadEnd)(label, longest));
            }
            return label;
        })
            .join(`\n`);
        return this.textRendering.pad(content);
    }
    next(config) {
        config.current ??= config.entries[utilities_1.START][utilities_1.VALUE];
        const index = config.entries.findIndex(([, value]) => config.current === value);
        if (index === config.entries.length - utilities_1.ARRAY_OFFSET) {
            config.current = config.entries[utilities_1.START][utilities_1.VALUE];
            return;
        }
        config.current = config.entries[index + utilities_1.INCREMENT][utilities_1.VALUE];
    }
    previous(config) {
        config.current ??= config.entries[utilities_1.START][utilities_1.VALUE];
        const index = config.entries.findIndex(([, value]) => config.current === value);
        if (index === utilities_1.START) {
            config.current =
                config.entries[config.entries.length - utilities_1.ARRAY_OFFSET][utilities_1.VALUE];
            return;
        }
        config.current = config.entries[index - utilities_1.INCREMENT][utilities_1.VALUE];
    }
};
EnumEditorService = __decorate([
    (0, decorators_1.Editor)({
        keyMap: new Map([
            [{ description: 'cancel', key: 'escape' }, ''],
            [{ description: 'up', key: 'up' }, ''],
            [{ description: 'down', key: 'down' }, ''],
        ]),
        type: 'enum',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _a : Object])
], EnumEditorService);
exports.EnumEditorService = EnumEditorService;


/***/ }),

/***/ "./libs/tty/src/services/editors/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/services/editors/boolean-editor.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/confirm.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/date-editor.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/discriminator-editor.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/enum-editor.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/number-editor.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/string-editor.service.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/services/editors/number-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NumberEditorService = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
const INTERNAL_PADDING = ' ';
let NumberEditorService = class NumberEditorService {
    textRendering;
    constructor(textRendering) {
        this.textRendering = textRendering;
    }
    onKeyPress(config, key) {
        const current = config.current.toString();
        if (key === '.' && current.includes('.')) {
            return;
        }
        if ([...'.1234567890'].includes(key)) {
            config.current = Number(current + key);
        }
        if (key === 'backspace' && !utilities_1.is.empty(current)) {
            config.current = Number(current.slice(utilities_1.START, utilities_1.INVERT_VALUE) || utilities_1.START);
        }
        if (key === 'up') {
            config.current++;
        }
        if (key === 'down') {
            config.current--;
        }
        return config;
    }
    render({ width, ...config }) {
        const out = [];
        const value = config.label
            ? config.current.toLocaleString()
            : config.current.toString();
        if (config.label) {
            out.push(chalk_1.default.bold.magenta.dim(config.label));
        }
        let color = 'bgWhite';
        if (utilities_1.is.number(config.max) && config.current > config.max) {
            color = 'bgRed';
        }
        const maxLength = width; //- this.leftPadding - this.leftPadding;
        out.push(chalk_1.default[color].black((0, includes_1.ansiPadEnd)(INTERNAL_PADDING + value, maxLength)));
        return this.textRendering.pad(out.join(`\n`));
    }
};
NumberEditorService = __decorate([
    (0, decorators_1.Editor)({
        keyMap: new Map([
            [{ description: 'cancel', key: 'tab' }, ''],
            [{ description: 'left', key: 'left' }, ''],
            [{ description: 'right', key: 'right' }, ''],
        ]),
        type: 'number',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _a : Object])
], NumberEditorService);
exports.NumberEditorService = NumberEditorService;


/***/ }),

/***/ "./libs/tty/src/services/editors/string-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StringEditorService = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const render_1 = __webpack_require__("./libs/tty/src/services/render/index.ts");
const DEFAULT_PLACEHOLDER = 'enter value';
const INTERNAL_PADDING = ' ';
const PADDING = 2;
let StringEditorService = class StringEditorService {
    textRendering;
    constructor(textRendering) {
        this.textRendering = textRendering;
    }
    onKeyPress(config, key, { shift }) {
        if (key === 'backspace') {
            config.current ??= '';
            config.current = config.current.slice(utilities_1.START, utilities_1.INVERT_VALUE);
            return config;
        }
        if (key === 'space') {
            config.current ??= '';
            config.current += ' ';
            return config;
        }
        if (key === 'tab') {
            return undefined;
        }
        if (key === 'escape') {
            config.current = '';
            return config;
        }
        if (key.length > utilities_1.SINGLE) {
            return config;
        }
        config.current ??= '';
        config.current += shift ? key.toUpperCase() : key;
        return config;
    }
    render(options) {
        if (utilities_1.is.empty(options.current)) {
            return this.renderBox(options, 'bgBlue');
        }
        return this.renderBox(options, 'bgWhite');
    }
    renderBox(config, bgColor) {
        const value = utilities_1.is.empty(config.current)
            ? config.placeholder ?? DEFAULT_PLACEHOLDER
            : config.current;
        const maxLength = config.width - PADDING;
        const out = [];
        if (config.label) {
            out.push(chalk_1.default.bold.magenta.dim(config.label));
        }
        out.push(chalk_1.default[bgColor].black((0, includes_1.ansiPadEnd)(INTERNAL_PADDING + value, maxLength)));
        return this.textRendering.pad(out.join(`\n`));
    }
};
StringEditorService = __decorate([
    (0, decorators_1.Editor)({
        keyMap: new Map([
            [{ description: 'cancel', key: 'tab' }, ''],
            [{ description: 'clear', key: 'escape' }, ''],
        ]),
        type: 'string',
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof render_1.TextRenderingService !== "undefined" && render_1.TextRenderingService) === "function" ? _a : Object])
], StringEditorService);
exports.StringEditorService = StringEditorService;


/***/ }),

/***/ "./libs/tty/src/services/explorers/component-explorer.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ComponentExplorerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
let ComponentExplorerService = class ComponentExplorerService {
    scanner;
    logger;
    constructor(scanner, logger) {
        this.scanner = scanner;
        this.logger = logger;
    }
    REGISTERED_EDITORS = new Map();
    findServiceByType(name) {
        let out;
        this.REGISTERED_EDITORS.forEach((service, settings) => {
            if (settings.type === name) {
                out = service;
            }
        });
        return out;
    }
    findSettingsBytype(type) {
        let out;
        this.REGISTERED_EDITORS.forEach((__, settings) => {
            if (settings.type === type) {
                out = settings;
            }
        });
        return out;
    }
    onModuleInit() {
        const providers = this.scanner.findWithSymbol(decorators_1.COMPONENT_CONFIG);
        providers.forEach((key, value) => {
            this.REGISTERED_EDITORS.set(key, value);
        });
    }
};
ComponentExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.ModuleScannerService !== "undefined" && boilerplate_1.ModuleScannerService) === "function" ? _a : Object, typeof (_b = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _b : Object])
], ComponentExplorerService);
exports.ComponentExplorerService = ComponentExplorerService;


/***/ }),

/***/ "./libs/tty/src/services/explorers/editor-explorer.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EditorExplorerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
let EditorExplorerService = class EditorExplorerService {
    scanner;
    logger;
    constructor(scanner, logger) {
        this.scanner = scanner;
        this.logger = logger;
    }
    REGISTERED_EDITORS = new Map();
    findServiceByType(name) {
        let out;
        this.REGISTERED_EDITORS.forEach((service, settings) => {
            if (settings.type === name) {
                out = service;
            }
        });
        return out;
    }
    findSettingsBytype(type) {
        let out;
        this.REGISTERED_EDITORS.forEach((__, settings) => {
            if (settings.type === type) {
                out = settings;
            }
        });
        return out;
    }
    onModuleInit() {
        const providers = this.scanner.findWithSymbol(decorators_1.EDITOR_CONFIG);
        providers.forEach((key, value) => this.REGISTERED_EDITORS.set(key, value));
    }
};
EditorExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.ModuleScannerService !== "undefined" && boilerplate_1.ModuleScannerService) === "function" ? _a : Object, typeof (_b = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _b : Object])
], EditorExplorerService);
exports.EditorExplorerService = EditorExplorerService;


/***/ }),

/***/ "./libs/tty/src/services/explorers/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/services/explorers/component-explorer.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/explorers/editor-explorer.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/explorers/repl-explorer.service.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/services/explorers/repl-explorer.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReplExplorerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
let ReplExplorerService = class ReplExplorerService {
    scanner;
    logger;
    constructor(scanner, logger) {
        this.scanner = scanner;
        this.logger = logger;
    }
    REGISTERED_APPS = new Map();
    findServiceByName(name) {
        let out;
        this.REGISTERED_APPS.forEach((service, settings) => {
            if (settings.name === name) {
                out = service;
            }
        });
        return out;
    }
    findSettingsByName(name) {
        let out;
        this.REGISTERED_APPS.forEach((service, settings) => {
            if (settings.name === name) {
                out = settings;
            }
        });
        return out;
    }
    onModuleInit() {
        const providers = this.scanner.findWithSymbol(contracts_1.REPL_CONFIG);
        providers.forEach((key, value) => this.REGISTERED_APPS.set(key, value));
    }
};
ReplExplorerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.ModuleScannerService !== "undefined" && boilerplate_1.ModuleScannerService) === "function" ? _a : Object, typeof (_b = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _b : Object])
], ReplExplorerService);
exports.ReplExplorerService = ReplExplorerService;


/***/ }),

/***/ "./libs/tty/src/services/git.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const execa_1 = __importDefault(__webpack_require__("execa"));
const ini_1 = __webpack_require__("ini");
let GitService = class GitService {
    async getBranchName() {
        const { stdout } = await (0, execa_1.default)(`git`, [
            `rev-parse`,
            `--abbrev-ref`,
            `HEAD`,
        ]);
        return stdout;
    }
    async getConfig() {
        const { stdout } = await (0, execa_1.default)(`git`, [`config`, `--list`]);
        return (0, ini_1.decode)(stdout);
    }
    /**
     * Is there any uncommitted changes?
     */
    async isDirty() {
        const { stdout } = await (0, execa_1.default)(`git`, [`status`, `--porcelain`]);
        return stdout.length > utilities_1.EMPTY;
    }
    /**
     * Grab all the commit messages between here and `origin/develop`
     *
     * This should also
     */
    async listCommitMessages(base = `origin/develop`, reference) {
        reference ??= await this.getBranchName();
        const { stdout } = await (0, execa_1.default)(`git`, [
            `rev-list`,
            `--oneline`,
            reference,
            `^${base}`,
        ]);
        const messages = stdout.split(`\n`).map(line => {
            const [, ...message] = line.split(' ');
            return message.join(' ');
        });
        return messages;
    }
};
GitService = __decorate([
    (0, common_1.Injectable)()
], GitService);
exports.GitService = GitService;


/***/ }),

/***/ "./libs/tty/src/services/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/services/colors.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/comparison-tools.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/components/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/config-builder.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/editors/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/explorers/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/git.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/main-cli.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/pinned-item.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/prompt.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/render/index.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/system.service.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/services/main-cli.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainCLIService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
const decorators_1 = __webpack_require__("./libs/tty/src/decorators/index.ts");
const explorers_1 = __webpack_require__("./libs/tty/src/services/explorers/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const pinned_item_service_1 = __webpack_require__("./libs/tty/src/services/pinned-item.service.ts");
const prompt_service_1 = __webpack_require__("./libs/tty/src/services/prompt.service.ts");
// Filter out non-sortable characters (like emoji)
const unsortable = new RegExp('[^A-Za-z0-9_ -]', 'g');
const CACHE_KEY = 'MAIN-CLI:LAST_LABEL';
let MainCLIService = class MainCLIService {
    applicationManager;
    explorer;
    promptService;
    pinnedItem;
    cacheService;
    applicationTitle;
    constructor(applicationManager, explorer, promptService, pinnedItem, cacheService, applicationTitle = 'Script List') {
        this.applicationManager = applicationManager;
        this.explorer = explorer;
        this.promptService = promptService;
        this.pinnedItem = pinnedItem;
        this.cacheService = cacheService;
        this.applicationTitle = applicationTitle;
    }
    last;
    async exec() {
        this.applicationManager.setHeader(this.applicationTitle);
        const name = await this.pickOne();
        if (!utilities_1.is.string(name)) {
            await this.pinnedItem.exec(name);
            return this.exec();
        }
        let instance;
        this.explorer.REGISTERED_APPS.forEach((i, options) => {
            if (options.name === name) {
                instance = i;
            }
        });
        await instance.exec();
        await this.exec();
    }
    async onModuleInit() {
        this.last = await this.cacheService.get(CACHE_KEY);
    }
    getLeft() {
        const entries = this.pinnedItem.getEntries();
        return entries.map(i => ({
            entry: i,
            type: i[utilities_1.VALUE].script,
        }));
    }
    getRight(types) {
        const right = [];
        Object.keys(types).forEach(type => {
            types[type]
                .sort((a, b) => {
                if (!Array.isArray(a) || !Array.isArray(b)) {
                    return utilities_1.DOWN;
                }
                const a1 = String(a[utilities_1.VALUE]).replace(unsortable, '');
                const b1 = String(b[utilities_1.VALUE]).replace(unsortable, '');
                if (a1 > b1) {
                    return utilities_1.UP;
                }
                return utilities_1.DOWN;
            })
                .forEach(i => {
                right.push({
                    entry: i,
                    type: type,
                });
            });
        });
        return right;
    }
    async pickOne() {
        const types = {};
        const keyMap = {};
        this.explorer.REGISTERED_APPS.forEach((instance, { category: type, name, icon, keybind, keyOnly }) => {
            if (name !== 'Main') {
                if (keybind) {
                    keyMap[keybind] = [`${icon ?? ''}${name}`, name];
                    if (keyOnly) {
                        return;
                    }
                }
                types[type] ??= [];
                types[type].push([`${icon ?? ''}${name}`, name]);
            }
        });
        const right = this.getRight(types);
        const left = this.getLeft();
        if (utilities_1.is.object(this.last) && this.last !== null) {
            this.last = left.find(i => {
                return (i.entry[utilities_1.VALUE].id ===
                    this.last.id);
            })?.entry[utilities_1.VALUE];
        }
        const result = await this.promptService.menu({
            keyMap,
            left,
            leftHeader: 'Pinned Items',
            right,
            titleTypes: true,
            value: this.last,
        });
        this.last = result;
        await this.cacheService.set(CACHE_KEY, result);
        return result;
    }
};
MainCLIService = __decorate([
    (0, decorators_1.Repl)({
        category: 'main',
        name: 'Main',
    }),
    __param(4, (0, boilerplate_1.InjectCache)()),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)(config_1.CONFIG_APPLICATION_TITLE)),
    __metadata("design:paramtypes", [typeof (_a = typeof meta_1.ApplicationManagerService !== "undefined" && meta_1.ApplicationManagerService) === "function" ? _a : Object, typeof (_b = typeof explorers_1.ReplExplorerService !== "undefined" && explorers_1.ReplExplorerService) === "function" ? _b : Object, typeof (_c = typeof prompt_service_1.PromptService !== "undefined" && prompt_service_1.PromptService) === "function" ? _c : Object, typeof (_d = typeof pinned_item_service_1.PinnedItemService !== "undefined" && pinned_item_service_1.PinnedItemService) === "function" ? _d : Object, typeof (_e = typeof boilerplate_1.CacheManagerService !== "undefined" && boilerplate_1.CacheManagerService) === "function" ? _e : Object, Object])
], MainCLIService);
exports.MainCLIService = MainCLIService;


/***/ }),

/***/ "./libs/tty/src/services/meta/application-manager.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApplicationManagerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const figlet_1 = __importStar(__webpack_require__("figlet"));
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const explorers_1 = __webpack_require__("./libs/tty/src/services/explorers/index.ts");
const screen_service_1 = __webpack_require__("./libs/tty/src/services/meta/screen.service.ts");
// ? Is there anything else that needs to be kept track of?
const LINE_PADDING = 2;
let ApplicationManagerService = class ApplicationManagerService {
    color;
    primaryFont;
    secondaryFont;
    componentExplorer;
    screenService;
    constructor(color, primaryFont, secondaryFont, componentExplorer, screenService) {
        this.color = color;
        this.primaryFont = primaryFont;
        this.secondaryFont = secondaryFont;
        this.componentExplorer = componentExplorer;
        this.screenService = screenService;
    }
    activeApplication;
    header = '';
    async activate(name, configuration = {}) {
        this.reset();
        return await new Promise(done => {
            const component = this.componentExplorer.findServiceByType(name);
            // There needs to be more type work around this
            // It's a disaster
            component.configure(configuration, value => {
                done(value);
            });
            this.activeApplication = component;
            component.render();
        });
    }
    headerLength() {
        return (0, includes_1.ansiMaxLength)(this.header) + LINE_PADDING;
    }
    load(item) {
        this.activeApplication = item;
    }
    render() {
        this.activeApplication.render();
    }
    save() {
        return this.activeApplication;
    }
    setHeader(primary, secondary = '') {
        this.screenService.clear();
        if (!utilities_1.is.empty(secondary)) {
            primary = figlet_1.default.textSync(primary, {
                font: this.primaryFont,
            });
            this.screenService.print(`\n` +
                chalk_1.default
                    .cyan(primary)
                    .split(`\n`)
                    .map(i => `  ${i}`)
                    .join(`\n`));
        }
        else {
            secondary = primary;
            primary = '';
        }
        if (utilities_1.is.empty(secondary)) {
            this.header = primary;
            return;
        }
        secondary = figlet_1.default.textSync(secondary, {
            font: this.secondaryFont,
        });
        secondary = chalk_1.default
            .magenta(secondary)
            .split(`\n`)
            .map(i => `  ${i}`)
            .join(`\n`);
        this.screenService.print(secondary);
        this.header = `${primary}\n${secondary}`;
    }
    reset() {
        this.activeApplication = undefined;
    }
};
ApplicationManagerService = __decorate([
    (0, common_1.Injectable)(),
    (0, contracts_1.ApplicationStackProvider)(),
    __param(0, (0, boilerplate_1.InjectConfig)(config_1.HEADER_COLOR)),
    __param(1, (0, boilerplate_1.InjectConfig)(config_1.DEFAULT_HEADER_FONT)),
    __param(2, (0, boilerplate_1.InjectConfig)(config_1.SECONDARY_HEADER_FONT)),
    __metadata("design:paramtypes", [String, typeof (_a = typeof figlet_1.Fonts !== "undefined" && figlet_1.Fonts) === "function" ? _a : Object, typeof (_b = typeof figlet_1.Fonts !== "undefined" && figlet_1.Fonts) === "function" ? _b : Object, typeof (_c = typeof explorers_1.ComponentExplorerService !== "undefined" && explorers_1.ComponentExplorerService) === "function" ? _c : Object, typeof (_d = typeof screen_service_1.ScreenService !== "undefined" && screen_service_1.ScreenService) === "function" ? _d : Object])
], ApplicationManagerService);
exports.ApplicationManagerService = ApplicationManagerService;


/***/ }),

/***/ "./libs/tty/src/services/meta/environment.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EnvironmentService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
let EnvironmentService = class EnvironmentService {
    getDimensions() {
        const [width, height] = process.stdout?.getWindowSize() || [utilities_1.EMPTY, utilities_1.EMPTY];
        return { height, width };
    }
};
EnvironmentService = __decorate([
    (0, common_1.Injectable)()
], EnvironmentService);
exports.EnvironmentService = EnvironmentService;


/***/ }),

/***/ "./libs/tty/src/services/meta/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/services/meta/application-manager.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/environment.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/keyboard-manager.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/layout-manager.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/screen.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/stack.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/meta/theme.service.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/services/meta/keyboard-manager.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeyboardManagerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const rxjs_1 = __webpack_require__("rxjs");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const application_manager_service_1 = __webpack_require__("./libs/tty/src/services/meta/application-manager.service.ts");
const screen_service_1 = __webpack_require__("./libs/tty/src/services/meta/screen.service.ts");
let KeyboardManagerService = class KeyboardManagerService {
    screenService;
    applicationManager;
    constructor(screenService, applicationManager) {
        this.screenService = screenService;
        this.applicationManager = applicationManager;
    }
    activeKeymaps = new Map();
    focus(target, map, value) {
        return new Promise(async (done) => {
            const currentMap = this.activeKeymaps;
            this.activeKeymaps = new Map([[target, map]]);
            const out = await value;
            this.activeKeymaps = currentMap;
            done(out);
        });
    }
    getCombinedKeyMap() {
        const map = new Map();
        this.activeKeymaps.forEach(sub => sub.forEach((a, b) => map.set(b, a)));
        return map;
    }
    load(item) {
        this.activeKeymaps = item;
    }
    save() {
        const current = this.activeKeymaps;
        this.activeKeymaps = new Map();
        return current;
    }
    setKeyMap(target, map) {
        this.activeKeymaps.set(target, map);
        map.forEach(key => {
            if (utilities_1.is.string(key) && !utilities_1.is.function(target[key])) {
                this.screenService.print(chalk_1.default.yellow
                    .inverse ` ${contracts_1.ICONS.WARNING}MISSING CALLBACK {bold ${key}} `);
            }
        });
    }
    wrap(callback) {
        return new Promise(async (done) => {
            const map = this.save();
            const result = await callback();
            this.load(map);
            done(result);
        });
    }
    onApplicationBootstrap() {
        const rl = this.screenService.rl;
        (0, rxjs_1.fromEvent)(rl.input, 'keypress', (value, key = {}) => ({ key, value }))
            .pipe((0, rxjs_1.takeUntil)((0, rxjs_1.fromEvent)(rl, 'close')))
            .forEach(this.keyPressHandler.bind(this));
    }
    // eslint-disable-next-line radar/cognitive-complexity
    async keyPressHandler(descriptor) {
        const { key } = descriptor;
        const { ctrl, meta, shift, name, sequence } = key ?? {};
        let mixed = name ?? sequence ?? 'enter';
        // Standardize the "done" key
        mixed = mixed === 'return' ? 'enter' : mixed;
        const catchAll = [];
        const direct = [];
        const modifiers = { ctrl, meta, shift };
        // Build list of callbacks based on key
        this.activeKeymaps.forEach((map, target) => {
            map.forEach((callback, options) => {
                if (utilities_1.is.undefined(options.key)) {
                    catchAll.push([target, callback]);
                    return;
                }
                const keys = Array.isArray(options.key) ? options.key : [options.key];
                if (!keys.includes(mixed)) {
                    return;
                }
                const allMatch = Object.entries(modifiers).every(([modifier, value]) => modifiers[modifier] === value);
                if (!allMatch) {
                    return;
                }
                direct.push([target, callback]);
            });
        });
        // If there are any that directly look for this combination, then only use those
        // Otherwise, use all the catchall callbacks
        const list = utilities_1.is.empty(direct) ? catchAll : direct;
        // Do not re-render if no listeners are present at all
        // This happens when the application releases control for inquirer to take over
        let render = !utilities_1.is.empty(list);
        await (0, utilities_1.each)(utilities_1.is.empty(direct) ? catchAll : direct, async ([target, key]) => {
            const result = await (utilities_1.is.string(key) ? target[key].bind(target) : key)(mixed, modifiers);
            if (result === false) {
                // This logic needs to be improved
                // If any single one of these returns false, then a render is stopped
                render = false;
            }
        });
        if (render) {
            this.applicationManager.render();
        }
    }
};
KeyboardManagerService = __decorate([
    (0, common_1.Injectable)(),
    (0, contracts_1.ApplicationStackProvider)(),
    __metadata("design:paramtypes", [typeof (_a = typeof screen_service_1.ScreenService !== "undefined" && screen_service_1.ScreenService) === "function" ? _a : Object, typeof (_b = typeof application_manager_service_1.ApplicationManagerService !== "undefined" && application_manager_service_1.ApplicationManagerService) === "function" ? _b : Object])
], KeyboardManagerService);
exports.KeyboardManagerService = KeyboardManagerService;


/***/ }),

/***/ "./libs/tty/src/services/meta/layout-manager.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LayoutManagerService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
let LayoutManagerService = class LayoutManagerService {
    stackHorizontal(boxes) {
        const out = boxes[utilities_1.START].render().split(`\n`);
        boxes.shift();
        boxes.forEach(item => {
            const lines = item.render().split(`\n`);
            const max = (0, includes_1.ansiMaxLength)(lines);
            out.forEach((i, index) => i + (0, includes_1.ansiPadEnd)(lines[index] ?? '', max));
        });
        return out.join(`\n`);
    }
};
LayoutManagerService = __decorate([
    (0, common_1.Injectable)()
], LayoutManagerService);
exports.LayoutManagerService = LayoutManagerService;


/***/ }),

/***/ "./libs/tty/src/services/meta/screen.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScreenService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const mute_stream_1 = __importDefault(__webpack_require__("mute-stream"));
const readline_1 = __webpack_require__("readline");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const layout_manager_service_1 = __webpack_require__("./libs/tty/src/services/meta/layout-manager.service.ts");
const lastLine = content => content.split('\n').pop();
const PADDING = 2;
const height = content => content.split('\n').length + PADDING;
const output = new mute_stream_1.default();
output.pipe(process.stdout);
let ScreenService = class ScreenService {
    layout;
    constructor(layout) {
        this.layout = layout;
    }
    rl = (0, readline_1.createInterface)({
        input: process.stdin,
        output,
        terminal: true,
    });
    height = utilities_1.EMPTY;
    clear() {
        this.height = utilities_1.EMPTY;
        this.rl.output.unmute();
        // Reset draw to top
        this.rl.output.write('\u001B[0f');
        // Clear screen
        this.rl.output.write('\u001B[2J');
        this.rl.output.mute();
    }
    cursorLeft(amount = utilities_1.SINGLE) {
        console.log(includes_1.ansiEscapes.cursorBackward(amount));
    }
    cursorRight(amount = utilities_1.SINGLE) {
        console.log(includes_1.ansiEscapes.cursorForward(amount));
    }
    done() {
        this.rl.setPrompt('');
        console.log('\n');
    }
    down(amount = utilities_1.SINGLE) {
        console.log(includes_1.ansiEscapes.cursorDown(amount));
    }
    eraseLine(amount = utilities_1.SINGLE) {
        console.log(includes_1.ansiEscapes.eraseLines(amount));
    }
    print(line = '') {
        console.log(line);
    }
    render(content, ...extra) {
        this.rl.output.unmute();
        console.log(includes_1.ansiEscapes.eraseLines(this.height));
        const promptLine = lastLine(content);
        const rawPromptLine = (0, includes_1.ansiStrip)(promptLine);
        const [width] = process.stdout.getWindowSize
            ? process.stdout.getWindowSize() || [utilities_1.EMPTY]
            : [utilities_1.EMPTY];
        content = this.breakLines(content, width);
        let bottomContent = utilities_1.is.empty(extra) ? `` : extra.join(`\n`);
        if (!utilities_1.is.empty(bottomContent)) {
            bottomContent = this.breakLines(bottomContent, width);
        }
        if (rawPromptLine.length % width === utilities_1.EMPTY) {
            content += '\n';
        }
        const fullContent = content + (bottomContent ? '\n' + bottomContent : '');
        console.log(fullContent);
        this.height = height(fullContent);
        // Muting prevents user interactions from presenting to the screen directly
        // Must rely on application rendering to display keypresses
        this.rl.output.mute();
    }
    up(amount = utilities_1.SINGLE) {
        console.log(includes_1.ansiEscapes.cursorUp(amount));
    }
    onModuleInit() {
        console.log(includes_1.ansiEscapes.cursorHide);
    }
    breakLines(content, width) {
        const regex = new RegExp(`(?:(?:\\033[[0-9;]*m)*.?){1,${width}}`, 'g');
        return content
            .split('\n')
            .flatMap(line => {
            const chunk = line.match(regex);
            chunk?.pop();
            return chunk || '';
        })
            .join('\n');
    }
    clean(extraLines) {
        if (extraLines > utilities_1.EMPTY) {
            this.down(extraLines);
        }
        this.eraseLine(this.height);
    }
};
ScreenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof layout_manager_service_1.LayoutManagerService !== "undefined" && layout_manager_service_1.LayoutManagerService) === "function" ? _a : Object])
], ScreenService);
exports.ScreenService = ScreenService;


/***/ }),

/***/ "./libs/tty/src/services/meta/stack.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StackService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
let StackService = class StackService {
    scanner;
    constructor(scanner) {
        this.scanner = scanner;
    }
    stack = [];
    load() {
        if (utilities_1.is.empty(this.stack)) {
            throw new common_1.InternalServerErrorException(`Empty stack`);
        }
        const item = this.stack.pop();
        item.forEach((item, provider) => provider.load(item));
    }
    save() {
        const providers = this.scanner.findWithSymbol(contracts_1.STACK_PROVIDER);
        const map = new Map();
        providers.forEach((_, provider) => map.set(provider, provider.save()));
        this.stack.push(map);
    }
    async wrap(value) {
        return new Promise(async (done) => {
            this.save();
            const out = await value();
            this.load();
            done(out);
        });
    }
};
StackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.ModuleScannerService !== "undefined" && boilerplate_1.ModuleScannerService) === "function" ? _a : Object])
], StackService);
exports.StackService = StackService;


/***/ }),

/***/ "./libs/tty/src/services/meta/theme.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ThemeService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const colors_service_1 = __webpack_require__("./libs/tty/src/services/colors.service.ts");
const BORDERS = 2;
let ThemeService = class ThemeService {
    borderActive;
    borderInactive;
    borderWarn;
    borderError;
    textImportant;
    textInfo;
    textHelp;
    menuBg;
    textDetails;
    colorService;
    constructor(borderActive, borderInactive, borderWarn, borderError, textImportant, textInfo, textHelp, menuBg, textDetails, colorService) {
        this.borderActive = borderActive;
        this.borderInactive = borderInactive;
        this.borderWarn = borderWarn;
        this.borderError = borderError;
        this.textImportant = textImportant;
        this.textInfo = textInfo;
        this.textHelp = textHelp;
        this.menuBg = menuBg;
        this.textDetails = textDetails;
        this.colorService = colorService;
    }
    get maxWidth() {
        const [width] = process.stdout?.getWindowSize() || [utilities_1.EMPTY];
        return width - BORDERS;
    }
    addBorder(content, type = 'inactive') {
        let color = '';
        switch (type) {
            case 'inactive':
                color = this.borderInactive;
                break;
            case 'active':
                color = this.borderActive;
                break;
            case 'error':
                color = this.borderError;
                break;
            case 'warn':
                color = this.borderWarn;
                break;
        }
        const lines = content.split(`\n`);
        const length = (0, includes_1.ansiMaxLength)(content);
        const top = contracts_1.TABLE_PARTS.top_left +
            (0, includes_1.ansiPadEnd)(chalk_1.default.inverse('[ Legend ]'), length, undefined, contracts_1.TABLE_PARTS.top) +
            contracts_1.TABLE_PARTS.top_right;
        const bottom = contracts_1.TABLE_PARTS.bottom_left +
            contracts_1.TABLE_PARTS.bottom.repeat(length) +
            contracts_1.TABLE_PARTS.bottom_right;
        return [
            chalk_1.default.hex(color)(top),
            ...lines.map(line => chalk_1.default.hex(color)(contracts_1.TABLE_PARTS.left) +
                line +
                chalk_1.default.hex(color)(contracts_1.TABLE_PARTS.right)),
            chalk_1.default.hex(color)(bottom),
        ].join(`\n`);
    }
    menuBar([primary, secondary], state) {
        const maxWidth = this.maxWidth;
        let isBright = this.colorService.isBright(this.textImportant);
        let header = chalk_1.default
            .bgHex(this.textImportant)
            .hex(isBright ? '000000' : 'FFFFFF')(primary);
        // header = chalk`{${this.textImportant}  ${primary} }{blue${
        // is.empty(secondary) ? '.bgGray' : '.bgMagenta'
        // } ${PlIcons.honeycomb}}`;
        if (secondary) {
            isBright = this.colorService.isBright(this.textDetails);
            header += chalk_1.default
                .bgHex(this.textDetails)
                .hex(isBright ? '000000' : 'FFFFFF')(secondary);
            // header += chalk`{bgMagenta.black  ${secondary} }{magenta.bgGray ${PlIcons.honeycomb}}`;
        }
        header = (0, includes_1.ansiPadEnd)(header, maxWidth, this.menuBg);
        return this.addBorder(header, state);
    }
};
ThemeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, boilerplate_1.InjectConfig)(config_1.BORDER_COLOR_ACTIVE)),
    __param(1, (0, boilerplate_1.InjectConfig)(config_1.BORDER_COLOR_INACTIVE)),
    __param(2, (0, boilerplate_1.InjectConfig)(config_1.BORDER_COLOR_WARN)),
    __param(3, (0, boilerplate_1.InjectConfig)(config_1.BORDER_COLOR_ERROR)),
    __param(4, (0, boilerplate_1.InjectConfig)(config_1.TEXT_IMPORTANT)),
    __param(5, (0, boilerplate_1.InjectConfig)(config_1.TEXT_INFO)),
    __param(6, (0, boilerplate_1.InjectConfig)(config_1.TEXT_HELP)),
    __param(7, (0, boilerplate_1.InjectConfig)(config_1.BACKGROUND_MENU)),
    __param(8, (0, boilerplate_1.InjectConfig)(config_1.TEXT_DETAILS)),
    __param(9, (0, common_1.Inject)((0, common_1.forwardRef)(() => colors_service_1.ColorsService))),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, typeof (_a = typeof colors_service_1.ColorsService !== "undefined" && colors_service_1.ColorsService) === "function" ? _a : Object])
], ThemeService);
exports.ThemeService = ThemeService;


/***/ }),

/***/ "./libs/tty/src/services/pinned-item.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PinnedItemService = exports.PinnedItemDTO = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
class PinnedItemDTO {
    data;
    friendlyName;
    id;
    script;
}
exports.PinnedItemDTO = PinnedItemDTO;
let PinnedItemService = class PinnedItemService {
    configService;
    pinned;
    constructor(configService, pinned) {
        this.configService = configService;
        this.pinned = pinned;
        this.pinned = pinned.map(item => utilities_1.is.string(item) ? JSON.parse(item) : item);
    }
    loaders = new Map();
    addPinned(item) {
        this.pinned.push(item);
        this.configService.set([config_1.LIB_TTY, config_1.PINNED_ITEMS], this.pinned, true);
    }
    async exec(item) {
        const callback = this.loaders.get(item.script);
        if (!callback) {
            throw new common_1.InternalServerErrorException();
        }
        await callback(item);
    }
    findPin(script, id) {
        return this.pinned.find(i => i.script === script && id === i.id);
    }
    getEntries(name) {
        if (!name) {
            return this.pinned.map(i => {
                return [i.friendlyName, i];
            });
        }
        return [];
    }
    isPinned(script, id) {
        return !utilities_1.is.undefined(this.findPin(script, id));
    }
    removePinned(item) {
        this.pinned = this.pinned.filter(i => i !== item);
        this.configService.set([config_1.LIB_TTY, config_1.PINNED_ITEMS], this.pinned, true);
    }
    toggle(item) {
        const found = this.pinned.find(({ id, script }) => id === item.id && script === item.script);
        if (!found) {
            this.addPinned(item);
            return;
        }
        this.removePinned(found);
    }
};
PinnedItemService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, boilerplate_1.InjectConfig)(config_1.PINNED_ITEMS)),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.AutoConfigService !== "undefined" && boilerplate_1.AutoConfigService) === "function" ? _a : Object, Array])
], PinnedItemService);
exports.PinnedItemService = PinnedItemService;


/***/ }),

/***/ "./libs/tty/src/services/prompt.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PromptService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const dayjs_1 = __importDefault(__webpack_require__("dayjs"));
const inquirer_1 = __importDefault(__webpack_require__("inquirer"));
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const name = `result`;
const NO = 0;
const OFF_BRIGHTNESS = 0;
const MIN_BRIGHTNESS = 1;
const MAX_BRIGHTNESS = 255;
const FROM_OFFSET = 1;
let PromptService = class PromptService {
    logger;
    pageSize;
    applicationManager;
    constructor(logger, pageSize, applicationManager) {
        this.logger = logger;
        this.pageSize = pageSize;
        this.applicationManager = applicationManager;
    }
    /**
     * Force a user interaction before continuing
     *
     * Good for giving the user time to read a message before a screen clear happens
     */
    async acknowledge() {
        await this.applicationManager.activate('acknowledge');
    }
    async boolean(message, defaultValue) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message,
                name,
                type: 'confirm',
            },
        ]);
        return result;
    }
    async brightness(current = MAX_BRIGHTNESS, message = 'Brightness') {
        const { result } = await inquirer_1.default.prompt([
            {
                default: current,
                message: `${message} (1-255)`,
                name,
                type: 'number',
                validate(input = OFF_BRIGHTNESS) {
                    return input >= MIN_BRIGHTNESS && input <= MAX_BRIGHTNESS;
                },
            },
        ]);
        return result;
    }
    /**
     * For solving ternary spread casting madness more easily
     *
     * More for helping code read top to bottom more easily than solving a problem
     */
    conditionalEntries(test, trueValue = [], falseValue = []) {
        if (test) {
            return trueValue;
        }
        return falseValue;
    }
    async confirm(prompt = `Are you sure?`, defaultValue = false) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message: prompt,
                name,
                type: 'confirm',
            },
        ]);
        return result;
    }
    async cron(value) {
        const { result } = await inquirer_1.default.prompt([
            {
                name,
                type: 'cron',
                value,
            },
        ]);
        return result;
    }
    async date(prompt = `Date value`, defaultValue = new Date()) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                format: {
                    hour: undefined,
                    minute: undefined,
                    month: 'short',
                },
                message: prompt,
                name,
                type: 'date',
            },
        ]);
        return result;
    }
    async dateRange(defaultOffset = FROM_OFFSET) {
        const from = await this.timestamp(`From date`, (0, dayjs_1.default)().subtract(defaultOffset, 'day').toDate());
        const to = await this.timestamp('End date');
        return { from, to };
    }
    async editor(message, defaultValue) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message,
                name,
                type: 'editor',
            },
        ]);
        return result.trim();
    }
    async expand(message, options, defaultValue) {
        if (utilities_1.is.empty(options)) {
            this.logger.warn(`No choices to pick from`);
            return undefined;
        }
        const { result } = await inquirer_1.default.prompt([
            {
                choices: options,
                default: defaultValue,
                message,
                name,
                pageSize: this.pageSize,
                type: 'expand',
            },
        ]);
        return result;
    }
    /**
     * Canned question, gets asked so often
     */
    async friendlyName(current) {
        return await this.string(`Friendly name`, current);
    }
    async insertPosition(choices, moveItem) {
        const { result } = await inquirer_1.default.prompt([
            {
                choices,
                message: 'Where add line?',
                moveValue: moveItem,
                name,
                type: 'selectLine',
            },
        ]);
        return result;
    }
    itemsFromEntries(items, extendedShort = false) {
        return items.map(item => {
            if (Array.isArray(item)) {
                const label = item[utilities_1.LABEL];
                return utilities_1.is.string(label)
                    ? {
                        // Adding emojies can sometimes cause the final character to have rendering issues
                        // Insert sacraficial empty space to the end
                        name: `${label} `,
                        short: `${label}${extendedShort ? ' ' : ''}`,
                        value: item[utilities_1.VALUE],
                    }
                    : {
                        ...label,
                        value: item[utilities_1.VALUE],
                    };
            }
            return item;
        });
    }
    async listBuild(options) {
        const result = await this.applicationManager.activate('list', options);
        return result;
    }
    async menu(options) {
        options.keyMap ??= {};
        const result = await this.applicationManager.activate('menu', options);
        return result;
    }
    async number(message = `Number value`, defaultValue, { prefix, suffix } = {}) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message,
                name,
                prefix,
                suffix,
                type: 'number',
            },
        ]);
        return result;
    }
    async objectBuilder(options) {
        const result = await this.applicationManager.activate('table', options);
        return result;
    }
    async password(message = `Password value`, defaultValue) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message,
                name,
                type: 'password',
            },
        ]);
        return result;
    }
    async pickMany(message = `Pick many`, options, { min, max, ...extra } = {}) {
        if (utilities_1.is.empty(options)) {
            this.logger.warn(`No choices to pick from`);
            return [];
        }
        const { result } = (await inquirer_1.default.prompt([
            {
                choices: this.itemsFromEntries(options),
                ...extra,
                message,
                name,
                pageSize: this.pageSize,
                type: 'checkbox',
            },
        ]));
        if (min && result.length < min) {
            this.logger.error(`${min} items are required, ${result.length} provided`);
            return await this.pickMany(message, options, { max, min, ...extra });
        }
        if (max && result.length > max) {
            this.logger.error(`limit ${max} items, ${result.length} provided`);
            return await this.pickMany(message, options, { max, min, ...extra });
        }
        return result;
    }
    async pickOne(message = `Pick one`, options, defaultValue) {
        if (utilities_1.is.empty(options)) {
            this.logger.warn(`No choices to pick from`);
            return undefined;
        }
        const { result } = await inquirer_1.default.prompt([
            {
                choices: this.itemsFromEntries(options, true),
                default: defaultValue,
                message,
                name,
                pageSize: this.pageSize,
                type: 'rawlist',
            },
        ]);
        return result;
    }
    sort(entries) {
        return entries.sort((a, b) => {
            if (!Array.isArray(a)) {
                return NO;
            }
            if (!Array.isArray(b)) {
                return NO;
            }
            return a[utilities_1.LABEL] > b[utilities_1.LABEL] ? utilities_1.UP : utilities_1.DOWN;
        });
    }
    async string(message = `String value`, defaultValue, { prefix, suffix } = {}) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message,
                name,
                prefix,
                suffix,
                type: 'input',
            },
        ]);
        return result;
    }
    async time(prompt = `Time value`, defaultValue = new Date()) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                format: {
                    day: undefined,
                    month: undefined,
                    year: undefined,
                },
                message: prompt,
                name,
                type: 'date',
            },
        ]);
        return result;
    }
    async timeout(prompt = 'Timeout duration') {
        const { result } = await inquirer_1.default.prompt([
            {
                // default: defaultValue,
                message: prompt,
                name,
                type: 'timeout',
            },
        ]);
        return result;
    }
    async timestamp(prompt = `Timestamp`, defaultValue = new Date()) {
        const { result } = await inquirer_1.default.prompt([
            {
                default: defaultValue,
                message: prompt,
                name,
                type: 'date',
            },
        ]);
        return result;
    }
};
PromptService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, boilerplate_1.InjectConfig)(config_1.PAGE_SIZE)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => meta_1.ApplicationManagerService))),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _a : Object, Number, typeof (_b = typeof meta_1.ApplicationManagerService !== "undefined" && meta_1.ApplicationManagerService) === "function" ? _b : Object])
], PromptService);
exports.PromptService = PromptService;


/***/ }),

/***/ "./libs/tty/src/services/render/box.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoxService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
let BoxService = class BoxService {
    /**
     * Hex
     */
    borderColor;
    /**
     * Internal box contents. Multiline string
     */
    content;
    /**
     * % of screen
     */
    height;
    /**
     * Border legend text
     */
    legend;
    /**
     * % of screen
     */
    width;
    /**
     * Render position cache
     */
    x;
    /**
     * Render position cache
     */
    y;
    render() {
        const maxWidth = (0, includes_1.ansiMaxLength)(this.content.split(`\n`));
        const header = (utilities_1.is.empty(this.legend)
            ? [
                contracts_1.TABLE_PARTS.top_left,
                this.legend,
                contracts_1.TABLE_PARTS.top.repeat(maxWidth - (0, includes_1.ansiMaxLength)(this.legend)),
                contracts_1.TABLE_PARTS.top_right,
            ]
            : [
                contracts_1.TABLE_PARTS.top_left,
                contracts_1.TABLE_PARTS.top.repeat(maxWidth),
                contracts_1.TABLE_PARTS.top_right,
            ]).join(``);
        const content = this.content
            .split(`\n`)
            .map(line => contracts_1.TABLE_PARTS.left + (0, includes_1.ansiPadEnd)(line, maxWidth) + contracts_1.TABLE_PARTS.right)
            .join(`\n`);
        const footer = [
            contracts_1.TABLE_PARTS.bottom_left,
            contracts_1.TABLE_PARTS.bottom.repeat(maxWidth),
            contracts_1.TABLE_PARTS.bottom_right,
        ].join(``);
        return [header, content, footer].join(`\n`);
    }
};
BoxService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.TRANSIENT })
], BoxService);
exports.BoxService = BoxService;


/***/ }),

/***/ "./libs/tty/src/services/render/charting.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/* eslint-disable @typescript-eslint/no-magic-numbers */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChartingService = exports.PlotOptions = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const environment_service_1 = __webpack_require__("./libs/tty/src/services/meta/environment.service.ts");
const GRAPH_SYMBOLS = {
    bar: '│',
    bl: '╮',
    br: '╭',
    cross: '┼',
    dash: '─',
    left_dash: '╴',
    right_dash: '╶',
    right_join: '┤',
    tl: '╯',
    tr: '╰',
};
const RATIO_MIN = 0;
const RATIO_MAX = 1;
const NEXT = 1;
const FRACTION_DIGITS = 2;
const LABELS = 1;
const DEFAULT_OFFSET = 3;
const QUARTERS = 4;
const DEFAULT_PADDING = '           ';
class PlotOptions {
    colors;
    format;
    height;
    offset;
    padding;
    width;
    xAxis;
}
exports.PlotOptions = PlotOptions;
const DEFAULT_FORMATTER = (x, padding) => {
    return (padding + x.toFixed(FRACTION_DIGITS)).slice(-padding.length);
};
let ChartingService = class ChartingService {
    environment;
    constructor(environment) {
        this.environment = environment;
    }
    /**
     * Draw a simple line chart. Only the y axis has labels currently
     *
     * Original code based off the asciichart library
     */
    // Too many variables to clealy refactor smaller
    // You should see the original function though...
    // eslint-disable-next-line radar/cognitive-complexity
    async plot(series, { offset = DEFAULT_OFFSET, padding = DEFAULT_PADDING, height, colors = [], format = DEFAULT_FORMATTER, width, xAxis, } = {}) {
        if (utilities_1.is.empty(series)) {
            return ``;
        }
        width ??= (await this.environment.getDimensions()).width;
        series = series.map(line => line.length < width ? line : this.evenSelection(line, width));
        const absMin = Math.min(...series.flat());
        const absMax = Math.max(...series.flat());
        const range = Math.abs(Math.round(absMax - absMin));
        height ??= range;
        const ratio = range !== RATIO_MIN ? height / range : RATIO_MAX;
        const min = Math.round(absMin * ratio);
        const max = Math.round(absMax * ratio);
        const rows = Math.abs(max - min);
        width = offset + Math.max(...series.map(i => i.length));
        // Rows and columns, labels and axis
        const graph = (0, utilities_1.PEAT)(rows + LABELS).map((i, index) => {
            const row = (0, utilities_1.PEAT)(width, ' ');
            const label = format(absMax - (index / rows) * range, padding);
            const labelIndex = Math.max(offset - label.length, utilities_1.EMPTY);
            row[labelIndex] = chalk_1.default.bgBlue.black(label);
            row[labelIndex + NEXT] = chalk_1.default.bgBlue.black(row[labelIndex + NEXT]);
            const axis = offset - utilities_1.ARRAY_OFFSET;
            row[axis] = chalk_1.default.bgBlue.black(index === utilities_1.START ? GRAPH_SYMBOLS.cross : GRAPH_SYMBOLS.right_join);
            return row;
        });
        // Data
        series.forEach((line, index) => {
            const currentColor = colors[index % colors.length];
            const y0 = Math.round(line[utilities_1.START] * ratio) - min;
            graph[rows - y0][offset - utilities_1.ARRAY_OFFSET] = chalk_1.default.bgBlue.black(this.color(GRAPH_SYMBOLS.cross, currentColor));
            line.forEach((value, x) => {
                if (!line[x + NEXT]) {
                    return;
                }
                const y0 = Math.round(value * ratio) - min;
                const y1 = Math.round(line[x + NEXT] * ratio) - min;
                if (y0 == y1) {
                    graph[rows - y0][x + offset] = this.color(GRAPH_SYMBOLS.dash, currentColor);
                    return;
                }
                graph[rows - y1][x + offset] = this.color(y0 > y1 ? GRAPH_SYMBOLS.tr : GRAPH_SYMBOLS.br, currentColor);
                graph[rows - y0][x + offset] = this.color(y0 > y1 ? GRAPH_SYMBOLS.bl : GRAPH_SYMBOLS.tl, currentColor);
                const from = Math.min(y0, y1);
                const to = Math.max(y0, y1);
                for (let y = from + utilities_1.ARRAY_OFFSET; y < to; y++) {
                    graph[rows - y][x + offset] = this.color(GRAPH_SYMBOLS.bar, currentColor);
                }
            });
        });
        const lines = graph.map(x => x.join(''));
        if (xAxis) {
            const longest = (0, includes_1.ansiMaxLength)(lines) - padding.length - 2;
            const headers = this.reduceHeaders(xAxis);
            const baseLength = headers.join(' ').length;
            const internalPad = ''.padEnd(Math.floor((longest - baseLength) / (headers.length * 2 - 2)), ' ');
            if (Math.floor(internalPad.length) > utilities_1.EMPTY) {
                lines.push(chalk_1.default.blue.bold(padding +
                    '   ' +
                    headers
                        .map((header, index) => {
                        if (index !== utilities_1.START) {
                            header = internalPad + header;
                        }
                        if (index !== lines.length - utilities_1.ARRAY_OFFSET) {
                            header += internalPad;
                        }
                        return header;
                    })
                        .join(' ')));
            }
        }
        return lines.join(`\n`);
    }
    color(symbol, color = 'white') {
        return (0, chalk_1.default) `{${color} ${symbol}}`;
    }
    evenSelection(items, n) {
        const elements = [items[utilities_1.START]];
        const offset = utilities_1.ARRAY_OFFSET - utilities_1.INCREMENT;
        const totalItems = items.length - offset;
        const interval = Math.floor(totalItems / (n - offset));
        for (let i = 1; i < n - utilities_1.ARRAY_OFFSET; i++) {
            elements.push(items[i * interval]);
        }
        elements.push(items[items.length - utilities_1.ARRAY_OFFSET]);
        return elements;
    }
    reduceHeaders(header) {
        return [
            header[utilities_1.START],
            header[Math.floor(header.length / QUARTERS)],
            header[Math.floor((header.length / QUARTERS) * 2)],
            header[Math.floor((header.length / QUARTERS) * 3)],
            header[header.length - utilities_1.ARRAY_OFFSET],
        ];
    }
};
ChartingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof environment_service_1.EnvironmentService !== "undefined" && environment_service_1.EnvironmentService) === "function" ? _a : Object])
], ChartingService);
exports.ChartingService = ChartingService;


/***/ }),

/***/ "./libs/tty/src/services/render/footer-editor.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FooterEditorService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const explorers_1 = __webpack_require__("./libs/tty/src/services/explorers/index.ts");
let FooterEditorService = class FooterEditorService {
    editorExplorer;
    constructor(editorExplorer) {
        this.editorExplorer = editorExplorer;
    }
    getKeyMap(type, element, current) {
        const item = this.editorExplorer.findServiceByType(type);
        if (item.customKeymap) {
            return item.customKeymap({ ...element, type }, current);
        }
        return this.editorExplorer.findSettingsBytype(type).keyMap;
    }
    initConfig(current, element) {
        return {
            current,
            label: element.name,
        };
    }
    lineColor(type, config) {
        const instance = this.editorExplorer.findServiceByType(type);
        if (utilities_1.is.undefined(instance.lineColor)) {
            return 'magenta.dim';
        }
        return instance.lineColor(config);
    }
    async onKeyPress(element, config, key, modifiers, type) {
        const instance = this.editorExplorer.findServiceByType(type);
        return await instance.onKeyPress({ ...config, ...element.extra }, key, modifiers);
    }
    render(element, config, width, type) {
        const instance = this.editorExplorer.findServiceByType(type);
        return instance.render({
            ...config,
            ...element.extra,
            width,
        });
    }
};
FooterEditorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof explorers_1.EditorExplorerService !== "undefined" && explorers_1.EditorExplorerService) === "function" ? _a : Object])
], FooterEditorService);
exports.FooterEditorService = FooterEditorService;


/***/ }),

/***/ "./libs/tty/src/services/render/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/tty/src/services/render/box.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/render/charting.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/render/footer-editor.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/render/keymap.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/render/table.service.ts"), exports);
__exportStar(__webpack_require__("./libs/tty/src/services/render/text-rendering.service.ts"), exports);


/***/ }),

/***/ "./libs/tty/src/services/render/keymap.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeymapService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const meta_1 = __webpack_require__("./libs/tty/src/services/meta/index.ts");
const text_rendering_service_1 = __webpack_require__("./libs/tty/src/services/render/text-rendering.service.ts");
const LINE_PADDING = 2;
let KeymapService = class KeymapService {
    textRendering;
    keyboardService;
    applicationManager;
    constructor(textRendering, keyboardService, applicationManager) {
        this.textRendering = textRendering;
        this.keyboardService = keyboardService;
        this.applicationManager = applicationManager;
    }
    keymapHelp({ message = '', prefix = new Map(), onlyHelp = false, } = {}) {
        const map = this.keyboardService.getCombinedKeyMap();
        const a = this.buildLines(prefix);
        const b = this.buildLines(map);
        const biggestLabel = (0, includes_1.ansiMaxLength)(a.map(i => i.label), b.map(i => i.label));
        const help = [...a, ...b]
            .map(item => (0, chalk_1.default) `{blue.dim > }${(0, includes_1.ansiPadEnd)(item.label, biggestLabel)}  ${item.description}`)
            .join(`\n`);
        if (onlyHelp) {
            return help;
        }
        const maxLength = (0, includes_1.ansiMaxLength)(help.split(`\n`), message.split(`\n`)) + LINE_PADDING;
        return [
            chalk_1.default.blue.dim('='.repeat(Math.max(maxLength, this.applicationManager.headerLength()))),
            ` `,
            this.textRendering.pad(help),
        ].join(`\n`);
    }
    buildLines(map) {
        return [...map.entries()]
            .filter(([{ noHelp, active }]) => {
            if (noHelp) {
                return false;
            }
            if (active) {
                return active();
            }
            return true;
        })
            .map(([config, target]) => {
            const active = Object.entries({ ...config.modifiers })
                .filter(([, state]) => state)
                .map(([name]) => name);
            const modifiers = utilities_1.is.empty(active) ? '' : active.join('/') + '-';
            const activate = config.catchAll
                ? chalk_1.default.yellow('default')
                : (Array.isArray(config.key)
                    ? config.key.map(i => modifiers + i)
                    : [modifiers + config.key])
                    .map(i => chalk_1.default.yellow.dim(i))
                    .join(chalk_1.default.gray(', '));
            return {
                description: chalk_1.default.gray(config.description ?? target),
                label: activate,
            };
        })
            .sort((a, b) => (a.label > b.label ? utilities_1.UP : utilities_1.DOWN));
    }
};
KeymapService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => meta_1.KeyboardManagerService))),
    __metadata("design:paramtypes", [typeof (_a = typeof text_rendering_service_1.TextRenderingService !== "undefined" && text_rendering_service_1.TextRenderingService) === "function" ? _a : Object, typeof (_b = typeof meta_1.KeyboardManagerService !== "undefined" && meta_1.KeyboardManagerService) === "function" ? _b : Object, typeof (_c = typeof meta_1.ApplicationManagerService !== "undefined" && meta_1.ApplicationManagerService) === "function" ? _c : Object])
], KeymapService);
exports.KeymapService = KeymapService;


/***/ }),

/***/ "./libs/tty/src/services/render/table.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TableService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const object_path_1 = __webpack_require__("object-path");
const contracts_1 = __webpack_require__("./libs/tty/src/contracts/index.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const environment_service_1 = __webpack_require__("./libs/tty/src/services/meta/environment.service.ts");
const text_rendering_service_1 = __webpack_require__("./libs/tty/src/services/render/text-rendering.service.ts");
const PADDING = 1;
const ROW_MULTIPLIER = 2;
const HEADER_LINE_COUNT = 4;
const MIN_CELL_WIDTH = ' undefined '.length;
let TableService = class TableService {
    environment;
    textRender;
    constructor(environment, textRender) {
        this.environment = environment;
        this.textRender = textRender;
    }
    activeOptions;
    columns;
    selectedCell;
    selectedRow;
    values;
    renderTable(options, renderRows, selectedRow = utilities_1.START, selectedCell = utilities_1.START) {
        this.selectedCell = selectedCell;
        this.selectedRow = selectedRow;
        this.activeOptions = options;
        this.values = renderRows;
        this.calcColumns();
        const header = this.header();
        const r = this.rows();
        if (utilities_1.is.empty(r)) {
            const [top, content] = header;
            return [top, content, this.footer()].join(`\n`);
        }
        const rows = r
            .join(`\n` +
            [
                contracts_1.TABLE_PARTS.left_mid,
                this.columns
                    .map(i => contracts_1.TABLE_PARTS.bottom.repeat(i.maxWidth))
                    .join(contracts_1.TABLE_PARTS.mid_mid),
                contracts_1.TABLE_PARTS.right_mid,
            ].join('') +
            `\n`)
            .split(`\n`);
        const footer = this.footer();
        const pre = [...header, ...rows, footer];
        return this.highlight(pre).join(`\n`);
    }
    calcColumns() {
        this.columns = this.activeOptions.elements.map(item => {
            return {
                maxWidth: Math.max(MIN_CELL_WIDTH, PADDING + item.name.length + PADDING, PADDING +
                    (0, includes_1.ansiMaxLength)(...this.values.map(row => {
                        const value = (0, object_path_1.get)(row, item.path);
                        if (item.format) {
                            return item.format(value);
                        }
                        return String(value);
                    })) +
                    PADDING),
                name: item.name,
            };
        });
    }
    footer() {
        return [
            contracts_1.TABLE_PARTS.bottom_left,
            this.columns
                .map(i => contracts_1.TABLE_PARTS.bottom.repeat(i.maxWidth))
                .join(contracts_1.TABLE_PARTS.bottom_mid),
            contracts_1.TABLE_PARTS.bottom_right,
        ].join('');
    }
    header() {
        return [
            [
                contracts_1.TABLE_PARTS.top_left,
                this.columns
                    .map(i => contracts_1.TABLE_PARTS.top.repeat(i.maxWidth))
                    .join(contracts_1.TABLE_PARTS.top_mid),
                contracts_1.TABLE_PARTS.top_right,
            ].join(``),
            [
                contracts_1.TABLE_PARTS.left,
                this.columns
                    .map(i => (0, chalk_1.default) `${' '.repeat(PADDING)}{bold.blue ${i.name.padEnd(i.maxWidth - PADDING, ' ')}}`)
                    .join(contracts_1.TABLE_PARTS.middle),
                contracts_1.TABLE_PARTS.right,
            ].join(''),
            [
                contracts_1.TABLE_PARTS.left_mid,
                this.columns
                    .map(i => contracts_1.TABLE_PARTS.mid.repeat(i.maxWidth))
                    .join(contracts_1.TABLE_PARTS.mid_mid),
                contracts_1.TABLE_PARTS.right_mid,
            ].join(''),
        ];
    }
    highlight(lines) {
        if (utilities_1.is.empty(this.values)) {
            return;
        }
        const bottom = HEADER_LINE_COUNT + this.selectedRow * ROW_MULTIPLIER;
        const middle = bottom - utilities_1.ARRAY_OFFSET;
        const top = middle - utilities_1.ARRAY_OFFSET;
        const list = this.columns
            .slice(utilities_1.START, this.selectedCell)
            .map(({ maxWidth }) => maxWidth);
        const start = utilities_1.is.empty(list)
            ? utilities_1.EMPTY
            : list.reduce((a, b) => a + b) + this.selectedCell;
        const end = start + this.columns[this.selectedCell].maxWidth + PADDING + PADDING;
        return lines.map((line, index) => {
            if (![middle, top, bottom].includes(index)) {
                return line;
            }
            if ([top, bottom].includes(index)) {
                return (line.slice(utilities_1.START, start) +
                    this.highlightChar(line.slice(start, end)) +
                    line.slice(end));
            }
            return line;
        });
    }
    highlightChar(char) {
        return chalk_1.default.bold.red(char);
    }
    rows() {
        const out = this.values.map((i, rowIndex) => {
            return [
                rowIndex === this.selectedRow && this.selectedCell === utilities_1.START
                    ? this.highlightChar(contracts_1.TABLE_PARTS.left)
                    : contracts_1.TABLE_PARTS.left,
                ...this.activeOptions.elements.map((element, colIndex) => {
                    const value = (0, object_path_1.get)(i, element.path);
                    const content = ' '.repeat(PADDING) +
                        this.textRender.typePrinter(element.format ? element.format(value) : value);
                    const cell = (0, includes_1.ansiPadEnd)(content, this.columns[colIndex].maxWidth);
                    const append = colIndex === this.columns.length - utilities_1.ARRAY_OFFSET
                        ? contracts_1.TABLE_PARTS.right
                        : contracts_1.TABLE_PARTS.middle;
                    return (cell +
                        (rowIndex === this.selectedRow &&
                            [colIndex, colIndex + utilities_1.INCREMENT].includes(this.selectedCell)
                            ? this.highlightChar(append)
                            : append));
                }),
            ].join('');
        });
        return out;
    }
};
TableService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof environment_service_1.EnvironmentService !== "undefined" && environment_service_1.EnvironmentService) === "function" ? _a : Object, typeof (_b = typeof text_rendering_service_1.TextRenderingService !== "undefined" && text_rendering_service_1.TextRenderingService) === "function" ? _b : Object])
], TableService);
exports.TableService = TableService;


/***/ }),

/***/ "./libs/tty/src/services/render/text-rendering.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextRenderingService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const fuzzysort_1 = __importDefault(__webpack_require__("fuzzysort"));
const config_1 = __webpack_require__("./libs/tty/src/config.ts");
const includes_1 = __webpack_require__("./libs/tty/src/includes/index.ts");
const TEMP_TEMPLATE_SIZE = 3;
const MAX_SEARCH_SIZE = 50;
const SEPARATOR = chalk_1.default.blue.dim('|');
const BUFFER_SIZE = 3;
const MIN_SIZE = 2;
const DEFAULT_WIDTH = 80;
//
const MAX_STRING_LENGTH = 300;
/**
 * Common utils for inqurirer prompt rendering
 *
 * Broken out into a nest service to allow access to configuration / other services
 */
let TextRenderingService = class TextRenderingService {
    pageSize;
    constructor(pageSize) {
        this.pageSize = pageSize;
    }
    appendHelp(message, base, app = []) {
        const longestLine = Math.max(...message.split(`\n`).map(i => (0, includes_1.ansiStrip)(i).length));
        const list = [...base, ...app];
        const max = this.biggestLabel(list);
        return [
            message,
            ...(longestLine < MIN_SIZE
                ? []
                : [chalk_1.default.blue.dim ` ${'='.repeat(longestLine)}`]),
            ` `,
            ...list
                .sort(([a], [b]) => {
                if (a.length < b.length) {
                    return utilities_1.UP;
                }
                if (b.length < a.length) {
                    return utilities_1.DOWN;
                }
                return a > b ? utilities_1.UP : utilities_1.DOWN;
            })
                .map(i => {
                return (0, chalk_1.default) ` {blue.dim -} {yellow.dim ${i[utilities_1.LABEL].padEnd(max, ' ').replaceAll(',', chalk_1.default.whiteBright `, `)}}  {gray ${i[utilities_1.VALUE]
                // Leave space at end for rendering reasons
                } }`;
            }),
        ].join(`\n`);
    }
    assemble(leftEntries, rightEntries, { left, right, search, } = {}) {
        const out = [...leftEntries];
        left = left ? ' ' + left : left;
        const maxA = (0, includes_1.ansiMaxLength)(...leftEntries, left) + utilities_1.ARRAY_OFFSET;
        const maxB = (0, includes_1.ansiMaxLength)(...rightEntries, right);
        rightEntries.forEach((item, index) => {
            const current = (0, includes_1.ansiPadEnd)(out[index] ?? '', maxA);
            item = (0, includes_1.ansiPadEnd)(item, maxB);
            out[index] = (0, chalk_1.default) `${current}${SEPARATOR}${item}`;
        });
        if (leftEntries.length > rightEntries.length) {
            out.forEach((line, index) => (out[index] =
                index < rightEntries.length
                    ? line
                    : (0, includes_1.ansiPadEnd)(line, maxA) + SEPARATOR));
        }
        if (!utilities_1.is.empty(left)) {
            out.unshift((0, chalk_1.default) `{blue.bold ${left.padStart(maxA - utilities_1.ARRAY_OFFSET, ' ')}} {blue.dim |} {blue.bold ${right.padEnd(maxB, ' ')}}`);
        }
        if (utilities_1.is.string(search)) {
            out.unshift(...this.searchBox(search));
        }
        return out;
    }
    biggestLabel(entries) {
        return Math.max(...entries.map(i => i[utilities_1.LABEL].length));
    }
    fuzzySort(searchText, data) {
        if (utilities_1.is.empty(searchText)) {
            return data;
        }
        const entries = data.map(i => ({
            label: i[utilities_1.LABEL],
            value: i[utilities_1.VALUE],
        }));
        const fuzzyResult = fuzzysort_1.default.go(searchText, entries, { key: 'label' });
        const highlighted = fuzzyResult.map(result => {
            const { target } = result;
            const item = data.find(option => {
                return utilities_1.is.string(option) ? option === target : option[utilities_1.LABEL] === target;
            });
            return [this.highlight(result), item[utilities_1.VALUE]];
        });
        return highlighted;
    }
    getWidth() {
        if (process.stdout.getWindowSize) {
            return process.stdout.getWindowSize()[utilities_1.START] || DEFAULT_WIDTH;
        }
        if (process.stdout.columns) {
            return process.stdout.columns;
        }
        return DEFAULT_WIDTH;
    }
    pad(message, amount = MIN_SIZE) {
        return message
            .split(`\n`)
            .map(i => `${' '.repeat(amount)}${i}`)
            .join(`\n`);
    }
    searchBox(searchText, size = MAX_SEARCH_SIZE) {
        const text = utilities_1.is.empty(searchText)
            ? chalk_1.default.bgBlue `Type to filter`
            : searchText;
        return [
            (0, chalk_1.default) ` `,
            ' ' +
                chalk_1.default[utilities_1.is.empty(searchText) ? 'bgBlue' : 'bgWhite'].black ` ${(0, includes_1.ansiPadEnd)(text, size)} `,
            ` `,
        ];
    }
    selectRange(entries, value) {
        if (entries.length <= this.pageSize) {
            return entries;
        }
        const index = entries.findIndex(i => i[utilities_1.VALUE] === value);
        if (index <= BUFFER_SIZE) {
            return entries.slice(utilities_1.START, this.pageSize);
        }
        if (index >= entries.length - this.pageSize + BUFFER_SIZE) {
            return entries.slice(entries.length - this.pageSize);
        }
        return entries.slice(index - BUFFER_SIZE, this.pageSize + index - BUFFER_SIZE);
    }
    typePrinter(item) {
        if (utilities_1.is.undefined(item)) {
            return chalk_1.default.gray(`undefined`);
        }
        if (utilities_1.is.date(item)) {
            return chalk_1.default.green(item.toLocaleString());
        }
        if (utilities_1.is.number(item)) {
            return chalk_1.default.yellow(String(item));
        }
        if (utilities_1.is.boolean(item)) {
            return chalk_1.default.magenta(String(item));
        }
        if (utilities_1.is.string(item)) {
            return chalk_1.default.blue(item.slice(utilities_1.START, MAX_STRING_LENGTH) +
                (item.length > MAX_STRING_LENGTH ? chalk_1.default.blueBright `...` : ``));
        }
        if (Array.isArray(item)) {
            return item.map(i => this.typePrinter(i)).join(`, `);
        }
        if (item === null) {
            return chalk_1.default.gray(`null`);
        }
        if (utilities_1.is.object(item)) {
            return Object.keys(item)
                .sort((a, b) => (a > b ? utilities_1.UP : utilities_1.DOWN))
                .map(key => (0, chalk_1.default) `{bold ${(0, utilities_1.TitleCase)(key)}:} ${this.typePrinter(item[key])}`)
                .join(`\n`);
        }
        return chalk_1.default.gray(JSON.stringify(item));
    }
    highlight(result) {
        const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
        const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
        let highlighted = '';
        let matchesIndex = 0;
        let opened = false;
        const { target, indexes } = result;
        for (let i = utilities_1.START; i < target.length; i++) {
            const char = target[i];
            if (indexes[matchesIndex] === i) {
                matchesIndex++;
                if (!opened) {
                    opened = true;
                    highlighted += open;
                }
                if (matchesIndex === indexes.length) {
                    highlighted += char + close + target.slice(i + utilities_1.INCREMENT);
                    break;
                }
                highlighted += char;
                continue;
            }
            if (opened) {
                opened = false;
                highlighted += close;
            }
            highlighted += char;
        }
        return highlighted.replace(new RegExp(`${open}(.*?)${close}`, 'g'), i => chalk_1.default.bgBlueBright.black `${i.slice(TEMP_TEMPLATE_SIZE, TEMP_TEMPLATE_SIZE * utilities_1.INVERT_VALUE)}`);
    }
};
TextRenderingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, boilerplate_1.InjectConfig)(config_1.PAGE_SIZE)),
    __metadata("design:paramtypes", [Number])
], TextRenderingService);
exports.TextRenderingService = TextRenderingService;


/***/ }),

/***/ "./libs/tty/src/services/system.service.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SystemService = void 0;
const common_1 = __webpack_require__("@nestjs/common");
const boilerplate_1 = __webpack_require__("./libs/boilerplate/src/index.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/index.ts");
const async_1 = __webpack_require__("async");
const chalk_1 = __importDefault(__webpack_require__("chalk"));
const comment_json_1 = __importDefault(__webpack_require__("comment-json"));
const execa_1 = __importDefault(__webpack_require__("execa"));
const fs_1 = __webpack_require__("fs");
const ini_1 = __webpack_require__("ini");
const inquirer_1 = __importDefault(__webpack_require__("inquirer"));
const os_1 = __webpack_require__("os");
const path_1 = __webpack_require__("path");
const process_1 = __webpack_require__("process");
const semver_1 = __webpack_require__("semver");
const prompt_service_1 = __webpack_require__("./libs/tty/src/services/prompt.service.ts");
/**
 * Class for working with the host operating system,
 * and performing operations against the workspace
 */
let SystemService = class SystemService {
    logger;
    promptService;
    workspace;
    constructor(logger, promptService, workspace) {
        this.logger = logger;
        this.promptService = promptService;
        this.workspace = workspace;
    }
    get projects() {
        return [];
        // return this.workspace.workspace.projects;
    }
    async bumpApplications(list) {
        await (0, async_1.eachSeries)(list.filter(item => this.projects[item].projectType === 'application'), async (application, callback) => {
            const { version } = this.workspace.PACKAGES.get(application);
            const { action } = await inquirer_1.default.prompt([
                {
                    choices: [
                        {
                            key: 'm',
                            name: 'Minor',
                            value: 'minor',
                        },
                        {
                            key: 'p',
                            name: 'Patch',
                            value: 'patch',
                        },
                        {
                            key: 'r',
                            name: 'Release Candidate',
                            value: 'rc',
                        },
                    ],
                    message: application,
                    name: 'action',
                    suffix: `@${version}`,
                    type: 'expand',
                },
            ]);
            const updated = action === 'rc'
                ? (0, semver_1.inc)(version, 'prerelease', 'rc')
                : (0, semver_1.inc)(version, action);
            console.log(chalk_1.default.blueBright(application), version, chalk_1.default.green(`=>`), updated);
            this.packageWriteVersion(application, updated);
            callback();
        });
    }
    bumpLibraries(list) {
        list
            .filter(item => this.projects[item].projectType === 'library')
            .forEach(value => {
            const data = this.workspace.PACKAGES.get(value);
            const currentVersion = data.version;
            data.version = (0, semver_1.inc)(data.version, 'patch');
            this.packageWriteVersion(value, data.version);
            console.log((0, chalk_1.default) `{yellow library} ${value} ${currentVersion} {green =>} ${data.version}`);
        });
    }
    bumpRootPackageVersion() {
        const rootPackage = comment_json_1.default.parse((0, fs_1.readFileSync)(boilerplate_1.PACKAGE_FILE, 'utf8'));
        const current = rootPackage.version;
        rootPackage.version = (0, semver_1.inc)(rootPackage.version, 'patch');
        (0, fs_1.writeFileSync)(boilerplate_1.PACKAGE_FILE, comment_json_1.default.stringify(rootPackage, undefined, '  '));
        console.log(chalk_1.default.magenta('root'), current, chalk_1.default.green(`=>`), rootPackage.version);
        return rootPackage.version;
    }
    configPath(application) {
        return (0, path_1.join)((0, os_1.homedir)(), '.config', application);
    }
    async getAffected() {
        const { stdout } = await (0, execa_1.default)('npx', ['nx', 'print-affected']);
        return comment_json_1.default.parse(stdout);
    }
    async getBranchName() {
        const { stdout } = await (0, execa_1.default)('git', [
            'rev-parse',
            '--abbrev-ref',
            'HEAD',
        ]);
        return stdout;
    }
    async getCommitMessages(branch) {
        const { stdout } = await (0, execa_1.default)('git', [
            'log',
            '--walk-reflogs',
            '--format=%B',
            branch.trim(),
        ]);
        return utilities_1.is.unique(stdout.split(`\n`).filter(item => !utilities_1.is.empty(item)));
    }
    isLibrary(project) {
        return this.projects[project].projectType === 'library';
    }
    /**
     * inquirer will default to vim when displaying an editor
     *
     * Ask the user if they wish to change the default if one is not set
     */
    async verifyEditor() {
        if (process.env.EDITOR || process.env.VISUAL) {
            // Something is already set!
            return;
        }
        this.logger.warn('No default editor set');
        const { editor } = await inquirer_1.default.prompt([
            {
                choices: ['default', 'vim', 'vi', 'nano'],
                message: ``,
                name: 'editor',
                type: 'list',
            },
        ]);
        if (editor === 'default') {
            return;
        }
        // const { stdout } = await execa(`which`, [editor]);
        process.env.EDITOR = editor;
        const { exportDestination } = await inquirer_1.default.prompt([
            {
                choices: ['~/.bashrc', '~/.zshrc', 'none'],
                message: `Export default editor to`,
                name: 'exportDestination',
                type: 'list',
            },
        ]);
        if (exportDestination === 'none') {
            return;
        }
        (0, fs_1.appendFileSync)((0, path_1.resolve)(exportDestination), `\nexport EDITOR=${editor}\n`);
    }
    async writeConfig(application, config) {
        const file = this.configPath(application);
        console.log(chalk_1.default.green('path'), file);
        if ((0, fs_1.existsSync)(file) &&
            (await this.promptService.confirm('Overwrite existing config file?')) ===
                false) {
            return;
        }
        (0, fs_1.writeFileSync)(file, (0, ini_1.encode)(config));
        console.log(chalk_1.default.inverse(chalk_1.default.green(`${file} written`)));
    }
    packageWriteVersion(project, version) {
        const packageFile = (0, path_1.join)((0, process_1.cwd)(), this.projects[project].root, boilerplate_1.PACKAGE_FILE);
        const data = this.workspace.PACKAGES.get(project);
        data.version = version;
        this.workspace.PACKAGES.set(project, data);
        (0, fs_1.writeFileSync)(packageFile, comment_json_1.default.stringify(data, undefined, '  '));
    }
};
SystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof boilerplate_1.AutoLogService !== "undefined" && boilerplate_1.AutoLogService) === "function" ? _a : Object, typeof (_b = typeof prompt_service_1.PromptService !== "undefined" && prompt_service_1.PromptService) === "function" ? _b : Object, typeof (_c = typeof boilerplate_1.WorkspaceService !== "undefined" && boilerplate_1.WorkspaceService) === "function" ? _c : Object])
], SystemService);
exports.SystemService = SystemService;


/***/ }),

/***/ "./libs/utilities/src/async.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.eachLimit = exports.eachSeries = exports.each = void 0;
const is_1 = __webpack_require__("./libs/utilities/src/is.ts");
const utilities_1 = __webpack_require__("./libs/utilities/src/utilities.ts");
// ? Functions written to be similar to the offerings from the async library
// That library gave me oddly inconsistent results,
//     so these exist to replace those doing exactly what I expect
//
async function each(item = [], callback) {
    await Promise.all(item.map(async (i) => await callback(i)));
}
exports.each = each;
async function eachSeries(item, callback) {
    if (!Array.isArray(item)) {
        throw new TypeError(`Not provided an array`);
    }
    for (let i = utilities_1.START; i <= item.length - utilities_1.ARRAY_OFFSET; i++) {
        await callback(item[i]);
    }
}
exports.eachSeries = eachSeries;
/**
 * If making network calls, make sure Bottleneck isn't a better fit for the situation
 */
async function eachLimit(items, callback, limit = Number.POSITIVE_INFINITY) {
    if (is_1.is.empty(items)) {
        return;
    }
    await new Promise(async (done) => {
        let processing = utilities_1.START;
        const pending = new Set(items);
        limit = Math.max(utilities_1.SINGLE, Math.min(limit, items.length));
        const run = async () => {
            if (is_1.is.empty(pending)) {
                processing--;
                if (processing === utilities_1.START) {
                    done();
                }
                return;
            }
            const item = [...pending.values()].pop();
            pending.delete(item);
            await callback(item);
        };
        for (let i = utilities_1.START; i < limit; i++) {
            processing++;
            await run();
        }
    });
}
exports.eachLimit = eachLimit;


/***/ }),

/***/ "./libs/utilities/src/cron.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.INTERVAL_SCHEDULE = exports.CRON_SCHEDULE = exports.CronExpression = void 0;
var CronExpression;
(function (CronExpression) {
    CronExpression["EVERY_SECOND"] = "* * * * * *";
    CronExpression["EVERY_5_SECONDS"] = "*/5 * * * * *";
    CronExpression["EVERY_10_SECONDS"] = "*/10 * * * * *";
    CronExpression["EVERY_30_SECONDS"] = "*/30 * * * * *";
    CronExpression["EVERY_MINUTE"] = "*/1 * * * *";
    CronExpression["EVERY_5_MINUTES"] = "0 */5 * * * *";
    CronExpression["EVERY_10_MINUTES"] = "0 */10 * * * *";
    CronExpression["EVERY_30_MINUTES"] = "0 */30 * * * *";
    CronExpression["EVERY_HOUR"] = "0 0-23/1 * * *";
    CronExpression["EVERY_2_HOURS"] = "0 0-23/2 * * *";
    CronExpression["EVERY_3_HOURS"] = "0 0-23/3 * * *";
    CronExpression["EVERY_4_HOURS"] = "0 0-23/4 * * *";
    CronExpression["EVERY_5_HOURS"] = "0 0-23/5 * * *";
    CronExpression["EVERY_6_HOURS"] = "0 0-23/6 * * *";
    CronExpression["EVERY_7_HOURS"] = "0 0-23/7 * * *";
    CronExpression["EVERY_8_HOURS"] = "0 0-23/8 * * *";
    CronExpression["EVERY_9_HOURS"] = "0 0-23/9 * * *";
    CronExpression["EVERY_10_HOURS"] = "0 0-23/10 * * *";
    CronExpression["EVERY_11_HOURS"] = "0 0-23/11 * * *";
    CronExpression["EVERY_12_HOURS"] = "0 0-23/12 * * *";
    CronExpression["EVERY_DAY_AT_1AM"] = "0 01 * * *";
    CronExpression["EVERY_DAY_AT_2AM"] = "0 02 * * *";
    CronExpression["EVERY_DAY_AT_3AM"] = "0 03 * * *";
    CronExpression["EVERY_DAY_AT_4AM"] = "0 04 * * *";
    CronExpression["EVERY_DAY_AT_5AM"] = "0 05 * * *";
    CronExpression["EVERY_DAY_AT_6AM"] = "0 06 * * *";
    CronExpression["EVERY_DAY_AT_7AM"] = "0 07 * * *";
    CronExpression["EVERY_DAY_AT_8AM"] = "0 08 * * *";
    CronExpression["EVERY_DAY_AT_9AM"] = "0 09 * * *";
    CronExpression["EVERY_DAY_AT_10AM"] = "0 10 * * *";
    CronExpression["EVERY_DAY_AT_11AM"] = "0 11 * * *";
    CronExpression["EVERY_DAY_AT_NOON"] = "0 12 * * *";
    CronExpression["EVERY_DAY_AT_1PM"] = "0 13 * * *";
    CronExpression["EVERY_DAY_AT_2PM"] = "0 14 * * *";
    CronExpression["EVERY_DAY_AT_3PM"] = "0 15 * * *";
    CronExpression["EVERY_DAY_AT_4PM"] = "0 16 * * *";
    CronExpression["EVERY_DAY_AT_5PM"] = "0 17 * * *";
    CronExpression["EVERY_DAY_AT_6PM"] = "0 18 * * *";
    CronExpression["EVERY_DAY_AT_7PM"] = "0 19 * * *";
    CronExpression["EVERY_DAY_AT_8PM"] = "0 20 * * *";
    CronExpression["EVERY_DAY_AT_9PM"] = "0 21 * * *";
    CronExpression["EVERY_DAY_AT_10PM"] = "0 22 * * *";
    CronExpression["EVERY_DAY_AT_11PM"] = "0 23 * * *";
    CronExpression["EVERY_DAY_AT_MIDNIGHT"] = "0 0 * * *";
    CronExpression["EVERY_WEEK"] = "0 0 * * 0";
    CronExpression["EVERY_WEEKDAY"] = "0 0 * * 1-5";
    CronExpression["EVERY_WEEKEND"] = "0 0 * * 6,0";
    CronExpression["EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT"] = "0 0 1 * *";
    CronExpression["EVERY_1ST_DAY_OF_MONTH_AT_NOON"] = "0 12 1 * *";
    CronExpression["EVERY_2ND_HOUR"] = "0 */2 * * *";
    CronExpression["EVERY_2ND_HOUR_FROM_1AM_THROUGH_11PM"] = "0 1-23/2 * * *";
    CronExpression["EVERY_2ND_MONTH"] = "0 0 1 */2 *";
    CronExpression["EVERY_QUARTER"] = "0 0 1 */3 *";
    CronExpression["EVERY_6_MONTHS"] = "0 0 1 */6 *";
    CronExpression["EVERY_YEAR"] = "0 0 1 1 *";
    CronExpression["EVERY_30_MINUTES_BETWEEN_9AM_AND_5PM"] = "0 */30 9-17 * * *";
    CronExpression["EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM"] = "0 */30 9-18 * * *";
    CronExpression["EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM"] = "0 */30 10-19 * * *";
    CronExpression["MONDAY_TO_FRIDAY_AT_1AM"] = "0 0 01 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_2AM"] = "0 0 02 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_3AM"] = "0 0 03 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_4AM"] = "0 0 04 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_5AM"] = "0 0 05 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_6AM"] = "0 0 06 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_7AM"] = "0 0 07 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_8AM"] = "0 0 08 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_9AM"] = "0 0 09 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_09_30AM"] = "0 30 09 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_10AM"] = "0 0 10 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_11AM"] = "0 0 11 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_11_30AM"] = "0 30 11 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_12PM"] = "0 0 12 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_1PM"] = "0 0 13 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_2PM"] = "0 0 14 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_3PM"] = "0 0 15 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_4PM"] = "0 0 16 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_5PM"] = "0 0 17 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_6PM"] = "0 0 18 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_7PM"] = "0 0 19 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_8PM"] = "0 0 20 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_9PM"] = "0 0 21 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_10PM"] = "0 0 22 * * 1-5";
    CronExpression["MONDAY_TO_FRIDAY_AT_11PM"] = "0 0 23 * * 1-5";
})(CronExpression = exports.CronExpression || (exports.CronExpression = {}));
exports.CRON_SCHEDULE = Symbol('CRON_SCHEDULE');
exports.INTERVAL_SCHEDULE = Symbol('INTERVAL_SCHEDULE');


/***/ }),

/***/ "./libs/utilities/src/extend.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deepExtend = void 0;
const is_1 = __webpack_require__("./libs/utilities/src/is.ts");
function isSpecificValue(value) {
    return (value instanceof Buffer || value instanceof Date || value instanceof RegExp);
}
function cloneSpecificValue(value) {
    if (value instanceof Buffer) {
        const x = Buffer.alloc(value.length);
        value.copy(x);
        return x;
    }
    if (value instanceof Date) {
        return new Date(value.getTime());
    }
    if (value instanceof RegExp) {
        return new RegExp(value);
    }
    throw new TypeError('Unexpected situation');
}
function deepCloneArray(array) {
    return array.map(item => {
        if (is_1.is.object(item)) {
            if (Array.isArray(item)) {
                return deepCloneArray(item);
            }
            if (isSpecificValue(item)) {
                return cloneSpecificValue(item);
            }
            return deepExtend({}, item);
        }
        return item;
    });
}
function safeGetProperty(object, key) {
    return key === '__proto__'
        ? undefined
        : object[key];
}
function deepExtend(target, object) {
    if (typeof object !== 'object' || object === null || Array.isArray(object)) {
        return target;
    }
    Object.keys(object).forEach(key => {
        const source = safeGetProperty(target, key);
        const value = safeGetProperty(object, key);
        if (value === target) {
            return;
        }
        if (typeof value !== 'object' || value === null) {
            target[key] = value;
            return;
        }
        if (Array.isArray(value)) {
            target[key] = deepCloneArray(value);
            return;
        }
        if (isSpecificValue(value)) {
            target[key] = cloneSpecificValue(value);
            return;
        }
        if (typeof source !== 'object' ||
            source === null ||
            Array.isArray(source)) {
            target[key] = deepExtend({}, value);
            return;
        }
        target[key] = deepExtend(source, value);
    });
    return target;
}
exports.deepExtend = deepExtend;


/***/ }),

/***/ "./libs/utilities/src/index.ts":
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__("./libs/utilities/src/async.ts"), exports);
__exportStar(__webpack_require__("./libs/utilities/src/cron.ts"), exports);
__exportStar(__webpack_require__("./libs/utilities/src/extend.ts"), exports);
__exportStar(__webpack_require__("./libs/utilities/src/is.ts"), exports);
__exportStar(__webpack_require__("./libs/utilities/src/query.ts"), exports);
__exportStar(__webpack_require__("./libs/utilities/src/title-case.ts"), exports);
__exportStar(__webpack_require__("./libs/utilities/src/utilities.ts"), exports);


/***/ }),

/***/ "./libs/utilities/src/is.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.is = void 0;
const utilities_1 = __webpack_require__("./libs/utilities/src/utilities.ts");
// TODO: declaration merging to allow other libs to create definitions here
exports.is = {
    boolean(test) {
        return typeof test === 'boolean';
    },
    date(test) {
        return test instanceof Date;
    },
    empty(type) {
        if (exports.is.string(type) || Array.isArray(type)) {
            return type.length === utilities_1.EMPTY;
        }
        if (type instanceof Map || type instanceof Set) {
            return type.size === utilities_1.EMPTY;
        }
        return true;
    },
    even(test) {
        return test % utilities_1.EVEN === utilities_1.EMPTY;
    },
    function(test) {
        return typeof test === 'function';
    },
    number(test) {
        return typeof test === 'number' && !Number.isNaN(test);
    },
    object(test) {
        return typeof test === 'object' && test !== null;
    },
    string(test) {
        return typeof test === 'string';
    },
    undefined(test) {
        return typeof test === 'undefined';
    },
    unique(out) {
        // Technically this isn't an "is"... but close enough
        return out.filter((item, index, array) => array.indexOf(item) === index);
    },
};


/***/ }),

/***/ "./libs/utilities/src/query.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.queryToControl = exports.buildFilter = exports.controlToQuery = exports.ResultControlDTO = exports.FilterDTO = exports.ComparisonDTO = exports.FILTER_OPERATIONS = exports.HTTP_METHODS = void 0;
const is_1 = __webpack_require__("./libs/utilities/src/is.ts");
var HTTP_METHODS;
(function (HTTP_METHODS) {
    HTTP_METHODS["get"] = "get";
    HTTP_METHODS["delete"] = "delete";
    HTTP_METHODS["put"] = "put";
    HTTP_METHODS["head"] = "head";
    HTTP_METHODS["options"] = "options";
    HTTP_METHODS["patch"] = "patch";
    HTTP_METHODS["index"] = "index";
    HTTP_METHODS["post"] = "post";
})(HTTP_METHODS = exports.HTTP_METHODS || (exports.HTTP_METHODS = {}));
var FILTER_OPERATIONS;
(function (FILTER_OPERATIONS) {
    // "elemMatch" functionality in mongo
    // eslint-disable-next-line unicorn/prevent-abbreviations
    FILTER_OPERATIONS["elem"] = "elem";
    FILTER_OPERATIONS["regex"] = "regex";
    FILTER_OPERATIONS["in"] = "in";
    FILTER_OPERATIONS["nin"] = "nin";
    FILTER_OPERATIONS["lt"] = "lt";
    FILTER_OPERATIONS["lte"] = "lte";
    FILTER_OPERATIONS["gt"] = "gt";
    FILTER_OPERATIONS["gte"] = "gte";
    FILTER_OPERATIONS["exists"] = "exists";
    FILTER_OPERATIONS["ne"] = "ne";
    FILTER_OPERATIONS["eq"] = "eq";
})(FILTER_OPERATIONS = exports.FILTER_OPERATIONS || (exports.FILTER_OPERATIONS = {}));
class ComparisonDTO {
    operation;
    value;
}
exports.ComparisonDTO = ComparisonDTO;
class FilterDTO extends ComparisonDTO {
    exists;
    field;
}
exports.FilterDTO = FilterDTO;
class ResultControlDTO {
    filters;
    limit;
    select;
    skip;
    sort;
}
exports.ResultControlDTO = ResultControlDTO;
function controlToQuery(value) {
    const out = new Map();
    if (value?.limit) {
        out.set('limit', value.limit.toString());
    }
    if (value?.skip) {
        out.set('skip', value.skip.toString());
    }
    if (value?.sort) {
        out.set('sort', value.sort.join(','));
    }
    if (value?.select) {
        out.set('select', value.select.join(','));
    }
    value?.filters?.forEach(f => {
        let field = f.field;
        if (f.operation && f.operation !== FILTER_OPERATIONS.eq) {
            field = `${field}__${f.operation}`;
        }
        let value = f.value;
        if (Array.isArray(value)) {
            value = value.join(',');
        }
        if (value instanceof Date) {
            value = value.toISOString();
        }
        if (value === null) {
            value = 'null';
        }
        out.set(field, value.toString());
    });
    return Object.fromEntries(out.entries());
}
exports.controlToQuery = controlToQuery;
function buildFilter(key, value) {
    const [name, operation] = key.split('__');
    switch (operation) {
        case 'in':
        case 'nin':
            if (!Array.isArray(value)) {
                value = is_1.is.string(value) ? value.split(',') : [value];
            }
            return {
                field: name,
                operation,
                value: value,
            };
        case 'elem':
            return {
                field: name,
                operation,
                value: is_1.is.string(value) ? JSON.parse(value) : value,
            };
        default:
            return {
                field: name,
                operation,
                value,
            };
    }
}
exports.buildFilter = buildFilter;
function queryToControl(value) {
    const out = {
        filters: new Set(),
    };
    const parameters = new Map(Object.entries(value));
    parameters.forEach((value, key) => {
        const [name, operation] = key.split('__');
        switch (key) {
            case 'select':
                out.select = value.split(',');
                return;
            case 'sort':
                out.sort = value.split(',');
                return;
            case 'limit':
                out.limit = Number(value);
                return;
            case 'skip':
                out.skip = Number(value);
                return;
        }
        switch (operation) {
            case 'in':
            case 'nin':
                out.filters.add({
                    field: name,
                    operation,
                    value: value.split(','),
                });
                return;
            case 'elem':
                out.filters.add({
                    field: name,
                    operation,
                    value: JSON.parse(value),
                });
                return;
            default:
                out.filters.add({
                    field: name,
                    operation,
                    value,
                });
        }
    });
    return out;
}
exports.queryToControl = queryToControl;


/***/ }),

/***/ "./libs/utilities/src/title-case.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TitleCase = void 0;
const ALL_CAPS = 3;
const FIRST = 0;
const EVERYTHING_ELSE = 1;
const excluded = new Set(['fan', 'day', 'set']);
function TitleCase(input, doCaps = true) {
    const matches = input.match(new RegExp('[a-z][A-Z]', 'g'));
    if (matches) {
        matches.forEach(i => (input = input.replace(i, [...i].join(' '))));
    }
    return input
        .split(new RegExp('[ _-]'))
        .map((word = '') => word.length === ALL_CAPS && doCaps && !excluded.has(word)
        ? word.toUpperCase()
        : `${word.charAt(FIRST).toUpperCase()}${word.slice(EVERYTHING_ELSE)}`)
        .join(' ');
}
exports.TitleCase = TitleCase;


/***/ }),

/***/ "./libs/utilities/src/utilities.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PEAT = exports.sleep = exports.PERCENT = exports.SECOND = exports.DAY = exports.HOUR = exports.MINUTE = exports.DOWN = exports.NOT_FOUND = exports.EMPTY = exports.FIRST = exports.START = exports.LABEL = exports.SAME = exports.SINGLE = exports.INCREMENT = exports.ARRAY_OFFSET = exports.VALUE = exports.UP = exports.INVERT_VALUE = exports.EVEN = void 0;
//
exports.EVEN = 2;
exports.INVERT_VALUE = -1;
// Sort
exports.UP = 1;
// [LABEL,VALUE]
exports.VALUE = 1;
// Standard value
exports.ARRAY_OFFSET = 1;
// array[number +- increment]
exports.INCREMENT = 1;
// Generic one-ness
exports.SINGLE = 1;
// Sorting
exports.SAME = 0;
// [LABEL,VALUE]
exports.LABEL = 0;
// Generic start of something
exports.START = 0;
exports.FIRST = 0;
exports.EMPTY = 0;
// Testing of indexes
exports.NOT_FOUND = -1;
// Sorting
exports.DOWN = -1;
exports.MINUTE = 60_000;
exports.HOUR = 3_600_000;
exports.DAY = 86_400_000;
exports.SECOND = 1000;
exports.PERCENT = 100;
/**
 * Defaults to 1000 (1 second)
 *
 * @example await sleep(5000);
 */
const sleep = (ms = exports.SECOND) => new Promise(done => setTimeout(() => done(), ms));
exports.sleep = sleep;
function PEAT(length, fill) {
    return Array.from({ length }).map((item, index) => fill ?? (index + exports.ARRAY_OFFSET));
}
exports.PEAT = PEAT;


/***/ }),

/***/ "@nestjs/common":
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/core/metadata-scanner":
/***/ ((module) => {

module.exports = require("@nestjs/core/metadata-scanner");

/***/ }),

/***/ "@nestjs/platform-express":
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "async":
/***/ ((module) => {

module.exports = require("async");

/***/ }),

/***/ "bottleneck":
/***/ ((module) => {

module.exports = require("bottleneck");

/***/ }),

/***/ "cache-manager-redis-store":
/***/ ((module) => {

module.exports = require("cache-manager-redis-store");

/***/ }),

/***/ "chalk":
/***/ ((module) => {

module.exports = require("chalk");

/***/ }),

/***/ "chrono-node":
/***/ ((module) => {

module.exports = require("chrono-node");

/***/ }),

/***/ "class-transformer":
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "cli-cursor":
/***/ ((module) => {

module.exports = require("cli-cursor");

/***/ }),

/***/ "comment-json":
/***/ ((module) => {

module.exports = require("comment-json");

/***/ }),

/***/ "cron":
/***/ ((module) => {

module.exports = require("cron");

/***/ }),

/***/ "dayjs":
/***/ ((module) => {

module.exports = require("dayjs");

/***/ }),

/***/ "eventemitter3":
/***/ ((module) => {

module.exports = require("eventemitter3");

/***/ }),

/***/ "execa":
/***/ ((module) => {

module.exports = require("execa");

/***/ }),

/***/ "express":
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "figlet":
/***/ ((module) => {

module.exports = require("figlet");

/***/ }),

/***/ "fuzzysort":
/***/ ((module) => {

module.exports = require("fuzzysort");

/***/ }),

/***/ "ini":
/***/ ((module) => {

module.exports = require("ini");

/***/ }),

/***/ "inquirer":
/***/ ((module) => {

module.exports = require("inquirer");

/***/ }),

/***/ "inquirer/lib/prompts/base":
/***/ ((module) => {

module.exports = require("inquirer/lib/prompts/base");

/***/ }),

/***/ "inquirer/lib/utils/events":
/***/ ((module) => {

module.exports = require("inquirer/lib/utils/events");

/***/ }),

/***/ "js-yaml":
/***/ ((module) => {

module.exports = require("js-yaml");

/***/ }),

/***/ "minimist":
/***/ ((module) => {

module.exports = require("minimist");

/***/ }),

/***/ "mute-stream":
/***/ ((module) => {

module.exports = require("mute-stream");

/***/ }),

/***/ "node-fetch":
/***/ ((module) => {

module.exports = require("node-fetch");

/***/ }),

/***/ "object-path":
/***/ ((module) => {

module.exports = require("object-path");

/***/ }),

/***/ "pino":
/***/ ((module) => {

module.exports = require("pino");

/***/ }),

/***/ "rxjs":
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "semver":
/***/ ((module) => {

module.exports = require("semver");

/***/ }),

/***/ "uuid":
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "async_hooks":
/***/ ((module) => {

module.exports = require("async_hooks");

/***/ }),

/***/ "fs":
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "os":
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "process":
/***/ ((module) => {

module.exports = require("process");

/***/ }),

/***/ "readline":
/***/ ((module) => {

module.exports = require("readline");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

// Import desired script to work on
Object.defineProperty(exports, "__esModule", ({ value: true }));
// import './offline-license.service';
// import './pdf-downloader.service';
// import './imgur-album-download.service';
// import './routine-undelete.service';
// import './form-migrator.service';
__webpack_require__("./apps/devtools/src/entrypoints/build-pipeline.service.ts");

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=main.js.map