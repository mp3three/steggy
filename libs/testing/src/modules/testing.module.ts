import { Module } from '@nestjs/common';

import { ActionCRUDMock } from '../services';

@Module({
  imports: [ActionCRUDMock],
  providers: [ActionCRUDMock],
})
export class TestingModule {}
