import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const snippetStart = html.indexOf('// ===== 이미지 팝업(모달) 열기/닫기 =====');
const snippetEnd = html.indexOf('</script>', snippetStart);
assert.ok(snippetStart >= 0 && snippetEnd > snippetStart, 'legacy image-modal handlers must exist');

test('Escape does not throw when the legacy image modal is absent', () => {
  const handlers = {};
  const context = {
    document: {
      getElementById() { return null; },
      addEventListener(type, handler) { handlers[type] = handler; },
      body: { style: {} }
    }
  };
  context.window = context;
  vm.runInNewContext(html.slice(snippetStart, snippetEnd), context);

  assert.doesNotThrow(() => handlers.keydown({ key: 'Escape' }));
});
