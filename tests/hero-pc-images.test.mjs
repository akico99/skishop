import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fillSrc = html.match(/function fillSlide\(d\) \{[\s\S]*?\n\}\n/)[0];

function runFill(isPc, slide) {
  const props = {};
  const img = { style: { setProperty: (k, v) => { props[k] = v; } } };
  const ctx = {
    isPcMode: () => isPc,
    freshFocal: () => ({ focalX: 50, focalY: 50, zoom: 1 }),
    heroTextStyle: { order: [] },
    document: { getElementById: (id) => (id === 'main-slide-img' ? img : null) },
  };
  vm.runInNewContext(fillSrc + '\nfillSlide(slide);', { ...ctx, slide });
  return { src: img.src, props };
}

test('PC hero uses wide images with full framing instead of square-era zoom', () => {
  for (const name of ['1.jpg', '2.jpg', '4.jpg']) {
    const slide = { img: './' + name, texts: {}, pc: { focalX: 100, focalY: 13.5, zoom: 1.4 }, mobile: { focalX: 100, focalY: 19.7, zoom: 1.35 } };
    const pc = runFill(true, slide);
    assert.match(pc.src, new RegExp('^\\./' + name.replace('.jpg', '-pc\\.jpg')));
    assert.equal(pc.props['--zoom'], 1);
    assert.ok(fs.existsSync(path.join(root, name.replace('.jpg', '-pc.jpg'))), 'missing PC image for ' + name);
    const mobile = runFill(false, slide);
    assert.match(mobile.src, new RegExp('^\\./' + name.replace('.', '\\.')));
    assert.equal(mobile.props['--zoom'], 1.35);
  }
});

test('custom admin-uploaded hero images keep their saved PC framing', () => {
  const custom = { img: 'https://example.com/a.jpg', texts: {}, pc: { focalX: 30, focalY: 40, zoom: 1.2 } };
  const r = runFill(true, custom);
  assert.equal(r.src, 'https://example.com/a.jpg');
  assert.equal(r.props['--zoom'], 1.2);
});
