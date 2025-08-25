import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.configService.get('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  get port(): number {
    return this.configService.get('PORT', 3001);
  }

  get database() {
    return {
      host: this.configService.get('DB_HOST', 'localhost'),
      port: this.configService.get('DB_PORT', 5432),
      username: this.configService.get('DB_USER', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'postgres'),
      database: this.configService.get('DB_NAME', 'github_analytics'),
    };
  }

  get github() {
    return {
      token: this.configService.get('GITHUB_TOKEN'),
      baseUrl: 'https://api.github.com',
      userAgent: 'GitHub-Analytics-Dashboard',
    };
  }

  get cache() {
    return {
      ttl: this.configService.get('CACHE_TTL', 300000), // 5 minutes
      maxSize: this.configService.get('CACHE_MAX_SIZE', 1000),
    };
  }

  get metrics() {
    return {
      enabled: this.configService.get('METRICS_ENABLED', true),
      retentionDays: this.configService.get('METRICS_RETENTION_DAYS', 30),
    };
  }

  get cors() {
    return {
      origin: this.isDevelopment 
        ? ['http://localhost:5173', 'http://localhost:3000']
        : this.configService.get('CORS_ORIGIN', ''),
      credentials: true,
    };
  }
}
