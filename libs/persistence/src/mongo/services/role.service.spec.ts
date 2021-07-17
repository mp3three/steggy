import { ProjectDTO, RoleDTO } from '@formio/contracts/formio-sdk';
import { ConfigModule, queryToControl } from '@formio/utilities';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import faker from 'faker';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

import { RoleSchema } from '../schema';
import { RolePersistenceMongoService } from './role.service';

describe('role', () => {
  let roleService: RolePersistenceMongoService;
  const logger = pino();

  beforeAll(async () => {
    const moduleReference = await Test.createTestingModule({
      imports: [
        ConfigModule.register('jest-test'),
        MongooseModule.forFeature([{ name: RoleDTO.name, schema: RoleSchema }]),
        LoggerModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO, { useCreateIndex: true }),
      ],
      providers: [ConfigService, RolePersistenceMongoService],
    }).compile();
    roleService = moduleReference.get(RolePersistenceMongoService);
  });

  describe('create', () => {
    it('should return an id,created,modified on create', async () => {
      expect.assertions(3);

      const form = RoleDTO.fake({});
      const result = await roleService.create(form);
      expect(result._id).toBeDefined();
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });
  });

  describe('find', () => {
    it('should be able to findOne by id', async () => {
      expect.assertions(2);

      const project = ProjectDTO.fake({}, true);
      const role = RoleDTO.fake({
        project: project._id,
      });
      const created = await roleService.create(role);
      expect(created._id).toBeDefined();
      const found = await roleService.findById(created._id, project);
      expect(found._id).toStrictEqual(created._id);
    });

    it('should be able to find many', async () => {
      expect.assertions(1);
      const project = ProjectDTO.fake({}, true);
      const description = faker.random.alphaNumeric(20);
      const forms = [
        RoleDTO.fake({ description, project: project._id }),
        RoleDTO.fake({ description, project: project._id }),
        RoleDTO.fake({ description, project: project._id }),
      ];
      await roleService.create(forms[0]);
      await roleService.create(forms[1]);
      await roleService.create(forms[2]);
      const results = await roleService.findMany(
        queryToControl({ description }),
        project,
      );
      expect(results).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should be able to modify properties', async () => {
      expect.assertions(3);
      const original = 'original';
      const updated = 'updated';
      const project = ProjectDTO.fake({}, true);

      const form = RoleDTO.fake({ project: project._id, title: original });
      const created = await roleService.create(form);
      expect(created._id).toBeDefined();
      const result = await roleService.update(
        {
          ...created,
          title: updated,
        },
        project,
      );
      expect(result._id).toStrictEqual(created._id);
      const found = await roleService.findById(created._id, project);
      expect(found.title).toStrictEqual(updated);
    });
  });

  describe('delete', () => {
    it('should soft delete', async () => {
      expect.assertions(2);
      const project = ProjectDTO.fake({}, true);
      const form = RoleDTO.fake({ project: project._id });
      const created = await roleService.create(form);
      expect(created._id).toBeDefined();
      await roleService.delete(created, project);
      const found = await roleService.findById(created._id, project);
      expect(found).toBeFalsy();
    });
  });
});
