import { Test } from '@nestjs/testing';
import { HomeAssistantService } from './home-assistant.service';

describe('HomeAssistantService', () => {
  let service: HomeAssistantService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HomeAssistantService],
    }).compile();

    service = module.get(HomeAssistantService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
