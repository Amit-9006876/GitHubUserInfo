import { MapPin, Link as LinkIcon, Building, Twitter, Calendar } from 'lucide-react';
import type { GitHubUser } from '@/types/github';

interface ProfileCardProps {
  user: GitHubUser;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="w-28 h-28 rounded-full border-4 border-primary/20 shadow-lg shadow-primary/20"
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-success rounded-full flex items-center justify-center border-4 border-card">
            <span className="text-xs">✓</span>
          </div>
        </div>

        <h2 className="mt-4 text-2xl font-bold">{user.name || user.login}</h2>
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-mono text-sm"
        >
          @{user.login}
        </a>

        {user.bio && (
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full mt-6">
          <StatBox label="Repos" value={user.public_repos} />
          <StatBox label="Followers" value={user.followers} />
          <StatBox label="Following" value={user.following} />
        </div>

        {/* Meta Info */}
        <div className="w-full mt-6 space-y-2 text-sm">
          {user.company && (
            <InfoRow icon={Building} text={user.company} />
          )}
          {user.location && (
            <InfoRow icon={MapPin} text={user.location} />
          )}
          {user.blog && (
            <InfoRow
              icon={LinkIcon}
              text={user.blog}
              href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
            />
          )}
          {user.twitter_username && (
            <InfoRow
              icon={Twitter}
              text={`@${user.twitter_username}`}
              href={`https://twitter.com/${user.twitter_username}`}
            />
          )}
          <InfoRow
            icon={Calendar}
            text={`Joined ${new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })}`}
          />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <div className="text-xl font-bold text-foreground">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
