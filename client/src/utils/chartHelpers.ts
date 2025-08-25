import type { RepoStats, ChartDataPoint } from "../types";

export const formatChartData = (stats: RepoStats[]): ChartDataPoint[] => {
  return stats.map((stat) => ({
    name: stat.repo_name,
    value: stat.stars,
    date: new Date(stat.timestamp).toLocaleDateString(),
  }));
};

export const formatTimeSeriesData = (
  stats: RepoStats[],
  metric: keyof Pick<RepoStats, "stars" | "forks" | "issues" | "contributors">
): ChartDataPoint[] => {
  return stats
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((stat) => ({
      name: new Date(stat.timestamp).toLocaleDateString(),
      value: stat[metric],
      date: stat.timestamp,
    }));
};

export const groupStatsByRepo = (
  stats: RepoStats[]
): Map<string, RepoStats[]> => {
  const grouped = new Map<string, RepoStats[]>();

  stats.forEach((stat) => {
    const existing = grouped.get(stat.repo_name) || [];
    existing.push(stat);
    grouped.set(stat.repo_name, existing);
  });

  return grouped;
};

export const getLatestStats = (stats: RepoStats[]): RepoStats[] => {
  const latest = new Map<string, RepoStats>();

  stats.forEach((stat) => {
    const existing = latest.get(stat.repo_name);
    if (!existing || new Date(stat.timestamp) > new Date(existing.timestamp)) {
      latest.set(stat.repo_name, stat);
    }
  });

  return Array.from(latest.values());
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};
