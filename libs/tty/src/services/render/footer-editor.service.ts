import { Injectable } from '@nestjs/common';
import { is } from '@steggy/utilities';

import { KeyModifiers, TableBuilderElement, tKeyMap } from '../../contracts';
import { EditorExplorerService } from '../explorers';

@Injectable()
export class FooterEditorService {
  constructor(private readonly editorExplorer: EditorExplorerService) {}

  public getKeyMap<T>(
    type: string,
    element: TableBuilderElement<T>,
    current: unknown,
  ): tKeyMap {
    const item = this.editorExplorer.findServiceByType(type);
    if (item.customKeymap) {
      return item.customKeymap({ ...element, type }, current);
    }
    return this.editorExplorer.findSettingsByType(type).keyMap;
  }

  public initConfig(current: unknown, element: TableBuilderElement): unknown {
    return {
      current,
      label: element.name,
    };
  }

  public lineColor(type: string, config: unknown): string {
    const instance = this.editorExplorer.findServiceByType(type);
    if (is.undefined(instance.lineColor)) {
      return 'magenta.dim';
    }
    return instance.lineColor(config);
  }

  public async onKeyPress<T>(
    element: TableBuilderElement,
    config: T,
    key: string,
    modifiers: KeyModifiers,
    type: string,
  ): Promise<T> {
    const instance = this.editorExplorer.findServiceByType<T>(type);
    return await instance.onKeyPress(
      { ...config, ...(element.extra as Record<string, unknown>) },
      key,
      modifiers,
    );
  }

  public render<T>(
    element: TableBuilderElement<T>,
    config: unknown,
    width: number,
    type: string,
  ): string {
    const instance = this.editorExplorer.findServiceByType(type);
    return instance.render({
      ...(config as { current: T }),
      ...element.extra,
      width,
    });
  }
}
