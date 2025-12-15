import { Github, Search } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gradient-primary opacity-20 blur-3xl absolute inset-0" />
        <Github className="w-24 h-24 text-primary relative animate-float" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="text-gradient">DevDetective</span>
        <span className="text-muted-foreground"> Pro</span>
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Discover GitHub profiles with advanced analytics, contribution insights, and developer productivity scores.
      </p>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <Search className="h-5 w-5" />
        <span>Search a GitHub username to get started</span>
      </div>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <FeatureItem icon="📊" title="Analytics" desc="Deep repo insights" />
        <FeatureItem icon="🔥" title="Heatmap" desc="Contribution calendar" />
        <FeatureItem icon="🏆" title="Score" desc="Productivity rating" />
        <FeatureItem icon="📈" title="Charts" desc="Visual statistics" />
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="glass-card p-4">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
