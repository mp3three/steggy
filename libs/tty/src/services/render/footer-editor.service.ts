import { Injectable } from '@nestjs/common';

import { ObjectBuilderElement } from '../../contracts';
import { KeyModifiers, tKeyMap } from '../../decorators';
import { EditorExplorerService } from '../explorers';

@Injectable()
export class FooterEditorService {
  constructor(private readonly editorExplorer: EditorExplorerService) {}

  public getKeyMap(element: ObjectBuilderElement): tKeyMap {
    return undefined;
  }

  public initConfig(current: string, element: ObjectBuilderElement): unknown {
    return {
      current,
      label: element.name,
    };
    //
  }

  public lineColor(element: ObjectBuilderElement, config: unknown): string {
    return 'magenta.dim';
  }

  public onKeyPress<T>(
    element: ObjectBuilderElement,
    config: T,
    key: string,
    modifiers: KeyModifiers,
  ): T {
    modifiers;
    return config;
  }

  public render(
    element: ObjectBuilderElement,
    config: unknown,
    width: number,
  ): string {
    width;
    return ``;
  }
}
