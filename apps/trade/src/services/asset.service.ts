import { Injectable } from '@nestjs/common';
import { AccountService } from '@text-based/alpaca';
import { PromptService } from '@text-based/tty';

@Injectable()
export class AssetService {
  constructor(
    private readonly promptService: PromptService,
    private readonly account: AccountService,
  ) {}
}
