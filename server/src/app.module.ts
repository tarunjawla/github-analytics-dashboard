import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReposModule } from './modules/repos/repos.module';
import { GitHubModule } from './modules/github/github.module';
import { CommonModule } from './common/common.module';
import { DatabaseConfig } from './config/database.config';
import { AppConfig } from './config/app.config';
import { HealthController } from './health.controller';
import { TreeModule } from './modules/tree/tree.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    ScheduleModule.forRoot(),
    CommonModule,
    GitHubModule,
    ReposModule,
    TreeModule,
  ],
  controllers: [HealthController],
  providers: [AppConfig],
})
export class AppModule {}
