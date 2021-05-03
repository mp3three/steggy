import { ConfigModule } from '@automagical/config';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { ProjectService } from '@automagical/persistence';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { PersistenceModule } from '../../persistence.module';

describe('project', () => {
  let projectService: ProjectService;
  const logger = pino();

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test', {
          MONGO: `mongodb://localhost:27017/testing`,
        }),
        PersistenceModule.registerMongoose(),
        LoggerModule.forRoot(),
        MongooseModule.forRoot(`mongodb://localhost:27017/testing`),
      ],
      providers: [ConfigService],
    }).compile();
    projectService = moduleReference.get(ProjectService);
  });

  describe('create', () => {
    it('should return an id on create', async () => {
      expect.assertions(1);
      const project = ProjectDTO.fake({
        _id: undefined,
        created: undefined,
        modified: undefined,
        title: 'asdf',
      });
      const model = await projectService.create(project);
      logger.info({ model, project });
      expect(model._id).toBeDefined();
    });
  });
});
