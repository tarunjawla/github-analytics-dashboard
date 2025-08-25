import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import type { ApiResponse, RepoStats, Repository } from "../types";

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
      return response.data;
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
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      const responseError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(responseError.response?.data?.message || errorMessage);
    }
  }

  // Repository endpoints
  async getRepos(): Promise<ApiResponse<Repository[]>> {
    return this.get<Repository[]>("/repos");
  }

  async addRepo(repoName: string): Promise<ApiResponse<Repository>> {
    return this.post<Repository>("/repos", { name: repoName });
  }

  async getRepoStats(repoName: string): Promise<ApiResponse<RepoStats[]>> {
    return this.get<RepoStats[]>(`/repos/${repoName}/stats`);
  }

  async getAllRepoStats(): Promise<ApiResponse<RepoStats[]>> {
    return this.get<RepoStats[]>("/repos/stats");
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.get<{ status: string }>("/health");
  }
}

export const apiService = new ApiService();
export default apiService;
