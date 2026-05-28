// Crawler scheduler entry point
import cron from 'node-cron';
import * as crawlerService from '../services/crawlerService';
import * as qqMusic from './sources/qqMusic';
import * as neteaseMusic from './sources/neteaseMusic';

const CRAWL_SCHEDULE = process.env.CRAWL_INTERVAL || '0 2 * * *';

export function startCrawlerScheduler() {
  console.log(`Crawler scheduler configured: ${CRAWL_SCHEDULE}`);

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

  const results = await Promise.allSettled(
    sources.map(async source => {
      console.log(`Crawling from ${source.name}...`);
      const result = await crawlerService.crawlFromSource(source.name, source.fetcher);
      console.log(`Crawl result for ${source.name}:`, result);
      return result;
    })
  );

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Crawl failed:', result.reason);
    }
  }

  console.log('Scheduled crawl complete');
}

export async function triggerManualCrawl() {
  return runCrawl();
}
