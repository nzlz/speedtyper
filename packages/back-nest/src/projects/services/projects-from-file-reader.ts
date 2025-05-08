import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import * as yaml from 'js-yaml';

@Injectable()
export class ProjectsFromFileReader {
  private static FILE_PATH = '/app/.repos';
  async *readProjects() {
    const stream = createReadStream(ProjectsFromFileReader.FILE_PATH);
    const rl = createInterface({
      input: stream,
      crlfDelay: Infinity,
    });
    
    let content = '';
    for await (const line of rl) {
      content += line + '\n';
    }
    
    const repos = yaml.load(content) as { repositories: Record<string, { url: string }> };
    for (const [name, info] of Object.entries(repos.repositories)) {
      const url = info.url;
      const match = url.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
      if (match) {
        const [_, owner, repo] = match;
        yield validateProjectName(`${owner}/${repo}`);
      }
    }
  }
}

export function validateProjectName(slug: string) {
  let [owner, repo] = slug.split('/');
  owner = owner.trim();
  repo = repo.trim();
  if (!owner || !repo) {
    throw new Error(slug);
  }
  return [owner, repo].join('/');
}
