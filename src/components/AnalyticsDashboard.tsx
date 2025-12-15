import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Trophy, Star, GitFork, Activity, TrendingUp, Award } from 'lucide-react';
import type { GitHubUser, GitHubRepo, ContributionDay } from '@/types/github';
import { computeInsights, computeProductivityScore } from '@/hooks/useGitHub';
import { ContributionHeatmap } from './ContributionHeatmap';

interface AnalyticsDashboardProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  contributions: ContributionDay[];
}

const CHART_COLORS = [
  '#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

export function AnalyticsDashboard({ user, repos, contributions }: AnalyticsDashboardProps) {
  const insights = useMemo(() => computeInsights(repos), [repos]);
  const productivity = useMemo(() => computeProductivityScore(user, insights), [user, insights]);

  const languageData = useMemo(() => {
    return Object.entries(insights.languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [insights.languages]);

  const repoGrowthData = useMemo(() => {
    const years = Object.keys(insights.reposByYear).map(Number).sort();
    return years.map((year) => ({
      year: year.toString(),
      repos: insights.reposByYear[year] || 0,
    }));
  }, [insights.reposByYear]);

  const topStarsData = useMemo(() => {
    return [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name.length > 12 ? r.name.slice(0, 12) + '...' : r.name,
        stars: r.stargazers_count,
      }));
  }, [repos]);

  const licenseData = useMemo(() => {
    return Object.entries(insights.licenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [insights.licenses]);

  const avgStars = insights.totalRepos ? Math.round(insights.totalStars / insights.totalRepos) : 0;
  const avgForks = insights.totalRepos ? Math.round(insights.totalForks / insights.totalRepos) : 0;
  const starredPct = insights.totalRepos
    ? Math.round((repos.filter((r) => r.stargazers_count > 0).length / insights.totalRepos) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Repos"
          value={insights.totalRepos}
          color="primary"
        />
        <StatCard
          icon={Star}
          label="Total Stars"
          value={insights.totalStars}
          color="yellow"
        />
        <StatCard
          icon={GitFork}
          label="Total Forks"
          value={insights.totalForks}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Active (1yr)"
          value={insights.activeLastYear}
          color="purple"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Productivity Score */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Developer Score</h3>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeDasharray={`${productivity.score * 2.51} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{productivity.score}</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5" style={{ color: getLevelColor(productivity.level) }} />
                  <span className="font-bold" style={{ color: getLevelColor(productivity.level) }}>
                    {productivity.level}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Followers: {productivity.breakdown.followersScore}%</div>
                  <div>Repos: {productivity.breakdown.reposScore}%</div>
                  <div>Stars: {productivity.breakdown.starsScore}%</div>
                  <div>Activity: {productivity.breakdown.recentScore}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Top Insights</h3>
            <div className="space-y-4 text-sm">
              <InsightRow
                label="Most Starred"
                value={insights.mostStarred?.name || '—'}
                subValue={insights.mostStarred ? `⭐ ${insights.mostStarred.stargazers_count}` : ''}
                href={insights.mostStarred?.html_url}
              />
              <InsightRow
                label="Most Active"
                value={insights.mostActive?.name || '—'}
                subValue={insights.mostActive ? new Date(insights.mostActive.pushed_at).toLocaleDateString() : ''}
                href={insights.mostActive?.html_url}
              />
              <InsightRow
                label="Top Language"
                value={languageData[0]?.name || '—'}
                subValue={languageData[0] ? `${languageData[0].value} repos` : ''}
              />
              <InsightRow
                label="Avg Stars/Repo"
                value={avgStars.toString()}
              />
              <InsightRow
                label="Avg Forks/Repo"
                value={avgForks.toString()}
              />
              <InsightRow
                label="Starred Repos"
                value={`${starredPct}%`}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contribution Heatmap */}
          <ContributionHeatmap contributions={contributions} />

          {/* Repo Growth */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Repo Creation Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={repoGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="repos"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages Pie */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Languages</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {languageData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Stars Bar */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Top 5 by Stars</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStarsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="stars" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* License Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">License Distribution</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={licenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {licenseData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-secondary ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

function InsightRow({
  label,
  value,
  subValue,
  href,
}: {
  label: string;
  value: string;
  subValue?: string;
  href?: string;
}) {
  const content = (
    <div className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="font-medium">{value}</span>
        {subValue && <span className="text-xs text-muted-foreground ml-2">{subValue}</span>}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="hover:bg-secondary/50 block rounded">
        {content}
      </a>
    );
  }

  return content;
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'Platinum': return '#E5E4E2';
    case 'Gold': return '#FFD700';
    case 'Silver': return '#C0C0C0';
    default: return '#CD7F32';
  }
}
