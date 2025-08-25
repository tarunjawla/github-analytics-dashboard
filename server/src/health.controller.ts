import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  async healthCheck() {
    return {
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      message: "Service is healthy",
    };
  }
}
