import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { MetricsService } from '../utils/metrics.service';
import { CacheService } from '../utils/cache.service';

@Controller('metrics')
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async getMetrics() {
    try {
      this.logger.log('Fetching application metrics');
      
      const apiMetrics = this.metricsService.getApiCallMetrics();
      const githubMetrics = this.metricsService.getGitHubMetrics();
      const cacheStats = this.cacheService.getStats();

      return {
        success: true,
        data: {
          api: apiMetrics,
          github: githubMetrics,
          cache: cacheStats,
          timestamp: new Date().toISOString(),
        },
        message: 'Metrics retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metrics';
      this.logger.error(`Error fetching metrics: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('api')
  async getApiMetrics() {
    try {
      this.logger.log('Fetching API metrics');
      
      const metrics = this.metricsService.getApiCallMetrics();
      
      return {
        success: true,
        data: metrics,
        message: 'API metrics retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch API metrics';
      this.logger.error(`Error fetching API metrics: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('github')
  async getGitHubMetrics() {
    try {
      this.logger.log('Fetching GitHub metrics');
      
      const metrics = this.metricsService.getGitHubMetrics();
      
      return {
        success: true,
        data: metrics,
        message: 'GitHub metrics retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GitHub metrics';
      this.logger.error(`Error fetching GitHub metrics: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cache')
  async getCacheStats() {
    try {
      this.logger.log('Fetching cache statistics');
      
      const stats = this.cacheService.getStats();
      
      return {
        success: true,
        data: stats,
        message: 'Cache statistics retrieved successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cache statistics';
      this.logger.error(`Error fetching cache statistics: ${errorMessage}`);
      
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reset')
  async resetMetrics() {
    try {
      this.logger.log('Resetting metrics');
      
      this.metricsService.resetMetrics();
      this.cacheService.clear();
      
      return {
        success: true,
        data: { message: 'Metrics and cache reset successfully' },
        message: 'Reset completed successfully',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset metrics';
      this.logger.error(`Error resetting metrics: ${errorMessage}`);
      
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
