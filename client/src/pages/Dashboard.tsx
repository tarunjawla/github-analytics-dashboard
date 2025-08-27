import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRepoStore } from "../store/useRepoStore";
import {
  formatNumber,
  getLatestStats,
  formatTimeSeriesData,
} from "../utils/chartHelpers";
import type { ChartDataPoint, AppMode } from "../types";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const Dashboard: React.FC = () => {
  const {
    mode,
    repositories,
    guestRepos,
    repoStats,
    loading,
    error,
    dashboardStats,
    setMode,
    addRepoGuest,
    fetchGuestRepoStats,
    connectGitHub,
    fetchUserRepositories,
    syncUserRepositories,
    fetchUserRepoStats,
    clearError,
  } = useRepoStore();

  const [newRepoName, setNewRepoName] = useState("");
  const [selectedMetric, setSelectedMetric] = useState<
    "stars" | "forks" | "issues" | "contributors"
  >("stars");

  useEffect(() => {
    if (mode === "guest") {
      fetchGuestRepoStats();
    } else {
      fetchUserRepositories();
      fetchUserRepoStats();
    }
  }, [mode, fetchGuestRepoStats, fetchUserRepositories, fetchUserRepoStats]);

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRepoName.trim()) {
      if (mode === "guest") {
        await addRepoGuest(newRepoName.trim());
      }
      setNewRepoName("");
    }
  };

  const handleConnectGitHub = async () => {
    await connectGitHub();
  };

  const handleModeSwitch = (newMode: AppMode) => {
    setMode(newMode);
  };

  const currentRepos = mode === "guest" ? guestRepos : repositories;
  const latestStats = getLatestStats(repoStats);
  const timeSeriesData = formatTimeSeriesData(repoStats, selectedMetric);

  // Generate dummy data for initial display
  const dummyData: ChartDataPoint[] = [
    { name: "React", value: 200000, date: "2024-01-01" },
    { name: "Vue", value: 180000, date: "2024-01-01" },
    { name: "Angular", value: 90000, date: "2024-01-01" },
    { name: "Svelte", value: 70000, date: "2024-01-01" },
  ];

  const dummyTimeSeries = [
    { name: "Jan", value: 1000, date: "2024-01-01" },
    { name: "Feb", value: 1200, date: "2024-02-01" },
    { name: "Mar", value: 1100, date: "2024-03-01" },
    { name: "Apr", value: 1400, date: "2024-04-01" },
    { name: "May", value: 1300, date: "2024-05-01" },
    { name: "Jun", value: 1600, date: "2024-06-01" },
  ];

  if (loading && currentRepos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                GitHub Analytics Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your repository metrics and performance
              </p>
            </div>

            {/* Mode Switch */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleModeSwitch("guest")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "guest"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Guest Mode
                </button>
                <button
                  onClick={() => handleModeSwitch("connected")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "connected"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Connected
                </button>
              </div>

              {/* Action Buttons */}
              {mode === "guest" ? (
                <form onSubmit={handleAddRepo} className="flex space-x-2">
                  <input
                    type="text"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    placeholder="Enter repo name (e.g., facebook/react)"
                    className="input w-64"
                  />
                  <button type="submit" className="btn-primary">
                    Add Repo
                  </button>
                </form>
              ) : (
                <div className="flex space-x-2">
                  <button onClick={handleConnectGitHub} className="btn-primary">
                    Connect GitHub
                  </button>
                  <button
                    onClick={syncUserRepositories}
                    className="btn-secondary"
                  >
                    Sync Repos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Info */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {mode === "guest" ? "Guest Mode" : "Connected Mode"}
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  {mode === "guest"
                    ? "Add individual repositories to track their stats. Data is stored locally."
                    : "Connect your GitHub account to automatically sync all your repositories."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Repos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(dashboardStats.totalRepos)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stars</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(dashboardStats.totalStars)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Forks</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(dashboardStats.totalForks)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(dashboardStats.totalIssues)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Contributors
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(dashboardStats.totalContributors)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Repository Stars Comparison */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repository Stars Comparison
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    currentRepos.length > 0
                      ? currentRepos.slice(0, 10)
                      : dummyData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatNumber(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="stargazers_count" fill="#3B82F6" name="Stars" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Metrics Over Time
              </h3>
              <select
                value={selectedMetric}
                onChange={(e) =>
                  setSelectedMetric(e.target.value as typeof selectedMetric)
                }
                className="input w-32"
              >
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="issues">Issues</option>
                <option value="contributors">Contributors</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    timeSeriesData.length > 0 ? timeSeriesData : dummyTimeSeries
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatNumber(value as number)}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Repository Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repository Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={
                      currentRepos.length > 0
                        ? currentRepos.slice(0, 6)
                        : dummyData
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="stargazers_count"
                  >
                    {currentRepos.length > 0
                      ? currentRepos
                          .slice(0, 6)
                          .map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))
                      : dummyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatNumber(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {currentRepos.length > 0 ? (
                currentRepos.slice(0, 5).map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {repo.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Updated{" "}
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(repo.stargazers_count)}
                      </p>
                      <p className="text-xs text-gray-500">stars</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="mt-2">
                    {mode === "guest"
                      ? "No repositories added yet"
                      : "No repositories connected yet"}
                  </p>
                  <p className="text-sm">
                    {mode === "guest"
                      ? "Add a repository to see activity here"
                      : "Connect your GitHub account to see your repositories"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
