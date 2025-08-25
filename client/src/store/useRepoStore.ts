import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Repository, RepoStats } from "../types";
import { apiService } from "../services/api";

interface RepoState {
  repositories: Repository[];
  repoStats: RepoStats[];
  loading: boolean;
  error: string | null;
  dashboardStats: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalIssues: number;
    totalContributors: number;
  };
}

interface RepoActions {
  fetchRepos: () => Promise<void>;
  addRepo: (repoName: string) => Promise<void>;
  fetchRepoStats: (repoName: string) => Promise<void>;
  fetchAllRepoStats: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  calculateDashboardStats: () => void;
}

type RepoStore = RepoState & RepoActions;

export const useRepoStore = create<RepoStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      repositories: [],
      repoStats: [],
      loading: false,
      error: null,
      dashboardStats: {
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        totalIssues: 0,
        totalContributors: 0,
      },

      // Actions
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      fetchRepos: async () => {
        try {
          set({ loading: true, error: null });
          const response = await apiService.getRepos();
          set({ repositories: response.data });
          get().calculateDashboardStats();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch repositories";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      addRepo: async (repoName: string) => {
        try {
          set({ loading: true, error: null });
          const response = await apiService.addRepo(repoName);
          set((state) => ({
            repositories: [...state.repositories, response.data],
          }));
          get().calculateDashboardStats();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to add repository";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      fetchRepoStats: async (repoName: string) => {
        try {
          set({ loading: true, error: null });
          const response = await apiService.getRepoStats(repoName);
          set((state) => ({
            repoStats: [
              ...state.repoStats.filter((stat) => stat.repo_name !== repoName),
              ...response.data,
            ],
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch repository stats";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      fetchAllRepoStats: async () => {
        try {
          set({ loading: true, error: null });
          const response = await apiService.getAllRepoStats();
          set({ repoStats: response.data });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch repository stats";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      calculateDashboardStats: () => {
        const { repositories, repoStats } = get();

        const totalRepos = repositories.length;
        const totalStars = repositories.reduce(
          (sum, repo) => sum + repo.stargazers_count,
          0
        );
        const totalForks = repositories.reduce(
          (sum, repo) => sum + repo.forks_count,
          0
        );
        const totalIssues = repositories.reduce(
          (sum, repo) => sum + repo.open_issues_count,
          0
        );

        // Get the latest stats for each repo to calculate total contributors
        const latestStats = new Map<string, RepoStats>();
        repoStats.forEach((stat) => {
          const existing = latestStats.get(stat.repo_name);
          if (
            !existing ||
            new Date(stat.timestamp) > new Date(existing.timestamp)
          ) {
            latestStats.set(stat.repo_name, stat);
          }
        });

        const totalContributors = Array.from(latestStats.values()).reduce(
          (sum, stat) => sum + stat.contributors,
          0
        );

        set({
          dashboardStats: {
            totalRepos,
            totalStars,
            totalForks,
            totalIssues,
            totalContributors,
          },
        });
      },
    }),
    {
      name: "repo-store",
    }
  )
);
