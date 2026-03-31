'use client';

import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Globe } from 'lucide-react';

import {
  MAP_COLOR,
  REGISTRY_LINK_HOVER_CLS,
  RankBadge,
  SafeChartContainer,
  SectionHeader,
  TABLE_CELL_CLS,
  TABLE_CELL_NUMERIC_CLS,
  TABLE_HEADER_CLS,
  TABLE_HEADER_RIGHT_CLS,
  TABLE_ROW_CLS,
  formatCount,
  getAuthorDisplayName,
  truncateName,
  useClientReady,
  registryLinkStyle,
} from '@/features/registry/components/registry-shared';
import type { RegistryAnalyticsData } from '@/types/registry-analytics';

type PopulationRow = RegistryAnalyticsData['mapPopulations'][number];

function PopulationChart({ rows }: { rows: PopulationRow[] }) {
  const isClientReady = useClientReady();
  const chartData = rows.slice(0, 10).map((row) => ({
    id: row.id,
    name: truncateName(row.name, 22),
    fullName: row.name,
    population: row.population,
    cityCode: row.city_code,
  }));

  if (!isClientReady) return <div style={{ height: 320, width: '100%' }} />;

  return (
    <SafeChartContainer height={320}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 22, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            vertical
            stroke="var(--border)"
            strokeOpacity={0.6}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatCount(v)}
            tickMargin={6}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={144}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const datum = payload[0]?.payload as
                | { fullName?: string; cityCode?: string }
                | undefined;
              return (
                <div className="rounded-lg bg-overlay/75 p-2.5 text-xs text-overlay-fg ring ring-current/10 backdrop-blur-lg">
                  <span className="font-semibold">
                    {datum?.fullName ?? (label as string)}
                  </span>
                  <div className="mt-1">
                    {(payload[0]!.value as number).toLocaleString()} population
                  </div>
                  {datum?.cityCode ? (
                    <div className="mt-1 text-muted-fg">{datum.cityCode}</div>
                  ) : null}
                </div>
              );
            }}
            cursor={{ fill: 'var(--muted)', fillOpacity: 0.4 }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="population" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={MAP_COLOR}
                fillOpacity={0.9 - index * 0.055}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SafeChartContainer>
  );
}

function PopulationTable({ rows }: { rows: PopulationRow[] }) {
  const visible = rows.slice(0, 25);

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className={TABLE_HEADER_CLS}>#</th>
            <th className={TABLE_HEADER_CLS}>Map</th>
            <th className={`hidden ${TABLE_HEADER_CLS} md:table-cell`}>
              Author
            </th>
            <th className={`hidden ${TABLE_HEADER_CLS} sm:table-cell`}>City</th>
            <th className={TABLE_HEADER_RIGHT_CLS}>Population</th>
            <th className={`hidden ${TABLE_HEADER_RIGHT_CLS} lg:table-cell`}>
              Demand Points
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((row) => (
            <tr key={row.id} className={TABLE_ROW_CLS}>
              <td className={TABLE_CELL_CLS}>
                <RankBadge rank={row.rank} />
              </td>
              <td className={TABLE_CELL_CLS}>
                <Link
                  href={`/registry/map/${row.id}`}
                  className={`font-medium ${REGISTRY_LINK_HOVER_CLS}`}
                  style={registryLinkStyle(MAP_COLOR)}
                >
                  {row.name}
                </Link>
              </td>
              <td className={`hidden ${TABLE_CELL_CLS} md:table-cell`}>
                <Link
                  href={`/registry/author/${encodeURIComponent(row.author)}`}
                  className={REGISTRY_LINK_HOVER_CLS}
                  style={registryLinkStyle(MAP_COLOR)}
                >
                  {getAuthorDisplayName(row)}
                </Link>
              </td>
              <td
                className={`hidden ${TABLE_CELL_CLS} text-muted-foreground sm:table-cell`}
              >
                {row.city_code}
              </td>
              <td
                className={`${TABLE_CELL_NUMERIC_CLS} font-semibold`}
                style={{ color: MAP_COLOR }}
              >
                {row.population.toLocaleString()}
              </td>
              <td
                className={`hidden ${TABLE_CELL_NUMERIC_CLS} text-muted-foreground lg:table-cell`}
              >
                {row.points_count.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RegistryPopulationSection({
  data,
}: {
  data: RegistryAnalyticsData;
}) {
  const rows = data.mapPopulations;
  return (
    <section id="population-rankings" className="scroll-mt-24 mb-12">
      <SectionHeader icon={Globe} title="Population Rank" accent={MAP_COLOR} />

      <div className="mb-8 rounded-xl border border-border bg-card p-5 ring-1 ring-foreground/5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Top 10 Maps by Population
        </p>
        <PopulationChart rows={rows} />
      </div>

      <PopulationTable rows={rows} />
    </section>
  );
}
