import { Clock, Bookmark, BookmarkCheck, Trash2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileItem {
  login: string;
  avatar_url: string;
  name: string | null;
}

interface HistoryPanelProps {
  history: (ProfileItem & { searchedAt: string })[];
  bookmarks: (ProfileItem & { bookmarkedAt: string })[];
  isBookmarked: (login: string) => boolean;
  onSearch: (username: string) => void;
  onToggleBookmark: (item: ProfileItem, isCurrentlyBookmarked: boolean) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export function HistoryPanel({
  history,
  bookmarks,
  isBookmarked,
  onSearch,
  onToggleBookmark,
  onClearHistory,
  onClose,
}: HistoryPanelProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            History & Bookmarks
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Bookmarks Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Bookmarks ({bookmarks.length})
              </h3>
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No bookmarks yet</p>
            ) : (
              <div className="space-y-2">
                {bookmarks.map((item) => (
                  <ProfileRow
                    key={item.login}
                    item={item}
                    isBookmarked={true}
                    onSearch={onSearch}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Searches ({history.length})
              </h3>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onClearHistory} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No search history</p>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <ProfileRow
                    key={item.login}
                    item={item}
                    isBookmarked={isBookmarked(item.login)}
                    onSearch={onSearch}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  item,
  isBookmarked,
  onSearch,
  onToggleBookmark,
}: {
  item: ProfileItem;
  isBookmarked: boolean;
  onSearch: (username: string) => void;
  onToggleBookmark: (item: ProfileItem, isCurrentlyBookmarked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
      <img src={item.avatar_url} alt={item.login} className="w-10 h-10 rounded-full" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.name || item.login}</div>
        <div className="text-xs text-muted-foreground">@{item.login}</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onSearch(item.login)}
          title="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', isBookmarked && 'text-primary')}
          onClick={() => onToggleBookmark(item, isBookmarked)}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
