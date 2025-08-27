import { Controller, Get, Param, Query } from '@nestjs/common';
import { TreeService } from './tree.service';

@Controller('repos')
export class TreeController {
  constructor(private readonly treeService: TreeService) {}

  @Get(':owner/:repo/tree')
  async getRepoTree(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('limit') limit?: string,
  ) {
    const max = limit ? Math.min(parseInt(limit, 10) || 50, 200) : 50;
    const data = await this.treeService.getRepoTree(owner, repo, max);
    return { success: true, data };
  }
}


