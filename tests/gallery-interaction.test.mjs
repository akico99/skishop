import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('keeps generated style references separate from real shop inventory photos', () => {
  assert.equal((html.match(/data-story-category="outfit" data-story-src=/g) || []).length, 9);
  assert.equal((html.match(/data-story-category="equipment" data-story-src=/g) || []).length, 8);
  for (const asset of ['p/의류1.jpg', 'p/의류6.jpg', 'p/장비1.jpg', 'p/장비5.jpg']) {
    assert.ok(html.includes('./' + asset), `Expected real inventory photo: ${asset}`);
  }
  assert.ok(html.includes('data-story-note="스타일 참고"'));
  assert.ok(html.includes('data-story-note="실제 매장"'));
});

test('serves optimized WebP files for the six generated lookbook cards', () => {
  for (const asset of [
    'outfit-lookbook-01-v1.webp', 'outfit-lookbook-02-v1.webp', 'outfit-lookbook-03-v1.webp',
    'equipment-lookbook-01-v1.webp', 'equipment-lookbook-02-v1.webp', 'equipment-lookbook-03-v1.webp'
  ]) {
    const file = path.join(root, 'assets', 'generated', asset);
    assert.ok(html.includes(asset), `Expected generated image reference: ${asset}`);
    assert.ok(fs.statSync(file).size < 300_000, `Expected optimized image under 300 KB: ${asset}`);
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
