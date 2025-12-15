import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProfileCard } from '@/components/ProfileCard';
import { RepoList } from '@/components/RepoList';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ProfileComparison } from '@/components/ProfileComparison';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useGitHub } from '@/hooks/useGitHub';
import { useStorage } from '@/hooks/useStorage';
import { toast } from '@/hooks/use-toast';
import { exportAsImage, exportAsJSON, exportAsCSV } from '@/lib/exportReport';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'analytics'>('profile');
  const [isLight, setIsLight] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { user, repos, contributions, loading, error, fetchUser } = useGitHub();
  const storage = useStorage();

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [isLight]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error]);

  const handleSearch = (username: string, token?: string) => {
    fetchUser(username, token);
    setActiveTab('profile');
  };

  // Add to history when user is loaded
  useEffect(() => {
    if (user) {
      storage.addToHistory({
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
      });
    }
  }, [user?.login]);

  const handleExport = async (type: 'image' | 'json' | 'csv') => {
    if (!user) return;
    try {
      if (type === 'image') {
        await exportAsImage('analytics-dashboard', `${user.login}-analytics`);
        toast({ title: 'Exported', description: 'Analytics saved as image' });
      } else if (type === 'json') {
        exportAsJSON({ user, repos, contributions }, `${user.login}-data`);
        toast({ title: 'Exported', description: 'Data saved as JSON' });
      } else {
        exportAsCSV(repos, `${user.login}-repos`);
        toast({ title: 'Exported', description: 'Repos saved as CSV' });
      }
    } catch (e) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const handleToggleBookmark = (item: { login: string; avatar_url: string; name: string | null }, isCurrentlyBookmarked: boolean) => {
    if (isCurrentlyBookmarked) {
      storage.removeBookmark(item.login);
      toast({ title: 'Removed from bookmarks' });
    } else {
      storage.addBookmark(item as any);
      toast({ title: 'Added to bookmarks' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onSearch={handleSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLight={isLight}
        onThemeToggle={() => setIsLight(!isLight)}
        loading={loading}
        onCompare={() => setShowComparison(true)}
        onShowHistory={() => setShowHistory(true)}
        hasUser={!!user}
        isBookmarked={user ? storage.isBookmarked(user.login) : false}
        onToggleBookmark={() => {
          if (user) handleToggleBookmark(user, storage.isBookmarked(user.login));
        }}
        onExport={handleExport}
      />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <LoadingState />
        ) : !user ? (
          <EmptyState />
        ) : activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <ProfileCard user={user} />
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quick Info</h3>
                <p className="text-sm text-muted-foreground">
                  Switch to the <strong>Analytics</strong> tab to view developer productivity score,
                  contribution heatmap, and detailed repository insights.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <RepoList repos={repos} />
            </div>
          </div>
        ) : (
          <div id="analytics-dashboard">
            <AnalyticsDashboard user={user} repos={repos} contributions={contributions} />
          </div>
        )}
      </main>

      {/* Modals */}
      {showComparison && (
        <ProfileComparison
          currentUser={user ? { user, repos } : undefined}
          onClose={() => setShowComparison(false)}
        />
      )}

      {showHistory && (
        <HistoryPanel
          history={storage.history}
          bookmarks={storage.bookmarks}
          isBookmarked={storage.isBookmarked}
          onSearch={(username) => {
            handleSearch(username);
            setShowHistory(false);
          }}
          onToggleBookmark={handleToggleBookmark}
          onClearHistory={storage.clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>DevDetective Pro — GitHub Profile Analytics</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
