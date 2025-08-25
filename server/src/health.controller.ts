import { Controller, Get } from "@nestjs/common";
import { GitHubService } from "./common/utils/github.service";

@Controller("health")
export class HealthController {
  constructor(private readonly githubService: GitHubService) {}

  @Get()
  async healthCheck() {
    const githubInfo = this.githubService.getRateLimitInfo();

    return {
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        github: githubInfo,
      },
      message: "Service is healthy",
    };
  }
}
