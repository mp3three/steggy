import { AutoConfigService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

@Injectable()
export class LightExplorerService {
  // #region Constructors

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    //
  }

  // #endregion Protected Methods
}
