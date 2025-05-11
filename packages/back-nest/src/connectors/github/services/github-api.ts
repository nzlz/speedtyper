import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { validateDTO } from 'src/utils/validateDTO';
import { GithubBlob } from '../schemas/github-blob.dto';
import { GithubRepository } from '../schemas/github-repository.dto';
import { GithubTree } from '../schemas/github-tree.dto';

@Injectable()
export class GithubAPI implements OnModuleInit {
  private static BASE_URL = 'https://api.github.com';
  private static REPOSITORIES_URL = `${GithubAPI.BASE_URL}/repos`;
  private static REPOSITORY_URL = `${GithubAPI.REPOSITORIES_URL}/{fullName}`;
  private static TREE_URL = `${GithubAPI.REPOSITORY_URL}/git/trees/{sha}?recursive=true`;
  private static BLOB_URL = `${GithubAPI.REPOSITORY_URL}/git/blobs/{sha}`;
  private static BLOB_HTML_PERMA_LINK = `https://github.com/{fullName}/blob/{treeSha}/{path}/#L{startLine}-L{endLine}`;

  private token: string | null = null;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    this.token = this.getGithubAccessToken();
    if (!this.token) {
      console.warn('Running GitHub API in unauthenticated mode. Rate limits will be lower.');
    }
  }

  private getGithubAccessToken(): string | null {
    const token = this.config.get<string>('GITHUB_ACCESS_TOKEN');
    if (!token) {
      console.warn('GITHUB_ACCESS_TOKEN is not set. Running in unauthenticated mode with rate limits.');
      return null;
    }
    if (!token.startsWith('ghp_')) {
      console.warn('GITHUB_ACCESS_TOKEN is not a valid value. It should start with "ghp_". Running in unauthenticated mode.');
      return null;
    }
    return token;
  }

  static getBlobPermaLink(
    fullName: string,
    treeSha: string,
    path: string,
    startLine: number,
    endLine: number,
  ) {
    const url = GithubAPI.BLOB_HTML_PERMA_LINK.replace('{fullName}', fullName)
      .replace('{treeSha}', treeSha)
      .replace('{path}', path)
      .replace('{startLine}', startLine.toString())
      .replace('{endLine}', endLine.toString());
    return url;
  }

  private async get(url: string) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `token ${this.token}`;
    }
    
    const resp = await firstValueFrom(
      this.http.get(url, { headers }),
    );
    this.logRateLimit(resp);
    return resp.data;
  }

  private logRateLimit(resp: AxiosResponse) {
    const rateLimitResetSeconds = resp.headers['x-ratelimit-reset'];
    const resetDate = new Date(parseInt(rateLimitResetSeconds) * 1000);
    const rateLimitRemaining = resp.headers['x-ratelimit-remaining'];
    console.log(
      `GH Rate Limiting. Remaining: ${rateLimitRemaining} Reset: ${resetDate}`,
    );
  }

  async fetchRepository(fullName: string): Promise<GithubRepository> {
    const url = GithubAPI.REPOSITORY_URL.replace('{fullName}', fullName);
    const rawData = await this.get(url);
    const repository = await validateDTO(GithubRepository, rawData);
    return repository;
  }

  async fetchTree(fullName: string, sha: string): Promise<GithubTree> {
    const treeUrl = GithubAPI.TREE_URL.replace('{fullName}', fullName).replace(
      '{sha}',
      sha,
    );
    const rawData = await this.get(treeUrl);
    const rootNode = await validateDTO(GithubTree, rawData);
    return rootNode;
  }

  async fetchBlob(fullName: string, sha: string): Promise<GithubBlob> {
    const url = GithubAPI.BLOB_URL.replace('{fullName}', fullName).replace(
      '{sha}',
      sha,
    );
    const rawData = await this.get(url);
    const blob = await validateDTO(GithubBlob, rawData);
    return blob;
  }
}
