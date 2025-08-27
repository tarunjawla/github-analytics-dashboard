export interface RepoStats {
  id: number;
  repo_name: string;
  stars: number;
  forks: number;
  issues: number;
  contributors: number;
  language?: string;
  description?: string;
  html_url?: string;
  timestamp: string;
  updated_at?: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date: string;
}

export interface DashboardStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalIssues: number;
  totalContributors: number;
}

// New types for the dual mode system
export interface GuestRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
  contributors: number;
  stats: RepoStats[];
}

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
  name: string;
}

export interface OAuthUrl {
  url: string;
  state: string;
}

export type AppMode = "guest" | "connected";
