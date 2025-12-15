import { useState } from 'react';
import { Star, GitFork, Clock, Code, ExternalLink, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { GitHubRepo } from '@/types/github';

interface RepoListProps {
  repos: GitHubRepo[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  default: '#8b949e',
};

export function RepoList({ repos }: RepoListProps) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'name'>('updated');

  const filteredRepos = repos
    .filter((repo) =>
      repo.name.toLowerCase().includes(filter.toLowerCase()) ||
      (repo.description?.toLowerCase().includes(filter.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'stars') return (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    });

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          Repositories
          <span className="text-sm font-normal text-muted-foreground">
            ({repos.length})
          </span>
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter repos..."
              className="pl-8 h-9 w-40"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-lg border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="updated">Recently Updated</option>
            <option value="stars">Most Stars</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2">
        {filteredRepos.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No repositories found</p>
        ) : (
          filteredRepos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))
        )}
      </div>
    </div>
  );
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default : null;

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 group border border-transparent hover:border-primary/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary group-hover:underline truncate">
              {repo.name}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {repo.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {repo.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: langColor || undefined }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" />
          {repo.stargazers_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" />
          {repo.forks_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(repo.pushed_at).toLocaleDateString()}
        </span>
      </div>

      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {repo.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
