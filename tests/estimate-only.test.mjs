import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const html = fs.readFileSync(path.resolve(import.meta.dirname, '..', 'index.html'), 'utf8');
const mobileStart = html.indexOf('class="mobile-bottom-bar');
const mobileEnd = html.indexOf('</div>', mobileStart);
const mobileBar = html.slice(mobileStart, mobileEnd);
const quoteLogicStart = html.indexOf('// ===== 견적 아코디언 =====');
const quoteLogicEnd = html.indexOf('/* ===== 단계형 예약 신청 =====', quoteLogicStart);
const quoteLogic = html.slice(quoteLogicStart, quoteLogicEnd);

test('mobile estimate opens calculation mode while reservation keeps the step form', () => {
  assert.ok(/onclick="openEstimate\(\)"/.test(mobileBar), 'estimate button opens estimate mode');
  assert.ok(/onclick="openQuote\(\)"[^>]*>[\s\S]*?예약신청/.test(mobileBar), 'reservation button retains its booking action');

  const classes = new Set();
  const attributes = {};
  let bookingOpens = 0;
  let scrollOptions = null;
  const quoteSection = {
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value),
      toggle: (value, force) => force ? classes.add(value) : classes.delete(value),
      contains: value => classes.has(value)
    },
    scrollIntoView: options => { scrollOptions = options; }
  };
  const quoteBtn = {
    setAttribute: (key, value) => { attributes[key] = value; },
    scrollIntoView: options => { scrollOptions = options; }
  };
  const quoteIcon = { style: {} };
  const quoteModeTitle = { textContent: '' };
  const quoteModeDescription = { textContent: '' };
  const quoteModeBadge = { textContent: '' };
  const context = {
    document: {
      getElementById(id) {
        return {
          'quote-btn': quoteBtn,
          'quote-section': quoteSection,
          'quote-icon': quoteIcon,
          'quote-mode-title': quoteModeTitle,
          'quote-mode-description': quoteModeDescription,
          'quote-mode-badge': quoteModeBadge
        }[id] || null;
      }
    },
    openStepForm() { bookingOpens++; }
  };
  context.window = context;
  vm.runInNewContext(quoteLogic, context);

  context.openEstimate();
  assert.equal(classes.has('estimate-only'), true);
  assert.equal(attributes['aria-expanded'], 'true');
  assert.equal(scrollOptions.behavior, 'smooth');
  assert.equal(bookingOpens, 0, 'estimate must not open reservation intake');

  context.openQuote();
  assert.equal(classes.has('estimate-only'), false);
  assert.equal(bookingOpens, 1, 'reservation must still open the existing step form');
});

test('estimate mode hides reservation fields and clearly states that no booking is submitted', () => {
  assert.ok(/#quote-section\.estimate-only\s+\[data-reservation-only\]/.test(html), 'reservation-only elements are hidden during estimates');
  assert.ok(/data-reservation-only[^>]*id="reserve-submit-btn"|id="reserve-submit-btn"[^>]*data-reservation-only/.test(html), 'the reservation submit control is hidden during estimates');
  assert.ok(/data-estimate-note[^>]*>\s*예상 금액 확인용입니다\. 예약은 접수되지 않습니다\./.test(html), 'estimate-only mode explains that no booking is submitted');
});
