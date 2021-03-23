import { Test, TestingModule } from '@nestjs/testing';
import { GarageService } from './garage.service';

describe('GarageService', () => {
  let service: GarageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GarageService],
    }).compile();

    service = module.get<GarageService>(GarageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
