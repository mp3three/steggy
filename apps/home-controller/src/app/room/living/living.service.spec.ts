import { Test, TestingModule } from '@nestjs/testing';
import { LivingService } from './living.service';

describe('LivingService', () => {
  let service: LivingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivingService],
    }).compile();

    service = module.get<LivingService>(LivingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
