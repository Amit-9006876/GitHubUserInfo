import html2canvas from 'html2canvas';

export async function exportAsImage(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#0d1117',
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function exportAsJSON(data: object, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `${filename}.json`;
  link.href = url;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function exportAsCSV(repos: Array<{ name: string; language: string | null; stargazers_count: number; forks_count: number; created_at: string; pushed_at: string }>, filename: string): void {
  const headers = ['Name', 'Language', 'Stars', 'Forks', 'Created', 'Last Updated'];
  const rows = repos.map(r => [
    r.name,
    r.language || 'N/A',
    r.stargazers_count.toString(),
    r.forks_count.toString(),
    new Date(r.created_at).toLocaleDateString(),
    new Date(r.pushed_at).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `${filename}.csv`;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}
