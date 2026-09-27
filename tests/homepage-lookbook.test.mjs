import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const outfitSection = html.slice(html.indexOf('id="outfit-section"'), html.indexOf('id="lesson-section"'));
const requires = (source, pattern, behavior) => assert.ok(pattern.test(source), `Missing behavior: ${behavior}`);

test('explains the 40,000 won package and separates gloves and socks as sales items', () => {
  requires(outfitSection, /data-rental-offer/, 'a distinct package offer card');
  requires(outfitSection, /풀세트[\s\S]{0,120}40,000원/, 'the displayed package price');
  requires(outfitSection, /장비[\s\S]{0,80}의류[\s\S]{0,80}헬멧[\s\S]{0,80}고글/, 'the four included package items');
  requires(outfitSection, /장갑·양말은[\s\S]{0,40}판매/, 'the separate-sale note for gloves and socks');
});

test('provides outfit and equipment as selectable profile-style photo grids', () => {
  requires(outfitSection, /role="tablist"/, 'accessible category tabs');
  requires(outfitSection, /data-lookbook-tab="outfit"[^>]*aria-selected="true"/, 'an initially selected outfit tab');
  requires(outfitSection, /data-lookbook-tab="equipment"/, 'an equipment tab');
  requires(outfitSection, /data-lookbook-grid="outfit"[^>]*role="tabpanel"/, 'an outfit photo grid');
  requires(outfitSection, /data-lookbook-grid="equipment"[^>]*role="tabpanel"/, 'an equipment photo grid');
  requires(outfitSection, /class="[^"]*lookbook-grid/, 'the profile-style grid layout');
});

test('opens photos in an accessible story viewer with navigation and a booking action', () => {
  requires(html, /id="lookbook-story-viewer"[^>]*role="dialog"[^>]*aria-modal="true"/, 'an accessible photo viewer dialog');
  requires(html, /data-story-prev/, 'a previous-photo control');
  requires(html, /data-story-next/, 'a next-photo control');
  requires(html, /data-story-close/, 'a close control');
  requires(html, /data-story-booking[^>]*>[^<]*이 스타일로 예약하기/, 'a booking action');
  requires(html, /function openLookbookStory\s*\(/, 'opening the selected photo');
  requires(html, /function closeLookbookStory\s*\(/, 'closing and restoring focus from the viewer');
});

test('defers all outfit and equipment gallery images until they are needed', () => {
  const imageTags = outfitSection.match(/<img\b[^>]*>/g) || [];
  assert.ok(imageTags.length >= 10, `expected at least 10 gallery images, received ${imageTags.length}`);
  for (const tag of imageTags) assert.match(tag, /loading="lazy"/);
});

test('uses factual, descriptive alternative text for hero slide photos', () => {
  requires(html, /img\.alt\s*=\s*d\.alt\s*\|\|\s*\[texts\.title/, 'descriptive hero-photo alternative text');
  assert.doesNotMatch(html, /<img id="main-slide-img"[^>]*alt="배너"/);
  requires(html, /title:'풀세트 단돈 40,000원'/, 'a concrete promotional hero hook');
  requires(html, /desc:'장비 \+ 의류 \+ 헬멧 \+ 고글 · 오픈 한정가'/, 'a clear list of the advertised package items');
  assert.doesNotMatch(html, /desc:'장비 \+ 의류 \+ 헬멧 \+ 고글 \+ 장갑/);
});

test('uses optimized WebP assets for the generated style references', () => {
  for (const asset of [
    'outfit-lookbook-01-v1.webp', 'outfit-lookbook-02-v1.webp', 'outfit-lookbook-03-v1.webp',
    'equipment-lookbook-01-v1.webp', 'equipment-lookbook-02-v1.webp', 'equipment-lookbook-03-v1.webp'
  ]) {
    requires(html, new RegExp(asset.replaceAll('.', '\\.')), `the optimized ${asset} image`);
    assert.ok(fs.existsSync(path.join(root, 'assets', 'generated', asset)), `Missing image asset: ${asset}`);
  }
});
