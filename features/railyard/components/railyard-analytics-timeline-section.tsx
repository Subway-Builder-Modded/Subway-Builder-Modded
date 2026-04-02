'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import { usePersistedState } from '@/lib/use-persisted-state';
import type { RailyardAnalyticsData } from '@/types/railyard-analytics';
import {
  compareSemver,
  formatCompactNumber,
  RAILYARD_ACCENT_COLOR,
  RailyardTimelinePeriodToggle,
  RailyardSectionHeader,
  SafeChartContainer,
  useClientReady,
} from './railyard-analytics-shared';
import { getRailyardAssetLabel } from '@/lib/railyard-asset-label';

type TimelinePeriod = 'all' | '3' | '7' | '14';

function periodLabel(period: TimelinePeriod): string {
  if (period === '3') return 'Last 3 Days';
  if (period === '7') return 'Last Week';
  if (period === '14') return 'Last 2 Weeks';
  return 'All Time';
}

function trimEdgeZeros<T extends { downloads: number }>(rows: T[]): T[] {
  if (rows.length === 0) return [];

  let start = 0;
  let end = rows.length - 1;

  while (start <= end && rows[start]?.downloads === 0) start += 1;
  while (end >= start && rows[end]?.downloads === 0) end -= 1;

  if (start > end) return [];
  return rows.slice(start, end + 1);
}

export function RailyardAnalyticsTimelineSection({
  data,
}: {
  data: RailyardAnalyticsData;
}) {
  const isClientReady = useClientReady();
  const [period, setPeriod] = usePersistedState<TimelinePeriod>(
    'railyard.analytics.timeline.period',
    'all',
  );

  const periodRows = useMemo(() => {
    const source = [...data.dailyTotals].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const base =
      period === 'all' ? source : source.slice(-Number.parseInt(period, 10));
    return trimEdgeZeros(base);
  }, [data.dailyTotals, period]);

  const timelineStats = useMemo(() => {
    const totalDownloads = periodRows.reduce(
      (sum, row) => sum + row.downloads,
      0,
    );

    const windowStart = periodRows[0]?.date;
    const windowEnd = periodRows[periodRows.length - 1]?.date;

    const selectedVersionRows = data.versionDaily
      .map((row) => ({
        version: row.version,
        downloads: row.daily
          .filter((dailyRow) => {
            if (!windowStart || !windowEnd) return false;
            return dailyRow.date >= windowStart && dailyRow.date <= windowEnd;
          })
          .reduce((sum, dailyRow) => sum + dailyRow.downloads, 0),
      }))
      .filter((row) => row.downloads > 0);

    const topVersion = [...selectedVersionRows].sort((a, b) => {
      if (b.downloads !== a.downloads) return b.downloads - a.downloads;
      return compareSemver(b.version, a.version);
    })[0];

    const assetTotals = new Map<string, number>();
    for (const versionRow of data.versions) {
      const versionDownloads =
        selectedVersionRows.find((row) => row.version === versionRow.version)
          ?.downloads ?? 0;

      if (versionDownloads <= 0 || versionRow.totalDownloads <= 0) continue;

      for (const assetRow of versionRow.assets) {
        const estimatedDownloads =
          (versionDownloads * assetRow.totalDownloads) /
          versionRow.totalDownloads;
        assetTotals.set(
          assetRow.assetLabel,
          (assetTotals.get(assetRow.assetLabel) ?? 0) + estimatedDownloads,
        );
      }
    }

    const topAsset = [...assetTotals.entries()]
      .map(([assetLabel, downloads]) => ({
        assetLabel: getRailyardAssetLabel(assetLabel),
        downloads,
      }))
      .sort((a, b) => b.downloads - a.downloads)[0];

    return {
      totalDownloads,
      topVersion,
      topAsset,
    };
  }, [data.versionDaily, data.versions, periodRows]);

  const chartRows = periodRows
    .filter((row) => !row.date.endsWith('-03-30'))
    .map((row) => ({
      ...row,
      label: row.date.slice(5).replace('-', '/'),
    }));

  return (
    <section className="mb-12">
      <RailyardSectionHeader icon={LineChartIcon} title="Downloads Over Time" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <RailyardTimelinePeriodToggle value={period} onChange={setPeriod} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Downloads
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {Math.round(timelineStats.totalDownloads).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">{periodLabel(period)}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Top Version
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">
            {timelineStats.topVersion
              ? `v${timelineStats.topVersion.version}`
              : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            {timelineStats.topVersion
              ? `${timelineStats.topVersion.downloads.toLocaleString()} downloads`
              : 'No downloads in selected period'}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Top Asset
          </p>
          <p className="mt-1 truncate text-lg font-black text-foreground">
            {timelineStats.topAsset?.assetLabel ?? 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            {timelineStats.topAsset
              ? `${Math.round(timelineStats.topAsset.downloads).toLocaleString()} downloads`
              : 'No downloads in selected period'}
          </p>
        </div>
      </div>

      <div className="mb-10 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Downloads ({periodLabel(period)})
        </p>

        <SafeChartContainer height={320}>
          {isClientReady ? (
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart
                data={chartRows}
                margin={{ top: 8, right: 14, bottom: 8, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="railyard-timeline-gradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={RAILYARD_ACCENT_COLOR}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={RAILYARD_ACCENT_COLOR}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  horizontal
                  vertical={false}
                  stroke="var(--border)"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={chartRows.length > 14 ? 'preserveStartEnd' : 0}
                  tickMargin={6}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => formatCompactNumber(value)}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const value = Number(payload[0]?.value ?? 0);
                    const row = payload[0]?.payload as
                      | { date?: string }
                      | undefined;

                    return (
                      <div className="rounded-lg bg-overlay/95 p-2.5 text-xs text-overlay-fg ring ring-current/20 backdrop-blur-lg">
                        <div className="font-semibold">{label as string}</div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span>Downloads</span>
                          <span className="font-semibold tabular-nums">
                            {value.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-muted-fg">
                          {row?.date ?? 'Unknown date'}
                        </div>
                      </div>
                    );
                  }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke={RAILYARD_ACCENT_COLOR}
                  strokeWidth={2.5}
                  fill="url(#railyard-timeline-gradient)"
                  dot={false}
                  activeDot={{ r: 3, fill: RAILYARD_ACCENT_COLOR }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </SafeChartContainer>
      </div>
    </section>
  );
}
