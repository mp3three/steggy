import { Injectable } from '@nestjs/common';
import { ModuleScannerService } from '@steggy/boilerplate';

import { EDITOR_CONFIG, EditorOptions, iBuilderEditor } from '../../decorators';

@Injectable()
export class EditorExplorerService {
  constructor(private readonly scanner: ModuleScannerService) {}

  public readonly REGISTERED_EDITORS = new Map<EditorOptions, iBuilderEditor>();

  public findServiceByType<T>(name: string): iBuilderEditor<T> {
    let out: iBuilderEditor<T>;
    this.REGISTERED_EDITORS.forEach((service: iBuilderEditor<T>, settings) => {
      if (settings.type === name) {
        out = service;
      }
    });
    return out;
  }

  public findSettingsByType(type: string): EditorOptions {
    let out: EditorOptions;
    this.REGISTERED_EDITORS.forEach((__, settings) => {
      if (settings.type === type) {
        out = settings;
      }
    });
    return out;
  }

  protected onModuleInit(): void {
    const providers = this.scanner.findWithSymbol<
      EditorOptions,
      iBuilderEditor
    >(EDITOR_CONFIG);
    providers.forEach((key, value) => this.REGISTERED_EDITORS.set(key, value));
  }
}
