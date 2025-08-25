import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
}

export interface GitHubContributor {
  id: number;
  login: string;
  contributions: number;
}

@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);
  private readonly api: AxiosInstance;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': token ? `token ${token}` : undefined,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Analytics-Dashboard',
      },
    });

    // Add rate limiting interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 403) {
          this.logger.warn('GitHub API rate limit exceeded');
        }
        return Promise.reject(error);
      }
    );
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    try {
      const response = await this.api.get<GitHubRepo>(`/repos/${owner}/${repo}`);
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to fetch repository ${owner}/${repo}: ${errorMessage}`);
      throw error;
    }
  }

  async getContributors(owner: string, repo: string): Promise<GitHubContributor[]> {
    try {
      const response = await this.api.get<GitHubContributor[]>(`/repos/${owner}/${repo}/contributors`);
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to fetch contributors for ${owner}/${repo}: ${errorMessage}`);
      return [];
    }
  }

  async getContributorsCount(owner: string, repo: string): Promise<number> {
    try {
      const contributors = await this.getContributors(owner, repo);
      return contributors.length;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to get contributors count for ${owner}/${repo}: ${errorMessage}`);
      return 0;
    }
  }
}
