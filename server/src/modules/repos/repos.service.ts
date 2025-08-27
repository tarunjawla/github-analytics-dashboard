import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepoStats } from '../../common/entities/repo-stats.entity';
import { User } from '../../common/entities/user.entity';
import { Repository as RepoEntity } from '../../common/entities/repository.entity';
import { GitHubOAuthService } from '../../common/utils/github-oauth.service';
import { AddRepoDto } from '../../common/dto/add-repo.dto';
import { GitHubService } from '../../common/utils/github.service';

@Injectable()
export class ReposService {
  private readonly logger = new Logger(ReposService.name);

  constructor(
    @InjectRepository(RepoStats)
    private repoStatsRepository: Repository<RepoStats>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RepoEntity)
    private repositoryRepository: Repository<RepoEntity>,
    private githubOAuthService: GitHubOAuthService,
    private githubService: GitHubService,
  ) {}

  // Guest mode: Add repo and get stats without authentication
  async addRepoGuest(addRepoDto: AddRepoDto) {
    const { name } = addRepoDto;
    const [owner, repo] = name.split('/');

    try {
      // Fetch repo data from GitHub
      const repoData = await this.githubService.getRepository(owner, repo);
      // Count open PRs and adjust issues to exclude PRs
      const openPrs = await this.githubService.getOpenPullRequestsCount(owner, repo);
      const contributorsCount = await this.githubService.getContributorsCount(owner, repo);

      // Create stats entry
      const stats = this.repoStatsRepository.create({
        repo_name: name,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: Math.max(0, repoData.open_issues_count - openPrs),
        contributors: contributorsCount,
      });

      await this.repoStatsRepository.save(stats);

      return {
        ...repoData,
        // Ensure open issues excludes PRs for client display
        open_issues_count: Math.max(0, repoData.open_issues_count - openPrs),
        open_prs_count: openPrs,
        contributors: contributorsCount,
        stats: [stats],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to add repo ${name}: ${errorMessage}`);
      throw error;
    }
  }

  // Connected mode: Get all repos for authenticated user
  async getUserRepositories(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['repositories'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.repositories;
  }

  // Connected mode: Sync user repositories from GitHub
  async syncUserRepositories(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.access_token) {
      throw new NotFoundException('User not found or not authenticated');
    }

    try {
      // Fetch repos from GitHub
      const githubRepos = await this.githubOAuthService.getUserRepositories(
        user.access_token,
        user.username
      );

      // Update or create repositories
      for (const githubRepo of githubRepos) {
        let repo = await this.repositoryRepository.findOne({
          where: { github_id: githubRepo.id, user_id: userId },
        });

        if (repo) {
          // Update existing repo
          Object.assign(repo, {
            name: githubRepo.name,
            full_name: githubRepo.full_name,
            description: githubRepo.description,
            html_url: githubRepo.html_url,
            stargazers_count: githubRepo.stargazers_count,
            forks_count: githubRepo.forks_count,
            open_issues_count: githubRepo.open_issues_count,
            language: githubRepo.language,
            updated_at: new Date(githubRepo.updated_at),
            last_synced: new Date(),
          });
        } else {
          // Create new repo
          repo = this.repositoryRepository.create({
            github_id: githubRepo.id,
            name: githubRepo.name,
            full_name: githubRepo.full_name,
            description: githubRepo.description,
            html_url: githubRepo.html_url,
            stargazers_count: githubRepo.stargazers_count,
            forks_count: githubRepo.forks_count,
            open_issues_count: githubRepo.open_issues_count,
            language: githubRepo.language,
            updated_at: new Date(githubRepo.updated_at),
            last_synced: new Date(),
            user_id: userId,
          });
        }

        await this.repositoryRepository.save(repo);

        // Create stats entry
        const stats = this.repoStatsRepository.create({
          repo_name: githubRepo.full_name,
          stars: githubRepo.stargazers_count,
          forks: githubRepo.forks_count,
          issues: githubRepo.open_issues_count,
          contributors: 0, // Will be fetched separately
          repository_id: repo.id,
        });

        await this.repoStatsRepository.save(stats);
      }

      return { message: 'Repositories synced successfully', count: githubRepos.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to sync repositories for user ${userId}: ${errorMessage}`);
      throw error;
    }
  }

  // Get stats for a specific repository
  async getRepoStats(repoName: string, userId?: number) {
    let query = this.repoStatsRepository
      .createQueryBuilder('stats')
      .where('stats.repo_name = :repoName', { repoName })
      .orderBy('stats.timestamp', 'DESC');

    if (userId) {
      // For connected users, check if they have access to this repo
      query = query
        .innerJoin('stats.repository', 'repo')
        .andWhere('repo.user_id = :userId', { userId });
    }

    const stats = await query.getMany();
    
    if (stats.length === 0) {
      throw new NotFoundException(`No stats found for repository ${repoName}`);
    }

    return stats;
  }

  // Get all stats for connected user
  async getAllUserRepoStats(userId: number) {
    const stats = await this.repoStatsRepository
      .createQueryBuilder('stats')
      .innerJoin('stats.repository', 'repo')
      .where('repo.user_id = :userId', { userId })
      .orderBy('stats.timestamp', 'DESC')
      .getMany();

    return stats;
  }

  // Get all guest repo stats (no user authentication)
  async getAllGuestRepoStats() {
    const stats = await this.repoStatsRepository
      .createQueryBuilder('stats')
      .where('stats.repository_id IS NULL')
      .orderBy('stats.timestamp', 'DESC')
      .getMany();

    return stats;
  }
}
