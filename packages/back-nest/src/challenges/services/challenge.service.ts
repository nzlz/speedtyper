import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Challenge } from '../entities/challenge.entity';
import { LanguageDTO } from '../entities/language.dto';
import { CodeFinderService } from './code-finder.service';
import { Project } from 'src/projects/entities/project.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChallengeService {
  private readonly logger = new Logger(ChallengeService.name);
  private static UpsertOptions = {
    conflictPaths: ['content'],
    skipUpdateIfNoValuesChanged: true,
  };

  constructor(
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private codeFinderService: CodeFinderService,
  ) {}

  async upsert(challenges: Challenge[]): Promise<void> {
    // Process challenges in smaller batches to avoid conflicts
    const batchSize = 10;
    for (let i = 0; i < challenges.length; i += batchSize) {
      const batch = challenges.slice(i, i + batchSize);
      try {
        await this.challengeRepository.upsert(
          batch,
          ChallengeService.UpsertOptions,
        );
      } catch (error) {
        this.logger.error(`Error upserting batch: ${error.message}`);
        // If upsert fails, try inserting each challenge individually
        for (const challenge of batch) {
          try {
            await this.challengeRepository.save(challenge);
          } catch (saveError) {
            this.logger.error(`Error saving individual challenge: ${saveError.message}`);
          }
        }
      }
    }
  }

  async getRandom(language?: string): Promise<Challenge> {
    // First try to get from database
    let query = this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.project', 'project');

    if (language) {
      query = query.where('challenge.language = :language', {
        language,
      });
    }

    const randomChallenge = await query.orderBy('RANDOM()').getOne();

    if (randomChallenge) {
      return randomChallenge;
    }

    // If no challenge in database, try to get from code finder
    this.logger.log(`No challenges in database, trying to find code snippets for language: ${language || 'any'}`);
    const snippets = await this.codeFinderService.findCodeSnippets(language);
    
    if (snippets.length === 0) {
      if (language) {
        throw new BadRequestException(`No challenges for language: ${language}`);
      } else {
        throw new BadRequestException('No challenges available');
      }
    }

    // Get or create a default project
    let project = await this.projectRepository.findOne({ where: { fullName: 'nzlz/speedtyper' } });
    if (!project) {
      project = this.projectRepository.create({
        fullName: 'nzlz/speedtyper',
        htmlUrl: 'https://github.com/nzlz/speedtyper',
        language: language || 'unknown',
        stars: 0,
        licenseName: 'MIT',
        ownerAvatar: 'https://github.com/identicons/nzlz.png',
        defaultBranch: 'main',
      });
      await this.projectRepository.save(project);
    }

    // Convert snippets to challenges and save them
    const challenges = snippets.map(snippet => {
      const challenge = new Challenge();
      challenge.content = snippet.content;
      challenge.language = this.getLanguageFromPath(snippet.path);
      challenge.path = snippet.path;
      challenge.sha = uuidv4(); // Generate a unique SHA for local snippets
      challenge.treeSha = uuidv4(); // Generate a unique tree SHA for local snippets
      // Make URL unique by appending timestamp and random string
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      challenge.url = `file://${snippet.path}?t=${timestamp}&r=${randomStr}`;
      challenge.project = project;
      return challenge;
    });

    // Deduplicate challenges by content
    const uniqueChallenges = challenges.reduce((acc, challenge) => {
      const existingChallenge = acc.find(c => c.content === challenge.content);
      if (!existingChallenge) {
        acc.push(challenge);
      }
      return acc;
    }, [] as Challenge[]);

    this.logger.log(`Found ${snippets.length} snippets, deduplicated to ${uniqueChallenges.length} unique challenges`);
    await this.upsert(uniqueChallenges);
    
    // Return a random challenge from the newly created ones
    return uniqueChallenges[Math.floor(Math.random() * uniqueChallenges.length)];
  }

  private getLanguageFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'hpp': 'cpp',
      'h': 'c',
      'c': 'c',
      'rb': 'ruby',
      'php': 'php',
      'lua': 'lua',
      'scala': 'scala',
      'cs': 'csharp'
    };
    return languageMap[ext] || 'unknown';
  }

  async getLanguages(): Promise<LanguageDTO[]> {
    const selectedLanguages = await this.challengeRepository
      .createQueryBuilder()
      .select('language')
      .distinct()
      .execute();

    const languages = selectedLanguages.map(
      ({ language }: { language: string }) => ({
        language,
        name: this.getLanguageName(language),
      }),
    );

    languages.sort((a, b) => a.name.localeCompare(b.name));

    return languages;
  }

  private getLanguageName(language: string): string {
    const allLanguages = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      rust: 'Rust',
      c: 'C',
      java: 'Java',
      cpp: 'C++',
      go: 'Go',
      lua: 'Lua',
      php: 'PHP',
      python: 'Python',
      ruby: 'Ruby',
      csharp: 'C-Sharp',
      scala: 'Scala',
    };
    return allLanguages[language] || language;
  }
}
