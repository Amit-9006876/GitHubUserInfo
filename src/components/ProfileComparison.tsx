import { useState } from 'react';
import { Search, X, ArrowLeftRight, Trophy, Star, GitFork, Users, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GitHubUser, GitHubRepo } from '@/types/github';
import { computeInsights, computeProductivityScore } from '@/hooks/useGitHub';

interface CompareUser {
  user: GitHubUser;
  repos: GitHubRepo[];
}

interface ProfileComparisonProps {
  currentUser?: CompareUser;
  onClose: () => void;
}

export function ProfileComparison({ currentUser, onClose }: ProfileComparisonProps) {
  const [userA, setUserA] = useState<CompareUser | null>(currentUser || null);
  const [userB, setUserB] = useState<CompareUser | null>(null);
  const [usernameA, setUsernameA] = useState(currentUser?.user.login || '');
  const [usernameB, setUsernameB] = useState('');
  const [loading, setLoading] = useState<'A' | 'B' | null>(null);

  const fetchUser = async (username: string, side: 'A' | 'B') => {
    if (!username.trim()) return;
    setLoading(side);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
      ]);

      if (!userRes.ok) throw new Error('User not found');

      const user = await userRes.json();
      const repos = await reposRes.json();

      if (side === 'A') {
        setUserA({ user, repos: Array.isArray(repos) ? repos : [] });
      } else {
        setUserB({ user, repos: Array.isArray(repos) ? repos : [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const swapUsers = () => {
    const temp = userA;
    setUserA(userB);
    setUserB(temp);
    setUsernameA(userB?.user.login || '');
    setUsernameB(temp?.user.login || '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Compare Profiles
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex gap-2">
              <Input
                value={usernameA}
                onChange={(e) => setUsernameA(e.target.value)}
                placeholder="First username"
                onKeyDown={(e) => e.key === 'Enter' && fetchUser(usernameA, 'A')}
              />
              <Button onClick={() => fetchUser(usernameA, 'A')} disabled={loading === 'A'}>
                {loading === 'A' ? '...' : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-center items-center">
              <Button variant="outline" size="icon" onClick={swapUsers} disabled={!userA || !userB}>
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                value={usernameB}
                onChange={(e) => setUsernameB(e.target.value)}
                placeholder="Second username"
                onKeyDown={(e) => e.key === 'Enter' && fetchUser(usernameB, 'B')}
              />
              <Button onClick={() => fetchUser(usernameB, 'B')} disabled={loading === 'B'}>
                {loading === 'B' ? '...' : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Comparison Grid */}
          {userA && userB ? (
            <ComparisonGrid userA={userA} userB={userB} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Search for two GitHub users to compare their profiles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonGrid({ userA, userB }: { userA: CompareUser; userB: CompareUser }) {
  const insightsA = computeInsights(userA.repos);
  const insightsB = computeInsights(userB.repos);
  const scoreA = computeProductivityScore(userA.user, insightsA);
  const scoreB = computeProductivityScore(userB.user, insightsB);

  const metrics = [
    { label: 'Productivity Score', icon: Trophy, a: scoreA.score, b: scoreB.score, suffix: '' },
    { label: 'Followers', icon: Users, a: userA.user.followers, b: userB.user.followers, suffix: '' },
    { label: 'Public Repos', icon: Activity, a: userA.user.public_repos, b: userB.user.public_repos, suffix: '' },
    { label: 'Total Stars', icon: Star, a: insightsA.totalStars, b: insightsB.totalStars, suffix: '' },
    { label: 'Total Forks', icon: GitFork, a: insightsA.totalForks, b: insightsB.totalForks, suffix: '' },
    { label: 'Active (1yr)', icon: Activity, a: insightsA.activeLastYear, b: insightsB.activeLastYear, suffix: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Headers */}
      <div className="grid grid-cols-3 gap-4">
        <ProfileHeader user={userA.user} level={scoreA.level} />
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
        </div>
        <ProfileHeader user={userB.user} level={scoreB.level} />
      </div>

      {/* Metrics Comparison */}
      <div className="space-y-3">
        {metrics.map((m) => (
          <MetricRow key={m.label} {...m} />
        ))}
      </div>

      {/* Top Languages */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Top Languages</h4>
          <div className="space-y-2">
            {Object.entries(insightsA.languages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([lang, count]) => (
                <div key={lang} className="flex justify-between text-sm">
                  <span>{lang}</span>
                  <span className="text-muted-foreground">{count} repos</span>
                </div>
              ))}
          </div>
        </div>
        <div className="glass-card p-4">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Top Languages</h4>
          <div className="space-y-2">
            {Object.entries(insightsB.languages)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([lang, count]) => (
                <div key={lang} className="flex justify-between text-sm">
                  <span>{lang}</span>
                  <span className="text-muted-foreground">{count} repos</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileHeader({ user, level }: { user: GitHubUser; level: string }) {
  return (
    <div className="glass-card p-4 text-center">
      <img src={user.avatar_url} alt={user.login} className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-primary/30" />
      <h3 className="font-bold">{user.name || user.login}</h3>
      <p className="text-sm text-muted-foreground">@{user.login}</p>
      <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded bg-primary/20 text-primary">
        {level}
      </span>
    </div>
  );
}

function MetricRow({
  label,
  icon: Icon,
  a,
  b,
  suffix,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  a: number;
  b: number;
  suffix: string;
}) {
  const total = a + b;
  const percentA = total > 0 ? (a / total) * 100 : 50;
  const winner = a > b ? 'A' : b > a ? 'B' : null;

  return (
    <div className="glass-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 ${winner === 'A' ? 'text-primary font-semibold' : ''}`}>
          <span className="text-lg">{a.toLocaleString()}{suffix}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </div>
        <div className={`flex items-center gap-2 ${winner === 'B' ? 'text-primary font-semibold' : ''}`}>
          <span className="text-lg">{b.toLocaleString()}{suffix}</span>
        </div>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
        <div
          className="bg-primary/70 transition-all duration-500"
          style={{ width: `${percentA}%` }}
        />
        <div
          className="bg-accent/70 transition-all duration-500"
          style={{ width: `${100 - percentA}%` }}
        />
      </div>
    </div>
  );
}
