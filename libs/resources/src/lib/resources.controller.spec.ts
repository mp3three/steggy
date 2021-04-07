import { Test } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

describe('ResourcesController', () => {
  let controller: ResourcesController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ResourcesService],
      controllers: [ResourcesController],
    }).compile();

    controller = module.get(ResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
