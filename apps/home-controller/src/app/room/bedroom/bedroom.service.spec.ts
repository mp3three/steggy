import { Test, TestingModule } from '@nestjs/testing';
import { BedroomService } from './bedroom.service';

describe('BedroomService', () => {
  let service: BedroomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BedroomService],
    }).compile();

    service = module.get<BedroomService>(BedroomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
