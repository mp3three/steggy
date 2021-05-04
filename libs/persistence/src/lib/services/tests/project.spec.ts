import { ConfigModule } from '@automagical/config';
import { ProjectDTO } from '@automagical/contracts/formio-sdk';
import { ProjectService } from '@automagical/persistence';
import { ConfigService } from '@nestjs/config';
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
        ConfigModule.register('jest-test'),
        PersistenceModule.registerMongoose(),
        LoggerModule.forRoot(),
        PersistenceModule.mongooseRoot(process.env.MONGO_URL),
      ],
      providers: [ConfigService],
    }).compile();
    projectService = moduleReference.get(ProjectService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const project = ProjectDTO.fake({});
      const result = await projectService.create(project);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const project = ProjectDTO.fake({});
      const created = await projectService.create(project);
      expect(created._id).toBeDefined();
      const found = await projectService.findById(created);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to findOne by name', async () => {
      expect.assertions(2);

      const project = ProjectDTO.fake({});
      const created = await projectService.create(project);
      expect(created._id).toBeDefined();
      const found = await projectService.findByName(created);
      expect(found._id).toStrictEqual(created._id);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';

      const project = ProjectDTO.fake({ title: original });
      const created = await projectService.create(project);
      expect(created._id).toBeDefined();
      const result = await projectService.update(created, {
        title: updated,
      });
      expect(result).toStrictEqual(true);
      const found = await projectService.findById(created);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const project = ProjectDTO.fake({});
      const created = await projectService.create(project);
      expect(created._id).toBeDefined();
      await projectService.delete(created);
      const found = await projectService.findById(created);
      expect(found).toBeFalsy();
    });
  });
});
