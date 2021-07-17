import { LOG_LEVEL } from '@formio/contracts/config';
import { ConfigModule, JiraService } from '@formio/utilities';
import { CacheModule, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

export class JiraModule {
  // #region Public Static Methods

  public static forRoot(
    name: string,
    defaultSettings: Record<string, unknown>,
  ): DynamicModule {
    return {
      imports: [
        CacheModule.register(),
        ConfigModule.register(name, defaultSettings),
        LoggerModule.forRootAsync({
          inject: [ConfigService],
          useFactory(configService: ConfigService) {
            return {
              pinoHttp: {
                level: configService.get(LOG_LEVEL),
              },
            };
          },
        }),
      ],
      module: JiraModule,
      providers: [JiraService],
    };
  }

  // #endregion Public Static Methods
}
