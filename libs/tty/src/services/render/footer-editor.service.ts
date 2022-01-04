import { Injectable } from '@nestjs/common';
import { is } from '@text-based/utilities';

import { ObjectBuilderElement } from '../../contracts';
import { KeyModifiers, tKeyMap } from '../../decorators';
import { EditorExplorerService } from '../explorers';

@Injectable()
export class FooterEditorService {
  constructor(private readonly editorExplorer: EditorExplorerService) {}

  public getKeyMap<T>(
    type: string,
    element: ObjectBuilderElement<T>,
    current: unknown,
  ): tKeyMap {
    const item = this.editorExplorer.findServiceByType(type);
    if (item.customKeymap) {
      return item.customKeymap({ ...element, type }, current);
    }
    return this.editorExplorer.findSettingsBytype(type).keyMap;
  }

  public initConfig(current: unknown, element: ObjectBuilderElement): unknown {
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
    element: ObjectBuilderElement,
    config: T,
    key: string,
    modifiers: KeyModifiers,
    type: string,
  ): Promise<T | Promise<T>> {
    const instance = this.editorExplorer.findServiceByType<T>(type);
    return await instance.onKeyPress(
      { ...config, ...(element.extra as Record<string, unknown>) },
      key,
      modifiers,
    );
  }

  public render<T>(
    element: ObjectBuilderElement<T>,
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
