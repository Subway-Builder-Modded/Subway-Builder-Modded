'use client';

import { useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  Layers3,
  HardDrive,
  TrainTrack,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '@/lib/utils';
import { usePersistedState } from '@/lib/use-persisted-state';
import type { RailyardAnalyticsData } from '@/types/railyard-analytics';
import { RailyardAnalyticsOverviewSection } from './railyard-analytics-overview-section';
import { RailyardAnalyticsTimelineSection } from './railyard-analytics-timeline-section';
import { RailyardAnalyticsVersionsSection } from './railyard-analytics-versions-section';
import { RailyardAnalyticsAssetsSection } from './railyard-analytics-assets-section';
import { RAILYARD_ANALYTICS_PAGE_HEADER_SCHEME } from './railyard-analytics-shared';

type TabKey = 'overview' | 'timeline' | 'versions' | 'assets';

const TABS: {
  key: TabKey;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'timeline', label: 'Timeline', icon: LineChart },
  { key: 'versions', label: 'Versions', icon: Layers3 },
  { key: 'assets', label: 'Assets', icon: HardDrive },
];

export function RailyardAnalyticsPage({
  data,
}: {
  data: RailyardAnalyticsData;
}) {
  const [active, setActive] = usePersistedState<TabKey>(
    'railyard.analytics.active-tab',
    'overview',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');

    if (
      tab === 'overview' ||
      tab === 'timeline' ||
      tab === 'versions' ||
      tab === 'assets'
    ) {
      setActive(tab);
    }
  }, [setActive]);

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        icon={TrainTrack}
        title="Railyard Analytics"
        description="In-depth release and download analytics for the Railyard desktop app."
        colorScheme={RAILYARD_ANALYTICS_PAGE_HEADER_SCHEME}
        badges={[{ text: `Updated: \`${data.snapshotLabel}\`` }]}
      />

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                'flex min-w-32 items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'border-primary/40 bg-primary/8 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          );
        })}
      </div>

      {active === 'overview' ? (
        <RailyardAnalyticsOverviewSection data={data} />
      ) : null}
      {active === 'timeline' ? (
        <RailyardAnalyticsTimelineSection data={data} />
      ) : null}
      {active === 'versions' ? (
        <RailyardAnalyticsVersionsSection data={data} />
      ) : null}
      {active === 'assets' ? (
        <RailyardAnalyticsAssetsSection data={data} />
      ) : null}
    </div>
  );
}
