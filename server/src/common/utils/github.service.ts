import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

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

  async getOpenPullRequestsCount(owner: string, repo: string): Promise<number> {
    try {
      // Use per_page=1 so the last page number equals total count
      const response = await this.api.get(`/repos/${owner}/${repo}/pulls`, {
        params: { state: 'open', per_page: 1 },
      });

      const link: string | undefined = response.headers['link'] || response.headers['Link'];
      if (!link) {
        // No pagination means either 0 or 1 results
        // If we requested per_page=1 and got an array, its length is 0 or 1
        const count = Array.isArray(response.data) ? response.data.length : 0;
        return count;
      }

      const match = link.match(/&page=(\d+)>; rel="last"/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }

      // Fallback: if rel="last" not present but rel="next" exists, at least >1
      const nextMatch = link.match(/&page=(\d+)>; rel="next"/);
      if (nextMatch && nextMatch[1]) {
        return parseInt(nextMatch[1], 10);
      }

      // As a final fallback, return 0 if we cannot parse
      return 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to get open PR count for ${owner}/${repo}: ${errorMessage}`);
      return 0;
    }
  }
} 