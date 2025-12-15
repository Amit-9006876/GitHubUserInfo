import { useState, useCallback } from 'react';
import type { GitHubUser, GitHubRepo, ContributionDay, Insights, ProductivityScore } from '@/types/github';

const GITHUB_API = 'https://api.github.com';

export function useGitHub() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (username: string, token?: string) => {
    setLoading(true);
    setError(null);
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const userRes = await fetch(`${GITHUB_API}/users/${username}`, { headers });
      if (!userRes.ok) {
        if (userRes.status === 404) throw new Error('User not found');
        throw new Error('Failed to fetch user');
      }
      const userData: GitHubUser = await userRes.json();
      setUser(userData);

      const reposRes = await fetch(
        `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`,
        { headers }
      );
      if (reposRes.ok) {
        const reposData: GitHubRepo[] = await reposRes.json();
        setRepos(reposData);
      }

      // Fetch contributions from GitHub's contribution calendar
      await fetchContributions(username, token);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUser(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContributions = async (username: string, token?: string) => {
    try {
      if (token) {
        // Use GraphQL API with token
        const query = `
          query($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                      color
                    }
                  }
                }
              }
            }
          }
        `;
        
        const res = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query, variables: { login: username } }),
        });
        
        const json = await res.json();
        if (json.data?.user?.contributionsCollection?.contributionCalendar?.weeks) {
          const days: ContributionDay[] = [];
          json.data.user.contributionsCollection.contributionCalendar.weeks.forEach((week: any) => {
            week.contributionDays.forEach((day: any) => {
              days.push({
                date: day.date,
                count: day.contributionCount,
                color: day.color,
                level: getContributionLevel(day.contributionCount),
              });
            });
          });
          setContributions(days);
        }
      } else {
        // Fallback: parse the SVG contribution graph
        const svgUrl = `https://github.com/users/${username}/contributions`;
        const res = await fetch(svgUrl);
        if (res.ok) {
          const text = await res.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          const rects = doc.querySelectorAll('td[data-date]');
          const days: ContributionDay[] = [];
          
          rects.forEach((td) => {
            const date = td.getAttribute('data-date');
            const level = parseInt(td.getAttribute('data-level') || '0', 10);
            if (date) {
              days.push({
                date,
                count: level * 3, // Approximate
                color: getColorForLevel(level),
                level,
              });
            }
          });
          setContributions(days);
        }
      }
    } catch (err) {
      console.warn('Could not fetch contributions:', err);
    }
  };

  const clearData = useCallback(() => {
    setUser(null);
    setRepos([]);
    setContributions([]);
    setError(null);
  }, []);

  return {
    user,
    repos,
    contributions,
    loading,
    error,
    fetchUser,
    clearData,
  };
}

function getContributionLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

function getColorForLevel(level: number): string {
  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
  return colors[level] || colors[0];
}

export function computeInsights(repos: GitHubRepo[]): Insights {
  const insights: Insights = {
    totalRepos: repos.length,
    totalStars: 0,
    totalForks: 0,
    languages: {},
    licenses: {},
    mostStarred: null,
    mostActive: null,
    reposByYear: {},
    activeLastYear: 0,
  };

  let mostStars = -1;
  let latestPush = 0;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  repos.forEach((repo) => {
    insights.totalStars += repo.stargazers_count || 0;
    insights.totalForks += repo.forks_count || 0;

    if (repo.language) {
      insights.languages[repo.language] = (insights.languages[repo.language] || 0) + 1;
    }

    const license = repo.license?.spdx_id || repo.license?.name || 'No License';
    insights.licenses[license] = (insights.licenses[license] || 0) + 1;

    if ((repo.stargazers_count || 0) > mostStars) {
      mostStars = repo.stargazers_count || 0;
      insights.mostStarred = repo;
    }

    const pushedAt = new Date(repo.pushed_at).getTime();
    if (pushedAt > latestPush) {
      latestPush = pushedAt;
      insights.mostActive = repo;
    }

    if (pushedAt >= oneYearAgo) {
      insights.activeLastYear++;
    }

    const year = new Date(repo.created_at).getFullYear();
    insights.reposByYear[year] = (insights.reposByYear[year] || 0) + 1;
  });

  return insights;
}

export function computeProductivityScore(
  user: GitHubUser,
  insights: Insights
): ProductivityScore {
  const caps = { followers: 1000, repos: 100, stars: 2000, recentActive: 30 };

  const followersScore = Math.min(user.followers || 0, caps.followers) / caps.followers;
  const reposScore = Math.min(user.public_repos || 0, caps.repos) / caps.repos;
  const starsScore = Math.min(insights.totalStars || 0, caps.stars) / caps.stars;
  const recentScore = Math.min(insights.activeLastYear || 0, caps.recentActive) / caps.recentActive;

  const weights = { followers: 0.25, repos: 0.2, stars: 0.25, recent: 0.3 };
  const combined =
    followersScore * weights.followers +
    reposScore * weights.repos +
    starsScore * weights.stars +
    recentScore * weights.recent;

  const score = Math.round(combined * 100);
  const level: ProductivityScore['level'] =
    score >= 85 ? 'Platinum' : score >= 70 ? 'Gold' : score >= 50 ? 'Silver' : 'Bronze';

  return {
    score,
    level,
    breakdown: {
      followersScore: Math.round(followersScore * 100),
      reposScore: Math.round(reposScore * 100),
      starsScore: Math.round(starsScore * 100),
      recentScore: Math.round(recentScore * 100),
    },
  };
}
