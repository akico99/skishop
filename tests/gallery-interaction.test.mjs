import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('uses the generated hero asset in the fallback main slide', () => {
  assert.match(html, /assets\/generated\/hero-hook-v1\.png/);
});

test('renders the generated apparel visual in the outfit panel', () => {
  assert.match(html, /assets\/generated\/apparel-equipment-cards-v1\.png/);
});

test('renders the additional lookbook assets in the matching galleries', () => {
  for (const asset of [
    'outfit-lookbook-01-v1.png',
    'outfit-lookbook-02-v1.png',
    'outfit-lookbook-03-v1.png',
    'equipment-lookbook-01-v1.png',
    'equipment-lookbook-02-v1.png',
    'equipment-lookbook-03-v1.png'
  ]) {
    assert.match(html, new RegExp(`assets\\/generated\\/${asset}`));
  }
  assert.match(html, /스타일 참고/);
  assert.match(html, /사용 장면 참고/);
});

test('uses swipeable galleries for both outfit and equipment sections', () => {
  assert.match(html, /data-gallery="outfit"[^>]*class="[^"]*swipe-gallery/);
  assert.match(html, /data-gallery="equipment"[^>]*class="[^"]*swipe-gallery/);
  assert.match(html, /data-gallery-prev="outfit"/);
  assert.match(html, /data-gallery-next="outfit"/);
  assert.match(html, /data-gallery-prev="equipment"/);
  assert.match(html, /data-gallery-next="equipment"/);
});

test('provides reduced-motion support for gallery transitions', () => {
  assert.match(html, /prefers-reduced-motion:\s*reduce/);
});
