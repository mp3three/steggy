import { INestApplication } from '@nestjs/common';
import { Express } from 'express';

interface lifecycle {
  onPreInit(application: INestApplication, express?: Express): Promise<void>;
  onPostInit(application: INestApplication, express?: Express): Promise<void>;
}
export type iLifecycle = Partial<lifecycle>;
