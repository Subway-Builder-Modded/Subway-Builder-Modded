'use client';

import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Layers3 } from 'lucide-react';
import {
  SortableNumberHeader,
  type SortDirection,
} from '@/components/shared/sortable-number-header';
import type { RailyardAnalyticsData } from '@/types/railyard-analytics';
import {
  compareSemver,
  formatCompactNumber,
  RAILYARD_ACCENT_COLOR,
  RailyardRankBadge,
  RailyardSectionHeader,
  SafeChartContainer,
  useClientReady,
} from './railyard-analytics-shared';

type SortField = 'version' | 'downloads' | 'share' | 'assets';

type VersionRow = {
  version: string;
  downloads: number;
  share: number;
  assets: number;
};

function sortRows(
  rows: VersionRow[],
  field: SortField,
  direction: SortDirection,
): VersionRow[] {
  const sorted = [...rows].sort((left, right) => {
    if (field === 'version') {
      const cmp = compareSemver(left.version, right.version);
      return direction === 'asc' ? cmp : -cmp;
    }

    const leftValue = left[field];
    const rightValue = right[field];
    if (leftValue !== rightValue) {
      return direction === 'asc'
        ? leftValue - rightValue
        : rightValue - leftValue;
    }

    const fallback = compareSemver(left.version, right.version);
    return direction === 'asc' ? fallback : -fallback;
  });

  return sorted;
}

export function RailyardAnalyticsVersionsSection({
  data,
}: {
  data: RailyardAnalyticsData;
}) {
  const isClientReady = useClientReady();
  const [sortField, setSortField] = useState<SortField>('downloads');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const rows = useMemo<VersionRow[]>(() => {
    const total = data.summary.totalDownloads;
    return data.versions.map((versionRow) => ({
      version: versionRow.version,
      downloads: versionRow.totalDownloads,
      share: total > 0 ? (versionRow.totalDownloads / total) * 100 : 0,
      assets: versionRow.assets.length,
    }));
  }, [data.summary.totalDownloads, data.versions]);

  const sortedRows = useMemo(
    () => sortRows(rows, sortField, sortDirection),
    [rows, sortDirection, sortField],
  );

  const chartMetric: SortField =
    sortField === 'version' ? 'downloads' : sortField;

  const chartMetricLabel =
    chartMetric === 'share'
      ? 'Share of Total'
      : chartMetric === 'assets'
        ? 'Assets'
        : 'Downloads';

  const chartTitle = `Top Versions by ${chartMetricLabel}`;

  const chartSourceRows =
    chartMetric === 'downloads'
      ? [...rows].sort((a, b) => b.downloads - a.downloads)
      : sortedRows;

  const chartRows = chartSourceRows.slice(0, 8).map((row) => ({
    version: `v${row.version}`,
    downloads: row.downloads,
    assets: row.assets,
    share: row.share,
    value:
      chartMetric === 'share'
        ? row.share
        : chartMetric === 'assets'
          ? row.assets
          : row.downloads,
  }));

  const toggleSort = (nextField: SortField) => {
    if (nextField === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(nextField);
    setSortDirection(nextField === 'version' ? 'desc' : 'desc');
  };

  return (
    <section className="mb-12">
      <RailyardSectionHeader icon={Layers3} title="Version Analytics" />

      <div className="mb-8 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {chartTitle}
        </p>
        <SafeChartContainer height={300}>
          {isClientReady ? (
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart
                data={chartRows}
                margin={{ top: 4, right: 12, bottom: 8, left: 0 }}
              >
                <CartesianGrid
                  horizontal
                  vertical={false}
                  stroke="var(--border)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="version"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickMargin={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) =>
                    chartMetric === 'share'
                      ? `${value.toFixed(1)}%`
                      : formatCompactNumber(value)
                  }
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', fillOpacity: 0.4 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as
                      | {
                          downloads: number;
                          assets: number;
                          share: number;
                        }
                      | undefined;
                    const metricValue =
                      chartMetric === 'share'
                        ? `${Number(payload[0]?.value ?? 0).toFixed(1)}%`
                        : Number(payload[0]?.value ?? 0).toLocaleString();
                    return (
                      <div className="rounded-lg bg-overlay/95 p-2.5 text-xs text-overlay-fg ring ring-current/20 backdrop-blur-lg">
                        <div className="font-semibold">{label as string}</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span>{chartMetricLabel}</span>
                          <span className="font-semibold tabular-nums">
                            {metricValue}
                          </span>
                        </div>
                        {chartMetric !== 'downloads' ? (
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <span>Downloads</span>
                            <span className="font-semibold tabular-nums">
                              {Number(row?.downloads ?? 0).toLocaleString()}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar
                  dataKey="value"
                  fill={RAILYARD_ACCENT_COLOR}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </SafeChartContainer>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/35">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rank
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <SortableNumberHeader
                    label="Version"
                    isActive={sortField === 'version'}
                    direction={sortDirection}
                    accentColor={RAILYARD_ACCENT_COLOR}
                    onToggle={() => toggleSort('version')}
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <SortableNumberHeader
                    label="Downloads"
                    isActive={sortField === 'downloads'}
                    direction={sortDirection}
                    accentColor={RAILYARD_ACCENT_COLOR}
                    onToggle={() => toggleSort('downloads')}
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <SortableNumberHeader
                    label="Share"
                    isActive={sortField === 'share'}
                    direction={sortDirection}
                    accentColor={RAILYARD_ACCENT_COLOR}
                    onToggle={() => toggleSort('share')}
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <SortableNumberHeader
                    label="Assets"
                    isActive={sortField === 'assets'}
                    direction={sortDirection}
                    accentColor={RAILYARD_ACCENT_COLOR}
                    onToggle={() => toggleSort('assets')}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((versionRow, index) => (
                <tr
                  key={versionRow.version}
                  className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-3 py-2.5">
                    <RailyardRankBadge rank={index + 1} />
                  </td>
                  <td
                    className={`px-3 py-2.5 ${sortField === 'version' ? 'font-black' : 'font-semibold text-foreground'}`}
                    style={
                      sortField === 'version'
                        ? { color: RAILYARD_ACCENT_COLOR }
                        : undefined
                    }
                  >
                    v{versionRow.version}
                  </td>
                  <td
                    className={`px-3 py-2.5 tabular-nums ${sortField === 'downloads' ? 'font-black' : 'font-medium text-muted-foreground'}`}
                    style={
                      sortField === 'downloads'
                        ? { color: RAILYARD_ACCENT_COLOR }
                        : undefined
                    }
                  >
                    {versionRow.downloads.toLocaleString()}
                  </td>
                  <td
                    className={`px-3 py-2.5 tabular-nums ${sortField === 'share' ? 'font-black' : 'font-medium text-muted-foreground'}`}
                    style={
                      sortField === 'share'
                        ? { color: RAILYARD_ACCENT_COLOR }
                        : undefined
                    }
                  >
                    {versionRow.share.toFixed(1)}%
                  </td>
                  <td
                    className={`px-3 py-2.5 tabular-nums ${sortField === 'assets' ? 'font-black' : 'font-medium text-muted-foreground'}`}
                    style={
                      sortField === 'assets'
                        ? { color: RAILYARD_ACCENT_COLOR }
                        : undefined
                    }
                  >
                    {versionRow.assets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
