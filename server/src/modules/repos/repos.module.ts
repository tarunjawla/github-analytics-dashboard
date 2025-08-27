import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';
import { RepoStats } from '../../common/entities/repo-stats.entity';
import { User } from '../../common/entities/user.entity';
import { Repository as RepoEntity } from '../../common/entities/repository.entity';
import { GitHubOAuthService } from '../../common/utils/github-oauth.service';
import { GitHubService } from '../../common/utils/github.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepoStats, User, RepoEntity]),
  ],
  controllers: [ReposController],
  providers: [ReposService, GitHubOAuthService, GitHubService],
  exports: [ReposService],
})
export class ReposModule {}
