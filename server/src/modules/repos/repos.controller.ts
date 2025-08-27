import { Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ReposService } from './repos.service';
import { AddRepoDto } from '../../common/dto/add-repo.dto';
import { GitHubOAuthService } from '../../common/utils/github-oauth.service';

@Controller('repos')
export class ReposController {
  constructor(
    private readonly reposService: ReposService,
    private readonly githubOAuthService: GitHubOAuthService,
  ) {}

  // Guest mode: Add repository and get stats
  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  async addRepoGuest(@Body() addRepoDto: AddRepoDto) {
    return this.reposService.addRepoGuest(addRepoDto);
  }

  // Guest mode: Get all guest repository stats
  @Get('guest/stats')
  async getGuestRepoStats() {
    return this.reposService.getAllGuestRepoStats();
  }

  // Guest mode: Get stats for a specific repository
  @Get('guest/:name/stats')
  async getGuestRepoStatsByName(@Param('name') name: string) {
    return this.reposService.getRepoStats(name);
  }

  // Connected mode: Get OAuth URL for GitHub authentication
  @Get('auth/url')
  getOAuthUrl() {
    const state = Math.random().toString(36).substring(7);
    const url = this.githubOAuthService.getOAuthUrl(state);
    return { url, state };
  }

  // Connected mode: Handle OAuth callback
  @Post('auth/callback')
  async handleOAuthCallback(@Body() body: { code: string; state: string }) {
    // This would typically handle the OAuth flow and create/update user
    // For now, we'll return a placeholder response
    return { message: 'OAuth callback received', code: body.code, state: body.state };
  }

  // Connected mode: Get user repositories (requires authentication)
  @Get('user')
  async getUserRepositories(@Request() req: any) {
    // This would require authentication middleware
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.reposService.getUserRepositories(userId);
  }

  // Connected mode: Sync user repositories from GitHub
  @Post('user/sync')
  async syncUserRepositories(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.reposService.syncUserRepositories(userId);
  }

  // Connected mode: Get all user repository stats
  @Get('user/stats')
  async getUserRepoStats(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.reposService.getAllUserRepoStats(userId);
  }

  // Connected mode: Get stats for a specific user repository
  @Get('user/:name/stats')
  async getUserRepoStatsByName(@Param('name') name: string, @Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.reposService.getRepoStats(name, userId);
  }

  // Health check endpoint
  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
