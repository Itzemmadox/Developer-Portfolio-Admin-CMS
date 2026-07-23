import cron from 'node-cron';
import { db } from './db.js';

export async function fetchDevToArticles(): Promise<any[]> {
  try {
    const response = await fetch('https://dev.to/api/articles?top=7&per_page=12', {
      headers: {
        'User-Agent': 'Portfolio-News-Fetcher/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Dev.to API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    const articles = data.map((item: any) => ({
      id: `devto-${item.id}`,
      sourceId: String(item.id),
      title: item.title || 'Untitled Article',
      description: item.description || '',
      coverImageUrl: item.cover_image || item.social_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      url: item.url,
      author: item.user?.name || 'Dev.to Author',
      publishedAt: item.published_at || new Date().toISOString(),
      tags: Array.isArray(item.tag_list) ? item.tag_list : (item.tags ? String(item.tags).split(',').map(t => t.trim()) : []),
      fetchedAt: new Date().toISOString()
    }));

    db.setCachedArticles(articles);
    console.log(`[NewsCron] Successfully cached ${articles.length} Dev.to articles at ${new Date().toISOString()}`);
    return articles;
  } catch (err) {
    console.error('[NewsCron] Error fetching news:', err);
    return db.getCachedArticles();
  }
}

export function initNewsCron() {
  // Fetch immediately on boot if empty or older than 1 hour
  const existing = db.getCachedArticles();
  if (!existing || existing.length === 0) {
    fetchDevToArticles();
  }

  // Schedule every 1 hour ('0 * * * *')
  cron.schedule('0 * * * *', () => {
    console.log('[NewsCron] Running hourly news refresh job...');
    fetchDevToArticles();
  });
}
