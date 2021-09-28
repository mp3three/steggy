import { INestApplication } from '@nestjs/common';
import { Express } from 'express';

interface lifecycle {
  onPostInit(application: INestApplication, express?: Express): Promise<void>;
  onPreInit(application: INestApplication, express?: Express): Promise<void>;
}
export type iLifecycle = Partial<lifecycle>;
