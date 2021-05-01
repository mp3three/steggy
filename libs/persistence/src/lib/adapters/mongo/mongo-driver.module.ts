import { MONGOOSE } from '@automagical/contracts/persistence';
import { Module } from '@nestjs/common';
import mongoose from 'mongoose';
import { ProjectDriver } from './drivers';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ProjectDriver],
  exports: [ProjectDriver],
})
export class MongoDriverModule {}
