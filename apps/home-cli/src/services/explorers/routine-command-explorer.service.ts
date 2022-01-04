import { Injectable } from '@nestjs/common';
import { ModuleScannerService } from '@text-based/utilities';
import { ROUTINE_COMMAND } from '../../decorators';

@Injectable()
export class RoutineCommandExplorerService {
  constructor(private readonly scanner: ModuleScannerService) {}

  protected onModuleInit(): void {
    // this.scanner.findWithSymbol(ROUTINE_COMMAND_OPTIONS)
  }
}
