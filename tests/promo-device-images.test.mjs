import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// HTML 안의 함수 선언 하나를 중괄호 짝을 세어 그대로 잘라냄
function extractFunction(html, name) {
  const start = html.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' should exist');
  let depth = 0;
  for (let i = html.indexOf('{', start); i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('unbalanced ' + name);
}

function load(file, names) {
  const html = read(file);
  const context = {};
  vm.runInNewContext(names.map((n) => extractFunction(html, n)).join('\n'), context);
  return context;
}

const legacySlide = { img: 'https://example.com/poster.png', mobile: { focalX: 50, focalY: 10, zoom: 1 }, pc: { focalX: 50, focalY: 0, zoom: 1.05 } };

test('admin keeps an old shared popup photo on both screens and stores photos per screen', () => {
  const admin = load('admin.html', ['freshFocal', 'promoSlideShown', 'promoNormalizeSize', 'promoMigrateConfig', 'promoSetSlideImg', 'promoSlideImg']);
  const config = admin.promoMigrateConfig({ enabledMobile: false, enabledPc: true, slides: [legacySlide] });
  const slide = config.slides[0];
  assert.equal(slide.img, undefined, 'the shared img field is replaced by per-screen photos');
  assert.equal(slide.imgs.mobile, legacySlide.img);
  assert.equal(slide.imgs.pc, legacySlide.img);
  assert.equal(slide.show.mobile, true);
  assert.equal(slide.show.pc, true);

  admin.promoSetSlideImg(slide, 'mobile', 'https://example.com/mobile.jpg');
  assert.equal(admin.promoSlideImg(slide, 'mobile'), 'https://example.com/mobile.jpg');
  assert.equal(admin.promoSlideImg(slide, 'pc'), legacySlide.img, 'uploading for mobile must not change the PC photo');
});

test('admin keeps per-screen photos and hidden flags that were already saved', () => {
  const admin = load('admin.html', ['freshFocal', 'promoSlideShown', 'promoNormalizeSize', 'promoMigrateConfig']);
  const saved = { imgs: { mobile: '', pc: 'https://example.com/pc.png' }, show: { mobile: false, pc: true } };
  const slide = admin.promoMigrateConfig({ slides: [saved] }).slides[0];
  assert.equal(slide.imgs.mobile, '');
  assert.equal(slide.imgs.pc, 'https://example.com/pc.png');
  assert.equal(slide.show.mobile, false);
  assert.equal(slide.show.pc, true);
});

test('site shows each screen its own popup photo and skips slides hidden on that screen', () => {
  const site = load('index.html', ['promoSlideImg', 'promoSlideShown']);
  assert.equal(site.promoSlideImg(legacySlide, 'mobile'), legacySlide.img, 'old shared photo still shows on mobile');
  assert.equal(site.promoSlideImg(legacySlide, 'pc'), legacySlide.img, 'old shared photo still shows on PC');

  const split = { imgs: { mobile: 'https://example.com/m.jpg', pc: '' }, show: { mobile: true, pc: false } };
  assert.equal(site.promoSlideImg(split, 'mobile'), 'https://example.com/m.jpg');
  assert.equal(site.promoSlideImg(split, 'pc'), '', 'an empty PC photo stays empty instead of reusing the mobile one');
  assert.equal(site.promoSlideShown(split, 'mobile'), true);
  assert.equal(site.promoSlideShown(split, 'pc'), false);
  assert.equal(site.promoSlideShown({}, 'pc'), true, 'slides without a show setting stay visible');
});

test('admin and site inline scripts still parse', () => {
  for (const file of ['admin.html', 'index.html']) {
    const scripts = [...read(file).matchAll(/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    scripts.forEach((code, i) => {
      assert.doesNotThrow(() => new vm.Script(code, { filename: file + '#script' + i }), file + ' script ' + i);
    });
  }
});

