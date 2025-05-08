import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubConnectorModule } from 'src/connectors/github/github.module';
import { ProjectsModule } from 'src/projects/projects.module';
import { Project } from 'src/projects/entities/project.entity';
import { CalculateLanguageRunner } from './commands/calculate-language-runner';
import { ChallengeImportRunner } from './commands/challenge-import-runner';
import { ReformatChallengesRunner } from './commands/reformat-challenges-runner';
import { UnsyncedFileImportRunner } from './commands/unsynced-file-import-runner';
import { Challenge } from './entities/challenge.entity';
import { UnsyncedFile } from './entities/unsynced-file.entity';
import { LanguageController } from './languages.controller';
import { ChallengeService } from './services/challenge.service';
import { CodeFinderService } from './services/code-finder.service';
import { LiteralService } from './services/literal.service';
import { ParserService } from './services/parser.service';
import { UnsyncedFileFilterer } from './services/unsynced-file-filterer';
import { UnsyncedFileImporter } from './services/unsynced-file-importer';
import { UnsyncedFileService } from './services/unsynced-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnsyncedFile, Challenge, Project]),
    GithubConnectorModule,
    ProjectsModule,
  ],
  controllers: [LanguageController],
  providers: [
    ParserService,
    ChallengeService,
    CodeFinderService,
    LiteralService,
    ChallengeImportRunner,
    UnsyncedFileFilterer,
    UnsyncedFileImporter,
    UnsyncedFileImportRunner,
    UnsyncedFileService,
    CalculateLanguageRunner,
    ReformatChallengesRunner,
  ],
  exports: [ChallengeService, LiteralService],
})
export class ChallengesModule {}
