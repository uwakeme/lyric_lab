// Crawler scheduler entry point
import cron from 'node-cron';
import * as crawlerService from '../services/crawlerService';
import * as qqMusic from './sources/qqMusic';
import * as neteaseMusic from './sources/neteaseMusic';

const CRAWL_SCHEDULE = process.env.CRAWL_INTERVAL || '0 2 * * *';

export function startCrawlerScheduler() {
  console.log(`Crawler scheduler configured: ${CRAWL_SCHEDULE}`);

  // Run immediately on startup for testing
  // Comment out in production
  // runCrawl();

  cron.schedule(CRAWL_SCHEDULE, () => {
    runCrawl();
  });
}

export async function runCrawl() {
  console.log('Starting scheduled crawl...');

  const sources = [
    { name: 'qqMusic', fetcher: qqMusic.fetchHotSongs },
    { name: 'neteaseMusic', fetcher: neteaseMusic.fetchHotSongs },
  ];

  for (const source of sources) {
    console.log(`Crawling from ${source.name}...`);
    try {
      const result = await crawlerService.crawlFromSource(source.name, source.fetcher);
      console.log(`Crawl result for ${source.name}:`, result);
    } catch (err) {
      console.error(`Crawl failed for ${source.name}:`, err);
    }
  }

  console.log('Scheduled crawl complete');
}

export async function triggerManualCrawl() {
  return runCrawl();
}