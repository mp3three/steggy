import { Injectable } from '@nestjs/common';
import { is } from '@text-based/utilities';

import { ObjectBuilderElement } from '../../contracts';
import { KeyModifiers, tKeyMap } from '../../decorators';
import { EditorExplorerService } from '../explorers';

@Injectable()
export class FooterEditorService {
  constructor(private readonly editorExplorer: EditorExplorerService) {}

  public getKeyMap({ type }: ObjectBuilderElement): tKeyMap {
    return this.editorExplorer.findSettingsBytype(type).keyMap;
  }

  public initConfig(current: string, element: ObjectBuilderElement): unknown {
    return {
      current,
      label: element.name,
    };
  }

  public lineColor(element: ObjectBuilderElement, config: unknown): string {
    const instance = this.editorExplorer.findServiceByType(element.type);
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
  ): Promise<T | Promise<T>> {
    const instance = this.editorExplorer.findServiceByType<T>(element.type);
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
  ): string {
    const instance = this.editorExplorer.findServiceByType(element.type);
    return instance.render({
      ...(config as { current: T }),
      ...element.extra,
      width,
    });
  }
}
