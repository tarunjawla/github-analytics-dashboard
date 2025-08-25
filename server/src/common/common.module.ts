import { Module } from '@nestjs/common';
import { CacheService } from './utils/cache.service';
import { MetricsService } from './utils/metrics.service';

@Module({
  providers: [CacheService, MetricsService],
  exports: [CacheService, MetricsService],
})
export class CommonModule {}
