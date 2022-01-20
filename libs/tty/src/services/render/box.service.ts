import { Injectable, Scope } from '@nestjs/common';

import { ThemeService } from '../meta';

@Injectable({ scope: Scope.TRANSIENT })
export class BoxService {
  constructor(private readonly themeService: ThemeService) {}
  /**
   * Hex
   */
  public borderColor: string;
  /**
   * Internal box contents. Multiline string
   */
  public content: string;
  /**
   * % of screen
   */
  public height: number;
  /**
   * Border legend text
   */
  public legend: string;
  /**
   * % of screen
   */
  public width: number;
  /**
   * Render position cache
   */
  public x?: number;
  /**
   * Render position cache
   */
  public y?: number;

  public render(): string {
    return ``;
  }
}
