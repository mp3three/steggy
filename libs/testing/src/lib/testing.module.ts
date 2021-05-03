import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (
  options: MongooseModuleOptions = {},
): ReturnType<typeof MongooseModule.forRootAsync> =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = new MongoMemoryServer();
      const mongoUri = await mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async (): Promise<void> => {
  if (mongod) {
    await mongod.stop();
  }
};

@Module({})
export class TestingModule {
  // #region Public Static Methods

  public static memoryMongo(options: MongooseModuleOptions = {}) {
    return MongooseModule.forRootAsync({
      useFactory: async () => {
        mongod = new MongoMemoryServer();
        const mongoUri = await mongod.getUri();
        return {
          uri: mongoUri,
          ...options,
        };
      },
    });
  }

  // #endregion Public Static Methods
}
