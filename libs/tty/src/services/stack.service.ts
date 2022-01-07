import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { is, ModuleScannerService } from '@text-based/utilities';

import {
  ApplicationStackItem,
  iStackProvider,
  STACK_PROVIDER,
} from '../contracts';

@Injectable()
export class StackService {
  constructor(private readonly scanner: ModuleScannerService) {}
  private stack: ApplicationStackItem[] = [];

  public load(): void {
    if (is.empty(this.stack)) {
      throw new InternalServerErrorException(`Empty stack`);
    }
    const item = this.stack.pop();
    const providers =
      this.scanner.findWithSymbol<iStackProvider>(STACK_PROVIDER);
    providers.forEach((provider) => {
      provider.load(item);
    });
  }

  public save(): void {
    const providers =
      this.scanner.findWithSymbol<iStackProvider>(STACK_PROVIDER);
    const stack = {} as Partial<ApplicationStackItem>;
    providers.forEach((provider) => {
      Object.assign(stack, provider.save());
    });
    this.stack.push(stack as ApplicationStackItem);
  }
}
