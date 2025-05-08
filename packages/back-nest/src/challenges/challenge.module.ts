import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from './entities/challenge.entity';
import { ChallengeService } from './services/challenge.service';
import { CodeFinderService } from './services/code-finder.service';
import { LiteralService } from './services/literal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Challenge])],
  providers: [ChallengeService, CodeFinderService, LiteralService],
  exports: [ChallengeService, LiteralService],
})
export class ChallengeModule {} 