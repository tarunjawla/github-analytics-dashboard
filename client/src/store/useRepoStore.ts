import { trim } from "lodash";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiService } from "../services/api";
import type { AppMode, GuestRepo, Repository, RepoStats } from "../types";

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
    totalOpenPRs: number;
    totalContributors: number;
  };
}

interface RepoActions {
  setMode: (mode: AppMode) => void;

  // Guest mode actions
  addRepoGuest: (repoName: string) => Promise<void>;
  removeRepoGuest: (repoFullName: string) => void;
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
      // Local storage keys
      _guestReposKey: "ga_guest_repos",
      _guestStatsKey: "ga_guest_repo_stats",
      _modeKey: "ga_app_mode",

      // Safe JSON helpers
      _loadArray: <T,>(key: string): T[] => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return [] as T[];
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? (parsed as T[]) : [];
        } catch {
          return [] as T[];
        }
      },
      _saveArray: <T,>(key: string, value: T[]): void => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {}
      },
      _loadMode: (): AppMode => {
        const raw = localStorage.getItem("ga_app_mode");
        return raw === "connected" ? "connected" : "guest";
      },
      _saveMode: (mode: AppMode): void => {
        try {
          localStorage.setItem("ga_app_mode", mode);
        } catch {}
      },
      // Helper: normalize any GitHub input into owner/repo
      // Supports: https URLs, SSH, raw owner/repo, with or without .git
      // Examples:
      //  - https://github.com/facebook/react -> facebook/react
      //  - git@github.com:facebook/react.git -> facebook/react
      //  - facebook/react -> facebook/react
      normalizeRepoInput: (input: string): string => {
        let value: string = trim(input).toLowerCase();

        // SSH form: git@github.com:owner/repo(.git)?
        if (value.startsWith("git@github.com:")) {
          value = value.replace("git@github.com:", "");
        }

        // If it looks like a URL, try URL parsing
        if (value.startsWith("http://") || value.startsWith("https://")) {
          try {
            const url = new URL(value);
            const parts = url.pathname.split("/").filter(Boolean);
            if (parts.length >= 2) {
              value = `${parts[0]}/${parts[1]}`;
            }
          } catch {
            // Fallback to pattern handling below
          }
        }

        // If still contains github.com path without protocol
        if (value.includes("github.com")) {
          const idx = value.indexOf("github.com");
          const path = value.slice(idx + "github.com".length);
          const parts = path.split("/").filter(Boolean);
          if (parts.length >= 2) {
            value = `${parts[0]}/${parts[1]}`;
          }
        }

        // Drop trailing .git if present
        if (value.endsWith(".git")) {
          value = value.slice(0, -4);
        }

        return value;
      },
      // Initial state
      mode: ((): AppMode => {
        try {
          return (localStorage.getItem("ga_app_mode") as AppMode) || "guest";
        } catch {
          return "guest";
        }
      })(),
      repositories: [],
      guestRepos: ((): GuestRepo[] => {
        try {
          const raw = localStorage.getItem("ga_guest_repos");
          return raw ? (JSON.parse(raw) as GuestRepo[]) : [];
        } catch {
          return [];
        }
      })(),
      repoStats: ((): RepoStats[] => {
        try {
          const raw = localStorage.getItem("ga_guest_repo_stats");
          return raw ? (JSON.parse(raw) as RepoStats[]) : [];
        } catch {
          return [];
        }
      })(),
      loading: false,
      error: null,
      dashboardStats: {
        totalRepos: 0,
        totalStars: 0,
        totalForks: 0,
        totalIssues: 0,
        totalOpenPRs: 0,
        totalContributors: 0,
      },

      // Actions
      setMode: (mode: AppMode) => {
        try { localStorage.setItem("ga_app_mode", mode); } catch {}
        set({ mode });
      },

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Guest mode actions
      addRepoGuest: async (repoName: string) => {
        try {
          set({ loading: true, error: null });
          // Normalize input to owner/repo for backend validation
          const normalized = (get() as any).normalizeRepoInput(repoName);
          const repo = await apiService.addRepoGuest(normalized);
          set((state) => {
            const updated = [...state.guestRepos, repo];
            try { localStorage.setItem("ga_guest_repos", JSON.stringify(updated)); } catch {}
            return { guestRepos: updated };
          });
          get().calculateDashboardStats();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to add repository";
          set({ error: errorMessage });
        } finally {
          set({ loading: false });
        }
      },

      removeRepoGuest: (repoFullName: string) => {
        // Remove from guestRepos and persist
        set((state) => {
          const updatedRepos = state.guestRepos.filter((r) => r.full_name !== repoFullName);
          try { localStorage.setItem("ga_guest_repos", JSON.stringify(updatedRepos)); } catch {}
          return { guestRepos: updatedRepos };
        });

        // Remove related stats and persist
        set((state) => {
          const updatedStats = state.repoStats.filter((s) => s.repo_name !== repoFullName);
          try { localStorage.setItem("ga_guest_repo_stats", JSON.stringify(updatedStats)); } catch {}
          return { repoStats: updatedStats };
        });

        get().calculateDashboardStats();
      },

      fetchGuestRepoStats: async () => {
        try {
          set({ loading: true, error: null });
          const stats = await apiService.getGuestRepoStats();
          set(() => {
            try { localStorage.setItem("ga_guest_repo_stats", JSON.stringify(stats)); } catch {}
            return { repoStats: stats };
          });
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
        let totalOpenPRs = 0;
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
          totalOpenPRs = guestRepos.reduce(
            (sum, repo) => sum + (repo.open_prs_count || 0),
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
          totalOpenPRs = repositories.reduce(
            (sum, repo) => sum + (repo.open_prs_count || 0),
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
            totalOpenPRs,
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
