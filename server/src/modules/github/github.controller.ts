import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GitHubService } from './github.service';

@Controller('github')
export class GitHubController {
  private readonly logger = new Logger(GitHubController.name);

  constructor(private readonly githubService: GitHubService) {}

  @Get('repo/:owner/:name')
  async getRepository(
    @Param('owner') owner: string,
    @Param('name') name: string,
  ) {
    try {
      this.logger.log(`Fetching repository: ${owner}/${name}`);
      const repo = await this.githubService.getRepository(owner, name);
      
      return {
        success: true,
        data: repo,
        message: 'Repository information retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repository';
      this.logger.error(`Error fetching repository ${owner}/${name}: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('repo/:owner/:name/contributors')
  async getContributors(
    @Param('owner') owner: string,
    @Param('name') name: string,
  ) {
    try {
      this.logger.log(`Fetching contributors for: ${owner}/${name}`);
      const contributors = await this.githubService.getContributors(owner, name);
      
      return {
        success: true,
        data: contributors,
        message: 'Contributors retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contributors';
      this.logger.error(`Error fetching contributors for ${owner}/${name}: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('repo/:owner/:name/stats')
  async getRepositoryStats(
    @Param('owner') owner: string,
    @Param('name') name: string,
  ) {
    try {
      this.logger.log(`Fetching stats for: ${owner}/${name}`);
      const stats = await this.githubService.getRepositoryStats(owner, name);
      
      return {
        success: true,
        data: stats,
        message: 'Repository stats retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repository stats';
      this.logger.error(`Error fetching stats for ${owner}/${name}: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('rate-limit')
  async getRateLimitInfo() {
    try {
      this.logger.log('Fetching GitHub API rate limit information');
      const rateLimit = await this.githubService.getRateLimitInfo();
      
      return {
        success: true,
        data: rateLimit,
        message: 'Rate limit information retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rate limit info';
      this.logger.error(`Error fetching rate limit info: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/repos')
  async searchRepositories(@Query('q') query: string, @Query('sort') sort = 'stars') {
    try {
      if (!query) {
        throw new HttpException(
          {
            success: false,
            message: 'Search query is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(`Searching repositories with query: ${query}, sort: ${sort}`);
      
      // This would need to be implemented in the service
      // For now, returning a placeholder response
      return {
        success: true,
        data: {
          query,
          sort,
          message: 'Search functionality to be implemented',
        },
        message: 'Search request received',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search repositories';
      this.logger.error(`Error searching repositories: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
