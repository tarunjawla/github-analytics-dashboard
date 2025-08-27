import type { RepoStats, ChartDataPoint } from "../types";
import { defaultTo, sortBy, map as _map, forEach as _forEach, groupBy } from "lodash";

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

// Build a 12-month series (last 12 months), bucketing by month and using the last value in each month.
export const formatYearTimeSeriesData = (
  stats: RepoStats[] | undefined,
  metric: keyof Pick<RepoStats, "stars" | "forks" | "issues" | "contributors">
): ChartDataPoint[] => {
  const safeStats = defaultTo(stats, [] as RepoStats[]);
  const byMonth = groupBy(safeStats, (s) => {
    const d = new Date(s.timestamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const points: ChartDataPoint[] = [];
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - 11); // include current month + 11 previous = 12 months
  start.setDate(1);

  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = byMonth[key] || [];
    let value = 0;
    if (bucket.length > 0) {
      const sorted = sortBy(bucket, (s) => new Date(s.timestamp).getTime());
      const last = sorted[sorted.length - 1];
      value = last[metric];
    }
    points.push({
      name: d.toLocaleString(undefined, { month: "short", year: "2-digit" }),
      value,
      date: new Date(d.getFullYear(), d.getMonth(), 1).toISOString(),
    });
  }

  return points;
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
