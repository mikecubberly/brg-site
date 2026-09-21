import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

// Copy only the approved redesign's public files. Existing tools, functions,
// racing pages and other unrelated routes are intentionally not removed.
const source = process.argv[2];
if (!source) throw new Error('Provide the validated redesign public directory');
const previewOrigin = 'https://bottle-rocket-growth-next.mikecubberly.chatgpt.site';
const publicOrigin = 'https://bottlerocketgrowth.com';
const publicRouteRewrites = [
  ['/insights/defining-an-icp-that-converts.html', '/insights/defining-an-icp-that-converts'],
  ['/insights/signal-based-list-building.html', '/insights/signal-based-list-building'],
  ['/insights/linkedin-sender-profile-strategy.html', '/insights/linkedin-sender-profile-strategy'],
  ['/insights/heyreach-sequence-architecture.html', '/insights/heyreach-sequence-architecture'],
];
const homepage = readFileSync('index.html', 'utf8');
const analytics = homepage.match(/<script>[^<]*window\.reb2b[^<]*<\/script>/)?.[0];
if (!analytics) throw new Error('Existing production analytics must be preserved');
function copy(dir, relative = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = join(relative, entry.name), input = join(dir, entry.name);
    if (entry.isDirectory()) { mkdirSync(rel, { recursive: true }); copy(input, rel); continue; }
    if (/\.(html|css|js)$/.test(entry.name)) {
      let text = readFileSync(input, 'utf8').replaceAll(previewOrigin, publicOrigin);
      for (const [sourceRoute, publicRoute] of publicRouteRewrites) text = text.replaceAll(sourceRoute, publicRoute);
      if (entry.name.endsWith('.html')) text = text.replace(/(<meta name="(?:robots|googlebot)" content=")noindex, nofollow("\s*\/?>)/g, '$1index, follow$2');
      if (rel === 'index.html') text = text.replace('<head>', '<head>\n' + analytics);
      writeFileSync(rel, text);
    } else copyFileSync(input, rel);
  }
}
copy(source);
console.log('Imported redesign with public canonical URLs and indexing; preserved existing routes and homepage analytics.');
