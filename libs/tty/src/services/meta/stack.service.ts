import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { is, ModuleScannerService } from '@text-based/utilities';

import { iStackProvider, STACK_PROVIDER } from '../../contracts';

@Injectable()
export class StackService {
  constructor(private readonly scanner: ModuleScannerService) {}
  private stack: Map<iStackProvider, unknown>[] = [];

  public load(): void {
    if (is.empty(this.stack)) {
      throw new InternalServerErrorException(`Empty stack`);
    }
    const item = this.stack.pop();
    item.forEach((item, provider) => provider.load(item));
  }

  public save(): void {
    const providers = this.scanner.findWithSymbol<unknown, iStackProvider>(
      STACK_PROVIDER,
    );
    const map = new Map<iStackProvider, unknown>();
    providers.forEach((_, provider) => map.set(provider, provider.save()));
    this.stack.push(map);
  }

  public async wrap<T>(value: () => Promise<T>): Promise<T> {
    return new Promise<T>(async (done) => {
      this.save();
      const out = await value();
      this.load();
      done(out);
    });
  }
}
