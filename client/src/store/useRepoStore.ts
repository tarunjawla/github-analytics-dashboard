import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Repository, RepoStats, GuestRepo, AppMode } from "../types";
import { apiService } from "../services/api";

interface RepoState {
  mode: AppMode;
  repositories: Repository[];
  guestRepos: GuestRepo[];
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
  setMode: (mode: AppMode) => void;

  // Guest mode actions
  addRepoGuest: (repoName: string) => Promise<void>;
  fetchGuestRepoStats: () => Promise<void>;

  // Connected mode actions
  connectGitHub: () => Promise<void>;
  fetchUserRepositories: () => Promise<void>;
  syncUserRepositories: () => Promise<void>;
  fetchUserRepoStats: () => Promise<void>;

  // Common actions
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
      mode: "guest",
      repositories: [],
      guestRepos: [],
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
      setMode: (mode: AppMode) => set({ mode }),

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Guest mode actions
      addRepoGuest: async (repoName: string) => {
        try {
          set({ loading: true, error: null });
          const repo = await apiService.addRepoGuest(repoName);
          set((state) => ({
            guestRepos: [...state.guestRepos, repo],
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

      fetchGuestRepoStats: async () => {
        try {
          set({ loading: true, error: null });
          const stats = await apiService.getGuestRepoStats();
          set({ repoStats: stats });
          get().calculateDashboardStats();
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

      // Connected mode actions
      connectGitHub: async () => {
        try {
          set({ loading: true, error: null });
          const oauthData = await apiService.getOAuthUrl();

          // Store state for OAuth callback
          localStorage.setItem("oauth_state", oauthData.state);

          // Redirect to GitHub OAuth
          window.location.href = oauthData.url;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to connect to GitHub";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      fetchUserRepositories: async () => {
        try {
          set({ loading: true, error: null });
          const repos = await apiService.getUserRepositories();
          set({ repositories: repos });
          get().calculateDashboardStats();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user repositories";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      syncUserRepositories: async () => {
        try {
          set({ loading: true, error: null });
          await apiService.syncUserRepositories();
          // Refresh repositories after sync
          await get().fetchUserRepositories();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to sync repositories";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      fetchUserRepoStats: async () => {
        try {
          set({ loading: true, error: null });
          const stats = await apiService.getUserRepoStats();
          set({ repoStats: stats });
          get().calculateDashboardStats();
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user repository stats";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      calculateDashboardStats: () => {
        const { mode, repositories, guestRepos, repoStats } = get();

        let totalRepos = 0;
        let totalStars = 0;
        let totalForks = 0;
        let totalIssues = 0;
        let totalContributors = 0;

        if (mode === "guest") {
          totalRepos = guestRepos.length;
          totalStars = guestRepos.reduce(
            (sum, repo) => sum + repo.stargazers_count,
            0
          );
          totalForks = guestRepos.reduce(
            (sum, repo) => sum + repo.forks_count,
            0
          );
          totalIssues = guestRepos.reduce(
            (sum, repo) => sum + repo.open_issues_count,
            0
          );
          totalContributors = guestRepos.reduce(
            (sum, repo) => sum + repo.contributors,
            0
          );
        } else {
          totalRepos = repositories.length;
          totalStars = repositories.reduce(
            (sum, repo) => sum + repo.stargazers_count,
            0
          );
          totalForks = repositories.reduce(
            (sum, repo) => sum + repo.forks_count,
            0
          );
          totalIssues = repositories.reduce(
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

          totalContributors = Array.from(latestStats.values()).reduce(
            (sum, stat) => sum + stat.contributors,
            0
          );
        }

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
