'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  REGISTRY_LINK_HOVER_CLS,
  RankBadge,
  SafeChartContainer,
  TypeBadge,
  getAuthorDisplayName,
  getListingColor,
  registryLinkStyle,
  trimLeadingZeroDailyData,
  useClientReady,
} from '@/features/registry/components/registry-shared';
import type {
  EnrichedTrendingRow,
  TrendingModeKey,
} from './registry-trending-types';
import { getModeDays } from './registry-trending-types';

function railyardListingHref(row: EnrichedTrendingRow): string {
  return `/railyard/${row.listing_type === 'map' ? 'maps' : 'mods'}/${row.id}`;
}

function authorAnalyticsHref(row: EnrichedTrendingRow): string {
  return `/registry/author/${encodeURIComponent(row.author)}`;
}

function listingAnalyticsHref(row: EnrichedTrendingRow): string {
  return `/registry/${row.listing_type}/${row.id}`;
}

export function RegistryTrendingCard({
  row,
  rank,
  mode,
}: {
  row: EnrichedTrendingRow;
  rank: number;
  mode: TrendingModeKey;
}) {
  const color = getListingColor(row.listing_type);
  const growthRatePct =
    row.baseline_total > 0
      ? ((row.download_change / row.baseline_total) * 100).toFixed(1)
      : null;

  const modeDays = getModeDays(mode);

  const chartSource = trimLeadingZeroDailyData(row.dailyData);
  const chartData = chartSource.slice(-(modeDays * 2));

  const splitIndex = Math.max(0, chartData.length - modeDays);
  const MONTH_ABBR = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const fmtDate = (d: string) => {
    const [, mo, dy] = d.split('-').map(Number);
    return `${MONTH_ABBR[(mo ?? 1) - 1]} ${dy}`;
  };
  const segmentedChartData = chartData.map((point, index) => ({
    ...point,
    label: fmtDate(point.date),
    currentDownloads: index >= splitIndex ? point.downloads : null,
    isCurrent: index >= splitIndex,
  }));

  return (
    <article
      className="min-h-[420px] rounded-2xl border border-border bg-background/70 p-5 ring-1 ring-foreground/5 backdrop-blur-sm"
      style={{ boxShadow: `inset 0 1px 0 ${color}2b` }}
    >
      <div className="grid h-full gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <RankBadge rank={rank} />
            <TypeBadge type={row.listing_type} />
          </div>

          <h3 className="truncate text-2xl font-bold tracking-tight text-foreground sm:text-[1.7rem]">
            <Link
              href={railyardListingHref(row)}
              className="transition-colors hover:text-foreground/85"
            >
              {row.name}
            </Link>
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            by{' '}
            <Link
              href={authorAnalyticsHref(row)}
              className={`font-medium ${REGISTRY_LINK_HOVER_CLS}`}
              style={registryLinkStyle(color)}
            >
              {getAuthorDisplayName(row)}
            </Link>
          </p>

          <div className="mt-4 rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Download History
            </p>
            <TrendingWindowChart
              data={segmentedChartData}
              color={color}
              modeDays={modeDays}
            />
          </div>
        </div>

        <div className="grid auto-rows-fr gap-3">
          <div className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Downloads
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>
              {row.download_change.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Downloads
            </p>
            <p className="text-xl font-bold tabular-nums text-foreground">
              {row.totalDownloads.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Growth
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color }}>
              {growthRatePct ? `+${growthRatePct}%` : '—'}
            </p>
          </div>

          <Link
            href={listingAnalyticsHref(row)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              borderColor: `${color}7a`,
              color,
              backgroundColor: `${color}17`,
            }}
          >
            <BarChart3 className="size-4" />
            View Detailed Analytics
          </Link>
        </div>
      </div>
    </article>
  );
}

function TrendingWindowChart({
  data,
  color,
  modeDays,
}: {
  data: {
    date: string;
    label: string;
    currentDownloads: number | null;
    downloads: number;
    isCurrent: boolean;
  }[];
  color: string;
  modeDays: number;
}) {
  const isClientReady = useClientReady();
  if (data.length === 0) return null;
  if (!isClientReady) return <div style={{ height: 220, width: '100%' }} />;

  const baseGradientId = `trend-base-${color.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const currGradientId = `trend-curr-${color.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-3 rounded-sm"
            style={{ backgroundColor: `${color}8f` }}
          />
          Previous {modeDays}d
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
          Current {modeDays}d
        </span>
      </div>

      <SafeChartContainer height={220}>
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 10, bottom: 8, left: 0 }}
          >
            <defs>
              <linearGradient id={baseGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.14} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id={currGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
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
              interval="preserveStartEnd"
              tickMargin={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const datum = payload[0]?.payload as
                  | { downloads?: number; isCurrent?: boolean }
                  | undefined;
                return (
                  <div className="rounded-lg bg-overlay/75 p-2.5 text-xs text-overlay-fg ring ring-current/10 backdrop-blur-lg">
                    <span className="font-semibold">{label as string}</span>
                    <div className="mt-1">
                      {(datum?.downloads ?? 0).toLocaleString()} downloads
                    </div>
                    <div className="mt-1 text-muted-fg">
                      {datum?.isCurrent
                        ? `Current ${modeDays}d`
                        : `Previous ${modeDays}d`}
                    </div>
                  </div>
                );
              }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="downloads"
              stroke={color}
              strokeOpacity={0.55}
              strokeWidth={1.8}
              fill={`url(#${baseGradientId})`}
              connectNulls
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="currentDownloads"
              stroke={color}
              strokeWidth={2.2}
              fill={`url(#${currGradientId})`}
              connectNulls
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </SafeChartContainer>
    </div>
  );
}
