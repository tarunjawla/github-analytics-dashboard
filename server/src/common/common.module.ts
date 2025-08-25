import { Module } from '@nestjs/common';
import { CacheService } from './utils/cache.service';
import { MetricsService } from './utils/metrics.service';
import { SchedulerService } from './utils/scheduler.service';
import { MetricsController } from './controllers/metrics.controller';

@Module({
  controllers: [MetricsController],
  providers: [CacheService, MetricsService, SchedulerService],
  exports: [CacheService, MetricsService, SchedulerService],
})
export class CommonModule {}
