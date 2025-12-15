import { useState, useEffect, useCallback } from 'react';

interface BookmarkedProfile {
  login: string;
  avatar_url: string;
  name: string | null;
  bookmarkedAt: string;
}

interface SearchHistoryItem {
  login: string;
  avatar_url: string;
  name: string | null;
  searchedAt: string;
}

const BOOKMARKS_KEY = 'devdetective_bookmarks';
const HISTORY_KEY = 'devdetective_history';
const MAX_HISTORY = 20;

export function useStorage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedProfile[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
  }, []);

  // Save bookmarks
  const saveBookmarks = useCallback((newBookmarks: BookmarkedProfile[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
  }, []);

  // Save history
  const saveHistory = useCallback((newHistory: SearchHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  }, []);

  // Add bookmark
  const addBookmark = useCallback((user: { login: string; avatar_url: string; name: string | null }) => {
    const exists = bookmarks.some((b) => b.login === user.login);
    if (exists) return false;

    const newBookmark: BookmarkedProfile = {
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name,
      bookmarkedAt: new Date().toISOString(),
    };
    saveBookmarks([newBookmark, ...bookmarks]);
    return true;
  }, [bookmarks, saveBookmarks]);

  // Remove bookmark
  const removeBookmark = useCallback((login: string) => {
    saveBookmarks(bookmarks.filter((b) => b.login !== login));
  }, [bookmarks, saveBookmarks]);

  // Check if bookmarked
  const isBookmarked = useCallback((login: string) => {
    return bookmarks.some((b) => b.login === login);
  }, [bookmarks]);

  // Add to history
  const addToHistory = useCallback((user: { login: string; avatar_url: string; name: string | null }) => {
    const filtered = history.filter((h) => h.login !== user.login);
    const newItem: SearchHistoryItem = {
      login: user.login,
      avatar_url: user.avatar_url,
      name: user.name,
      searchedAt: new Date().toISOString(),
    };
    const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY);
    saveHistory(newHistory);
  }, [history, saveHistory]);

  // Clear history
  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  return {
    bookmarks,
    history,
    addBookmark,
    removeBookmark,
    isBookmarked,
    addToHistory,
    clearHistory,
  };
}
