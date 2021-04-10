import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      // Limit to 10 requests against a single endpoint per min per ip
      ttl: 60,
      limit: 10,
    }),
  ],
  providers: [],
})
export class AppModule {}
