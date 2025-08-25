import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReposController } from "./repos.controller";
import { ReposService } from "./repos.service";
import { RepoStats } from "../../common/entities/repo-stats.entity";
import { GitHubService } from "../github/github.service";

@Module({
  imports: [TypeOrmModule.forFeature([RepoStats])],
  controllers: [ReposController],
  providers: [ReposService, GitHubService],
  exports: [ReposService],
})
export class ReposModule {}
