import { Injectable, Logger } from '@nestjs/common';

export interface ApiCall {
  endpoint: string;
  timestamp: number;
  duration: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface GitHubApiMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  lastCall: number;
  rateLimitRemaining: number;
  rateLimitReset: number;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly apiCalls: ApiCall[] = [];
  private readonly maxApiCalls = 1000; // Keep last 1000 calls
  private readonly githubMetrics: GitHubApiMetrics = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    averageResponseTime: 0,
    lastCall: 0,
    rateLimitRemaining: 0,
    rateLimitReset: 0,
  };

  recordApiCall(
    endpoint: string,
    duration: number,
    status: 'success' | 'error',
    errorMessage?: string,
  ): void {
    try {
      const apiCall: ApiCall = {
        endpoint,
        timestamp: Date.now(),
        duration,
        status,
        errorMessage,
      };

      this.apiCalls.push(apiCall);
      this.githubMetrics.totalCalls++;
      this.githubMetrics.lastCall = apiCall.timestamp;

      if (status === 'success') {
        this.githubMetrics.successfulCalls++;
      } else {
        this.githubMetrics.failedCalls++;
      }

      // Update average response time
      this.updateAverageResponseTime(duration);

      // Keep only the last maxApiCalls
      if (this.apiCalls.length > this.maxApiCalls) {
        this.apiCalls.splice(0, this.apiCalls.length - this.maxApiCalls);
      }

      this.logger.debug(`Recorded API call: ${endpoint} - ${status} (${duration}ms)`);
    } catch (error) {
      this.logger.error('Failed to record API call:', error);
    }
  }

  updateRateLimitInfo(remaining: number, reset: number): void {
    try {
      this.githubMetrics.rateLimitRemaining = remaining;
      this.githubMetrics.rateLimitReset = reset;
      this.logger.debug(`Updated rate limit info: ${remaining} remaining, reset at ${new Date(reset * 1000)}`);
    } catch (error) {
      this.logger.error('Failed to update rate limit info:', error);
    }
  }

  getApiCallMetrics(): {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageResponseTime: number;
    recentCalls: ApiCall[];
  } {
    try {
      const recentCalls = this.apiCalls.slice(-100); // Last 100 calls
      
      return {
        totalCalls: this.githubMetrics.totalCalls,
        successfulCalls: this.githubMetrics.successfulCalls,
        failedCalls: this.githubMetrics.failedCalls,
        averageResponseTime: this.githubMetrics.averageResponseTime,
        recentCalls,
      };
    } catch (error) {
      this.logger.error('Failed to get API call metrics:', error);
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        recentCalls: [],
      };
    }
  }

  getGitHubMetrics(): GitHubApiMetrics {
    return { ...this.githubMetrics };
  }

  getEndpointMetrics(endpoint: string): {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageResponseTime: number;
  } {
    try {
      const endpointCalls = this.apiCalls.filter(call => call.endpoint === endpoint);
      const successfulCalls = endpointCalls.filter(call => call.status === 'success');
      const failedCalls = endpointCalls.filter(call => call.status === 'error');
      
      const totalDuration = endpointCalls.reduce((sum, call) => sum + call.duration, 0);
      const averageResponseTime = endpointCalls.length > 0 ? totalDuration / endpointCalls.length : 0;

      return {
        totalCalls: endpointCalls.length,
        successfulCalls: successfulCalls.length,
        failedCalls: failedCalls.length,
        averageResponseTime,
      };
    } catch (error) {
      this.logger.error(`Failed to get endpoint metrics for ${endpoint}:`, error);
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
      };
    }
  }

  resetMetrics(): void {
    try {
      this.apiCalls.length = 0;
      this.githubMetrics.totalCalls = 0;
      this.githubMetrics.successfulCalls = 0;
      this.githubMetrics.failedCalls = 0;
      this.githubMetrics.averageResponseTime = 0;
      this.githubMetrics.lastCall = 0;
      this.githubMetrics.rateLimitRemaining = 0;
      this.githubMetrics.rateLimitReset = 0;
      
      this.logger.log('Metrics reset successfully');
    } catch (error) {
      this.logger.error('Failed to reset metrics:', error);
    }
  }

  private updateAverageResponseTime(duration: number): void {
    try {
      const currentTotal = this.githubMetrics.averageResponseTime * (this.githubMetrics.totalCalls - 1);
      this.githubMetrics.averageResponseTime = (currentTotal + duration) / this.githubMetrics.totalCalls;
    } catch (error) {
      this.logger.error('Failed to update average response time:', error);
    }
  }
}
