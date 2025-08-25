import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RepoStats } from "../../common/entities/repo-stats.entity";
import { GitHubService, GitHubRepo } from "../github/github.service";
import { AddRepoDto, AddRepoResponseDto } from "../../common/dto/add-repo.dto";

@Injectable()
export class ReposService {
  private readonly logger = new Logger(ReposService.name);
  private readonly trackedRepos = new Set<string>();

  constructor(
    @InjectRepository(RepoStats)
    private repoStatsRepository: Repository<RepoStats>,
    private githubService: GitHubService
  ) {
    this.initializeTrackedRepos();
  }

  private async initializeTrackedRepos() {
    try {
      const repos = await this.repoStatsRepository
        .createQueryBuilder("stats")
        .select("DISTINCT stats.repo_name", "repo_name")
        .getRawMany();

      repos.forEach(({ repo_name }) => this.trackedRepos.add(repo_name));
      this.logger.log(
        `Initialized ${this.trackedRepos.size} tracked repositories`
      );
    } catch (error) {
      this.logger.error("Failed to initialize tracked repos:", error);
    }
  }

  async addRepo(addRepoDto: AddRepoDto): Promise<AddRepoResponseDto> {
    const { name } = addRepoDto;

    // Check if repo is already being tracked
    if (this.trackedRepos.has(name)) {
      throw new Error(`Repository ${name} is already being tracked`);
    }

    try {
      // Fetch repository data from GitHub
      const [owner, repo] = name.split("/");
      const { repo: githubRepo, contributors } =
        await this.githubService.getRepositoryStats(owner, repo);

      // Create initial stats record
      const repoStats = this.repoStatsRepository.create({
        repo_name: name,
        stars: githubRepo.stargazers_count,
        forks: githubRepo.forks_count,
        issues: githubRepo.open_issues_count,
        contributors: contributors.length,
        language: githubRepo.language,
        description: githubRepo.description,
        html_url: githubRepo.html_url,
      });

      await this.repoStatsRepository.save(repoStats);
      this.trackedRepos.add(name);

      this.logger.log(`Added repository ${name} to tracking`);

      return {
        id: githubRepo.id,
        name: githubRepo.name,
        full_name: githubRepo.full_name,
        description: githubRepo.description,
        html_url: githubRepo.html_url,
        stargazers_count: githubRepo.stargazers_count,
        forks_count: githubRepo.forks_count,
        open_issues_count: githubRepo.open_issues_count,
        language: githubRepo.language,
        updated_at: githubRepo.updated_at,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Failed to add repository ${name}:`, error);
      throw new Error(`Failed to add repository: ${errorMessage}`);
    }
  }

  async getRepos(): Promise<AddRepoResponseDto[]> {
    try {
      const latestStats = await this.repoStatsRepository
        .createQueryBuilder("stats")
        .select("DISTINCT ON (stats.repo_name) stats.*")
        .orderBy("stats.repo_name")
        .addOrderBy("stats.timestamp", "DESC")
        .getRawMany();

      return latestStats.map((stats) => ({
        id: stats.id,
        name: stats.repo_name.split("/")[1],
        full_name: stats.repo_name,
        description: stats.description,
        html_url: stats.html_url,
        stargazers_count: stats.stars,
        forks_count: stats.forks,
        open_issues_count: stats.issues,
        language: stats.language,
        updated_at: stats.updated_at,
      }));
    } catch (error) {
      this.logger.error("Failed to get repositories:", error);
      throw new Error("Failed to get repositories");
    }
  }

  async getRepoStats(repoName: string): Promise<RepoStats[]> {
    try {
      const stats = await this.repoStatsRepository.find({
        where: { repo_name: repoName },
        order: { timestamp: "DESC" },
      });

      if (stats.length === 0) {
        throw new NotFoundException(
          `No stats found for repository ${repoName}`
        );
      }

      return stats;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get stats for repository ${repoName}:`,
        error
      );
      throw new Error("Failed to get repository stats");
    }
  }

  async getAllRepoStats(): Promise<RepoStats[]> {
    try {
      return await this.repoStatsRepository.find({
        order: { timestamp: "DESC" },
      });
    } catch (error) {
      this.logger.error("Failed to get all repository stats:", error);
      throw new Error("Failed to get all repository stats");
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateAllRepoStats() {
    this.logger.log("Starting daily repository stats update");

    for (const repoName of this.trackedRepos) {
      try {
        await this.updateRepoStats(repoName);
        // Add delay to avoid hitting GitHub API rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Failed to update stats for ${repoName}:`, error);
      }
    }

    this.logger.log("Completed daily repository stats update");
  }

  private async updateRepoStats(repoName: string): Promise<void> {
    try {
      const [owner, repo] = repoName.split("/");
      const { repo: githubRepo, contributors } =
        await this.githubService.getRepositoryStats(owner, repo);

      const repoStats = this.repoStatsRepository.create({
        repo_name: repoName,
        stars: githubRepo.stargazers_count,
        forks: githubRepo.forks_count,
        issues: githubRepo.open_issues_count,
        contributors: contributors.length,
        language: githubRepo.language,
        description: githubRepo.description,
        html_url: githubRepo.html_url,
      });

      await this.repoStatsRepository.save(repoStats);
      this.logger.log(`Updated stats for repository ${repoName}`);
    } catch (error) {
      this.logger.error(
        `Failed to update stats for repository ${repoName}:`,
        error
      );
      throw error;
    }
  }

  async getTrackedRepos(): Promise<string[]> {
    return Array.from(this.trackedRepos);
  }
}
