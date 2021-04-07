import { Test } from '@nestjs/testing';
import { ResourcesService } from './resources.service';

describe('ResourcesService', () => {
  let service: ResourcesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ResourcesService],
    }).compile();

    service = module.get(ResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
