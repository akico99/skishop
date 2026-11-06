import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('lookbook uses real model and shop photos only', () => {
  // 의류: 전신 9 + 상의 위주 9 + 실제 매장 3, 장비: 실제 보유 장비 4
  assert.equal((html.match(/data-story-category="outfit" data-story-src=/g) || []).length, 21);
  assert.equal((html.match(/data-story-category="equipment" data-story-src=/g) || []).length, 4);
  assert.doesNotMatch(html, /assets\/generated\//, 'AI-generated images should no longer be referenced');
  assert.doesNotMatch(html, /\.\/p\/(의류|장비|안전장비)\d\.jpg/, 'placeholder photos should no longer be referenced');
  assert.ok(html.includes('data-story-note="26/27 모델컷"'));
  assert.ok(html.includes('data-story-note="실제 매장"'));
  assert.ok(html.includes('data-story-note="실제 보유 장비"'));
});

test('drops the store and equipment photos the owner asked to remove', () => {
  const lookbook = html.slice(html.indexOf('id="lookbook-grid-outfit"'), html.indexOf('id="lesson-section"'));
  for (const tag of ['#레드블루', '#탈의실', '#정문앞', '#아동부터성인까지', '#스키룩']) {
    assert.ok(!lookbook.includes(tag), `removed photo is still listed: ${tag}`);
  }
  assert.equal((lookbook.match(/data-story-note="실제 매장"/g) || []).length, 3);
});

test('serves every lookbook photo from optimized files under 400 KB', () => {
  const srcs = [...new Set([...html.matchAll(/data-story-src="\.\/(assets\/photos\/[^"]+)"/g)].map((m) => m[1]))];
  assert.ok(srcs.length >= 12, `expected at least 12 lookbook photos, got ${srcs.length}`);
  for (const rel of srcs) {
    const file = path.join(root, rel);
    assert.ok(fs.existsSync(file), `Missing image asset: ${rel}`);
    assert.ok(fs.statSync(file).size < 400_000, `Expected optimized image under 400 KB: ${rel}`);
  }
});

test('supports keyboard, touch, reduced-motion and booking actions in the photo viewer', () => {
  assert.ok(html.includes("event.key === 'ArrowLeft'"));
  assert.ok(html.includes("event.key === 'ArrowRight'"));
  assert.ok(html.includes("event.key === 'Escape'"));
  assert.ok(html.includes("prefers-reduced-motion: reduce"));
  assert.ok(html.includes('data-story-booking'));
  assert.ok(html.includes("moveStory(distance < 0 ? 1 : -1)"));
});
