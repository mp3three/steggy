import { Test, TestingModule } from '@nestjs/testing';
import { LoftService } from './loft.service';

describe('LoftService', () => {
  let service: LoftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoftService],
    }).compile();

    service = module.get<LoftService>(LoftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
