import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CodeFinderService {
  private readonly logger = new Logger(CodeFinderService.name);
  private readonly REPOS_DIR = '/app/repos';
  private readonly MAX_NODE_LENGTH = 300;
  private readonly MIN_NODE_LENGTH = 100;
  private readonly MAX_NUM_LINES = 11;
  private readonly MAX_LINE_LENGTH = 55;

  async findCodeSnippets(language?: string): Promise<Array<{content: string, path: string}>> {
    const snippets: Array<{content: string, path: string}> = [];
    
    if (!fs.existsSync(this.REPOS_DIR)) {
      this.logger.error(`Repos directory not found at ${this.REPOS_DIR}`);
      return snippets;
    }

    const repos = fs.readdirSync(this.REPOS_DIR);
    this.logger.log(`Found ${repos.length} repositories in ${this.REPOS_DIR}`);

    for (const repo of repos) {
      const repoPath = path.join(this.REPOS_DIR, repo);
      this.logger.log(`Processing repository: ${repo}`);
      await this.processDirectory(repoPath, language, snippets);
    }

    this.logger.log(`Found ${snippets.length} code snippets`);
    return snippets;
  }

  private async processDirectory(dir: string, language: string | undefined, snippets: Array<{content: string, path: string}>) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.processDirectory(filePath, language, snippets);
      } else if (this.isCodeFile(file, language)) {
        await this.processFile(filePath, snippets);
      }
    }
  }

  private isCodeFile(file: string, language?: string): boolean {
    const ext = path.extname(file).slice(1);
    if (!language) return true;
    
    const languageMap: Record<string, string[]> = {
      'go': ['go'],
      'javascript': ['js'],
      'typescript': ['ts', 'tsx'],
      'python': ['py'],
      'rust': ['rs'],
      'java': ['java'],
      'cpp': ['cpp', 'hpp', 'h'],
      'c': ['c', 'h'],
      'ruby': ['rb'],
      'php': ['php'],
      'lua': ['lua'],
      'scala': ['scala'],
      'csharp': ['cs']
    };

    return languageMap[language]?.includes(ext) || false;
  }

  private async processFile(filePath: string, snippets: Array<{content: string, path: string}>) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Find function-like blocks
      let currentBlock: string[] = [];
      let inBlock = false;
      
      for (const line of lines) {
        // Check for function-like declarations
        if (line.match(/^(function|def|fn|pub fn|class|impl|trait|module|interface|enum|struct)\s+\w+/)) {
          if (currentBlock.length > 0) {
            const block = currentBlock.join('\n');
            if (this.isValidSnippet(block)) {
              snippets.push({
                content: block,
                path: filePath
              });
            }
          }
          currentBlock = [line];
          inBlock = true;
        } else if (inBlock) {
          // Check for block end (empty line or closing brace)
          if (line.trim() === '' || line.trim() === '}') {
            const block = currentBlock.join('\n');
            if (this.isValidSnippet(block)) {
              snippets.push({
                content: block,
                path: filePath
              });
            }
            currentBlock = [];
            inBlock = false;
          } else {
            currentBlock.push(line);
          }
        }
      }
      
      // Add the last block if it exists
      if (currentBlock.length > 0) {
        const block = currentBlock.join('\n');
        if (this.isValidSnippet(block)) {
          snippets.push({
            content: block,
            path: filePath
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error processing ${filePath}: ${error.message}`);
    }
  }

  private isValidSnippet(content: string): boolean {
    if (content.length < this.MIN_NODE_LENGTH || content.length > this.MAX_NODE_LENGTH) {
      return false;
    }

    const lines = content.split('\n');
    if (lines.length > this.MAX_NUM_LINES) {
      return false;
    }

    for (const line of lines) {
      if (line.length > this.MAX_LINE_LENGTH) {
        return false;
      }
    }

    return true;
  }
} 