import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReposController } from "./repos.controller";
import { ReposService } from "./repos.service";
import { RepoStats } from "../../common/entities/repo-stats.entity";
import { GitHubModule } from "../github/github.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([RepoStats]),
    GitHubModule,
  ],
  controllers: [ReposController],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
