import type { RepoStats, ChartDataPoint } from "../types";
import { defaultTo, sortBy, map as _map, forEach as _forEach } from "lodash";

export const formatChartData = (stats: RepoStats[] | undefined): ChartDataPoint[] => {
  const safeStats = defaultTo(stats, [] as RepoStats[]);
  return _map(safeStats, (stat) => ({
    name: stat.repo_name,
    value: stat.stars,
    date: new Date(stat.timestamp).toLocaleDateString(),
  }));
};

export const formatTimeSeriesData = (
  stats: RepoStats[] | undefined,
  metric: keyof Pick<RepoStats, "stars" | "forks" | "issues" | "contributors">
): ChartDataPoint[] => {
  const safeStats = defaultTo(stats, [] as RepoStats[]);
  const sorted = sortBy(safeStats, (s) => new Date(s.timestamp).getTime());
  return _map(sorted, (stat) => ({
    name: new Date(stat.timestamp).toLocaleDateString(),
    value: stat[metric],
    date: stat.timestamp,
  }));
};

export const groupStatsByRepo = (
  stats: RepoStats[] | undefined
): Map<string, RepoStats[]> => {
  const grouped = new Map<string, RepoStats[]>();

  _forEach(defaultTo(stats, [] as RepoStats[]), (stat) => {
    const existing = grouped.get(stat.repo_name) || [];
    existing.push(stat);
    grouped.set(stat.repo_name, existing);
  });

  return grouped;
};

export const getLatestStats = (stats: RepoStats[] | undefined): RepoStats[] => {
  const latest = new Map<string, RepoStats>();

  _forEach(defaultTo(stats, [] as RepoStats[]), (stat) => {
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
