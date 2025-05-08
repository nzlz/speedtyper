import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { RacesModule } from 'src/races/races.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    RacesModule,
  ],
  controllers: [],
  providers: [],
})
export class AuthModule {}
