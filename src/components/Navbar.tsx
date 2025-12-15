import { useState } from 'react';
import { Search, Moon, Sun, Key, X, Github, ArrowLeftRight, Clock, Bookmark, BookmarkCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onSearch: (username: string, token?: string) => void;
  activeTab: 'profile' | 'analytics';
  onTabChange: (tab: 'profile' | 'analytics') => void;
  isLight: boolean;
  onThemeToggle: () => void;
  loading?: boolean;
  onCompare?: () => void;
  onShowHistory?: () => void;
  hasUser?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onExport?: (type: 'image' | 'json' | 'csv') => void;
}

export function Navbar({
  onSearch,
  activeTab,
  onTabChange,
  isLight,
  onThemeToggle,
  loading,
  onCompare,
  onShowHistory,
  hasUser,
  isBookmarked,
  onToggleBookmark,
  onExport,
}: NavbarProps) {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSearch = () => {
    if (username.trim()) {
      onSearch(username.trim(), token.trim() || undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gradient">DevDetective</span>
            <span className="hidden sm:inline text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              PRO
            </span>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-1 items-center justify-center gap-3 max-w-2xl">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search GitHub user..."
                className="pl-9 pr-4"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !username.trim()}>
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                'Search'
              )}
            </Button>

            {/* Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
              <button
                onClick={() => onTabChange('profile')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  activeTab === 'profile'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Profile
              </button>
              <button
                onClick={() => onTabChange('analytics')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  activeTab === 'analytics'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Analytics
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Compare */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onCompare}
              title="Compare Profiles"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            {/* History */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowHistory}
              title="History & Bookmarks"
            >
              <Clock className="h-4 w-4" />
            </Button>

            {/* Bookmark Current */}
            {hasUser && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleBookmark}
                className={cn(isBookmarked && 'text-primary')}
                title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Profile'}
              >
                {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            )}

            {/* Export */}
            {hasUser && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Export">
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExport('image')}>
                    Export as Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport('csv')}>
                    Export Repos as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* PAT */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowToken(!showToken)}
              className="relative"
              title="Personal Access Token"
            >
              <Key className="h-4 w-4" />
              {token && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
              )}
            </Button>

            {/* Theme */}
            <Button variant="ghost" size="icon" onClick={onThemeToggle}>
              {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden flex items-center gap-1 bg-secondary/50 p-1 rounded-lg mt-3">
          <button
            onClick={() => onTabChange('profile')}
            className={cn(
              'flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'profile'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            Profile
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={cn(
              'flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              activeTab === 'analytics'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground'
            )}
          >
            Analytics
          </button>
        </div>

        {/* Token Input */}
        {showToken && (
          <div className="flex items-center gap-2 mt-3 animate-fade-in">
            <Input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="GitHub Personal Access Token (optional)"
              className="flex-1 max-w-md"
            />
            {token && (
              <Button variant="ghost" size="icon" onClick={() => setToken('')}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              Enables contribution heatmap & higher rate limits
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
