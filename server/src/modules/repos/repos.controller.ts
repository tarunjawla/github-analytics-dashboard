import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ReposService } from "./repos.service";
import { AddRepoDto } from "../../common/dto/add-repo.dto";

@Controller("repos")
export class ReposController {
  constructor(private readonly reposService: ReposService) {}

  @Get()
  async getRepos() {
    try {
      const repos = await this.reposService.getRepos();
      return {
        success: true,
        data: repos,
        message: "Repositories retrieved successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve repositories";
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async addRepo(@Body() addRepoDto: AddRepoDto) {
    try {
      const repo = await this.reposService.addRepo(addRepoDto);
      return {
        success: true,
        data: repo,
        message: "Repository added successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add repository";
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(":name/stats")
  async getRepoStats(@Param("name") repoName: string) {
    try {
      const stats = await this.reposService.getRepoStats(repoName);
      return {
        success: true,
        data: stats,
        message: `Stats retrieved successfully for ${repoName}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve repository stats";
      const status = errorMessage.includes("No stats found")
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        status
      );
    }
  }

  @Get("stats")
  async getAllRepoStats() {
    try {
      const stats = await this.reposService.getAllRepoStats();
      return {
        success: true,
        data: stats,
        message: "All repository stats retrieved successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve all repository stats";
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("tracked/list")
  async getTrackedRepos() {
    try {
      const repos = await this.reposService.getTrackedRepos();
      return {
        success: true,
        data: repos,
        message: "Tracked repositories retrieved successfully",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to retrieve tracked repositories";
      throw new HttpException(
        {
          success: false,
          message: errorMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
