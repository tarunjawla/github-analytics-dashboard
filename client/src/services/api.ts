import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import { get as _get } from "lodash";
import type {
  ApiResponse,
  GuestRepo,
  OAuthUrl,
  RepoStats,
  Repository,
} from "../types";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem("auth_token");
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic GET request
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url);
      // Normalize: allow both wrapped { data } and raw array/object
      const data = _get(response, "data", {} as unknown);
      const normalized = (data && (data as any).data !== undefined) ? data : { data };
      return normalized as ApiResponse<T>;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      const responseError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(responseError.response?.data?.message || errorMessage);
    }
  }

  // Generic POST request
  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data);
      const resData = _get(response, "data", {} as unknown);
      const normalized = (resData && (resData as any).data !== undefined) ? resData : { data: resData };
      return normalized as ApiResponse<T>;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      const responseError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(responseError.response?.data?.message || errorMessage);
    }
  }

  // Guest mode endpoints
  async addRepoGuest(repoName: string): Promise<GuestRepo> {
    const response = await this.post<GuestRepo>("/repos/guest", {
      name: repoName,
    });
    return response.data;
  }

  async getGuestRepoStats(): Promise<RepoStats[]> {
    const response = await this.get<RepoStats[]>("/repos/guest/stats");
    return response.data;
  }

  async getGuestRepoStatsByName(repoName: string): Promise<RepoStats[]> {
    const response = await this.get<RepoStats[]>(
      `/repos/guest/${repoName}/stats`
    );
    return response.data;
  }

  // Connected mode endpoints
  async getOAuthUrl(): Promise<OAuthUrl> {
    const response = await this.get<OAuthUrl>("/repos/auth/url");
    return response.data;
  }

  async handleOAuthCallback(
    code: string,
    state: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>("/repos/auth/callback", {
      code,
      state,
    });
  }

  async getUserRepositories(): Promise<Repository[]> {
    const response = await this.get<Repository[]>("/repos/user");
    return response.data;
  }

  async syncUserRepositories(): Promise<
    ApiResponse<{ message: string; count: number }>
  > {
    return this.post<{ message: string; count: number }>("/repos/user/sync");
  }

  async getUserRepoStats(): Promise<RepoStats[]> {
    const response = await this.get<RepoStats[]>("/repos/user/stats");
    return response.data;
  }

  async getUserRepoStatsByName(repoName: string): Promise<RepoStats[]> {
    const response = await this.get<RepoStats[]>(
      `/repos/user/${repoName}/stats`
    );
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.get<{ status: string }>("/repos/health");
  }
}

export const apiService = new ApiService();
export default apiService;
