export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  color: string;
  level: number;
}

export interface LanguageStats {
  [language: string]: number;
}

export interface LicenseStats {
  [license: string]: number;
}

export interface ReposByYear {
  [year: number]: number;
}

export interface Insights {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: LanguageStats;
  licenses: LicenseStats;
  mostStarred: GitHubRepo | null;
  mostActive: GitHubRepo | null;
  reposByYear: ReposByYear;
  activeLastYear: number;
}

export interface ProductivityScore {
  score: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  breakdown: {
    followersScore: number;
    reposScore: number;
    starsScore: number;
    recentScore: number;
  };
}
