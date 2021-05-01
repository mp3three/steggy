import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({})
export class PersistenceModule {
  // #region Public Static Methods

  public static register(options: TypeOrmModuleOptions = {}): DynamicModule {
    return {
      module: PersistenceModule,
      imports: [TypeOrmModule.forRoot(options)],
    };
  }

  // #endregion Public Static Methods
}
