import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface GitRef {
  ref: string; // refs/heads/main
  url: string;
  object: { sha: string; type: string; url: string };
}

export interface GitCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  parents: Array<{ sha: string }>;
  author?: { login?: string };
}

export interface TreeNode {
  id: string; // commit sha
  label: string; // short sha or message
  branch: string; // branch name
  message: string;
  author: string;
  date: string;
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
}

export interface RepoTree {
  branches: string[];
  nodes: TreeNode[];
  edges: TreeEdge[];
}

@Injectable()
export class TreeService {
  private readonly logger = new Logger(TreeService.name);
  private readonly api: AxiosInstance;
  private cache = new Map<string, { data: RepoTree; ts: number }>();

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('GITHUB_TOKEN');
    this.api = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: token ? `token ${token}` : undefined,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Analytics-Dashboard',
      },
      timeout: 30000,
    });
  }

  private cacheKey(owner: string, repo: string) {
    return `${owner}/${repo}`;
  }

  async getRepoTree(owner: string, repo: string, maxCommitsPerBranch = 50): Promise<RepoTree> {
    const key = this.cacheKey(owner, repo);
    const now = Date.now();
    const cached = this.cache.get(key);
    if (cached && now - cached.ts < 60_000) {
      return cached.data;
    }

    const refs = await this.fetchBranches(owner, repo);
    const branches = refs
      .filter(r => r.ref.startsWith('refs/heads/'))
      .map(r => r.ref.replace('refs/heads/', ''))
      .slice(0, 5); // limit to first 5 branches to avoid timeouts

    const nodes: TreeNode[] = [];
    const edges: TreeEdge[] = [];
    const seen = new Set<string>();

    for (const branch of branches) {
      const commits = await this.fetchCommits(owner, repo, branch, maxCommitsPerBranch);
      for (const c of commits) {
        if (!seen.has(c.sha)) {
          seen.add(c.sha);
          nodes.push({
            id: c.sha,
            label: c.sha.substring(0, 7),
            branch,
            message: c.commit.message,
            author: c.commit.author?.name || c.author?.login || 'unknown',
            date: c.commit.author?.date || '',
          });
        }
        for (const p of c.parents || []) {
          edges.push({ id: `${c.sha}-${p.sha}`, source: c.sha, target: p.sha });
        }
      }
    }

    const result: RepoTree = { branches, nodes, edges };
    this.cache.set(key, { data: result, ts: now });
    return result;
  }

  private async fetchBranches(owner: string, repo: string): Promise<GitRef[]> {
    const res = await this.api.get<GitRef[]>(`/repos/${owner}/${repo}/git/refs/heads`);
    return res.data;
  }

  private async fetchCommits(owner: string, repo: string, branch: string, perPage = 50): Promise<GitCommit[]> {
    const res = await this.api.get<GitCommit[]>(`/repos/${owner}/${repo}/commits`, {
      params: { sha: branch, per_page: perPage },
    });
    return res.data;
  }
}


