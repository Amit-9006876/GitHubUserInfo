import { useMemo } from 'react';
import type { ContributionDay } from '@/types/github';

interface ContributionHeatmapProps {
  contributions: ContributionDay[];
}

const LEVEL_COLORS = {
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
};

export function ContributionHeatmap({ contributions }: ContributionHeatmapProps) {
  const weeks = useMemo(() => {
    if (contributions.length === 0) return [];

    const dayMap = new Map<string, ContributionDay>();
    contributions.forEach((d) => dayMap.set(d.date, d));

    const sortedDates = [...dayMap.keys()].sort();
    if (sortedDates.length === 0) return [];

    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);

    // Align to Sunday
    const start = new Date(firstDate);
    start.setDate(start.getDate() - start.getDay());

    const result: ContributionDay[][] = [];
    const cursor = new Date(start);

    while (cursor <= lastDate) {
      const week: ContributionDay[] = [];
      for (let i = 0; i < 7; i++) {
        const iso = cursor.toISOString().slice(0, 10);
        week.push(
          dayMap.get(iso) || {
            date: iso,
            count: 0,
            color: LEVEL_COLORS.dark[0],
            level: 0,
          }
        );
        cursor.setDate(cursor.getDate() + 1);
      }
      result.push(week);
    }

    return result;
  }, [contributions]);

  if (contributions.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Contribution Activity</h3>
        <p className="text-muted-foreground text-sm">
          Add a GitHub Personal Access Token to view contribution heatmap.
        </p>
      </div>
    );
  }

  const totalContributions = contributions.reduce((sum, d) => sum + d.count, 0);
  const lastDate = contributions[contributions.length - 1]?.date;

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Contribution Activity</h3>
        <span className="text-sm text-muted-foreground">
          {totalContributions.toLocaleString()} contributions in the last year
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="flex gap-[3px] min-w-max p-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={day.date}
                  className="heatmap-cell cursor-pointer"
                  style={{ backgroundColor: day.color }}
                  title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-muted-foreground">
          Last activity: {lastDate}
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {LEVEL_COLORS.dark.map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
