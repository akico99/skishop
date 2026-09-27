import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('places the primary locality and business terms in the crawlable page title', () => {
  assert.match(html, /<title>무주리조트스키장 앞 무주놀러와스키샵&amp;렌탈샵<\/title>/);
});

test('provides a visible static heading and factual service introduction', () => {
  const heading = html.match(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/i);
  assert.ok(heading, 'homepage should contain an H1 in the initial HTML');
  assert.doesNotMatch(heading[1], /\bhidden\b|display\s*:\s*none|aria-hidden\s*=\s*["']true/i);
  assert.match(heading[2], /무주리조트스키장 앞 무주스키샵·렌탈샵/);
  assert.match(html, /무주덕유산리조트 정문 앞에서 스키·보드 장비와 의류 대여, 리프트권 할인, 슬로프 앞 배달을 안내합니다\./);
});
