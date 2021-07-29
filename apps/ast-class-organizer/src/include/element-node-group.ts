import { ElementNode } from '../typescript';

export class ElementNodeGroup {
  // #region Constructors

  constructor(
    public caption: string | null,
    public nodeSubGroups: ElementNodeGroup[],
    public nodes: ElementNode[],
    public isRegion: boolean,
  ) {}

  // #endregion Constructors
}
