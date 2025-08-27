import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

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
  private: boolean;
  fork: boolean;
}

@Injectable()
export class GitHubOAuthService {
  private readonly logger = new Logger(GitHubOAuthService.name);
  private readonly api: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Analytics-Dashboard',
      },
    });
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
      const clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');

      if (!clientId || !clientSecret) {
        throw new Error('GitHub OAuth credentials not configured');
      }

      const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.data.error) {
        throw new Error(response.data.error_description || 'Failed to exchange code for token');
      }

      return response.data.access_token;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to exchange code for token: ${errorMessage}`);
      throw error;
    }
  }

  async getUserData(accessToken: string): Promise<GitHubUser> {
    try {
      const response = await this.api.get<GitHubUser>('/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to fetch user data: ${errorMessage}`);
      throw error;
    }
  }

  async getUserRepositories(accessToken: string, username: string): Promise<GitHubRepo[]> {
    try {
      const response = await this.api.get<GitHubRepo[]>(`/users/${username}/repos`, {
        headers: {
          'Authorization': `token ${accessToken}`,
        },
        params: {
          sort: 'updated',
          per_page: 100,
        },
      });
      
      // Filter out private repos and forks if needed
      return response.data.filter(repo => !repo.private);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to fetch user repositories: ${errorMessage}`);
      throw error;
    }
  }

  getOAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('GITHUB_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GITHUB_REDIRECT_URI', 'http://localhost:5173/auth/callback');
    
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user&state=${state}`;
  }
} 