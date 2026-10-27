(function () {
  'use strict';

  const liftPrices = {
    weekday: { '3h': [44000, 35000], '4h': [51000, 41000], '6h': [58000, 47000] },
    weekend: { '3h': [54000, 43000], '4h': [61000, 49000], '6h': [69000, 55000] }
  };
  const rentalItems = [
    ['equipment', 'Equipment', 15000],
    ['clothing', 'Clothing', 15000],
    ['helmet', 'Helmet', 10000],
    ['goggles', 'Goggles', 10000],
    ['visor', 'Helmet & goggles set', 15000]
  ];
  const money = value => '₩' + value.toLocaleString('en-US');

  window.initEnglishEstimate = function (root) {
    if (!root || root.nodeType !== 1) throw new TypeError('An element is required');

    root.innerHTML = `
      <style>
        .en-estimate { color: #0f172a; font: inherit; }
        .en-estimate fieldset { border: 1px solid #e2e8f0; border-radius: 12px; margin: 1em 0; padding: 1em; }
        .en-estimate legend { font-weight: 700; padding: 0 .3em; }
        .en-estimate .estimate-row { display: flex; align-items: center; justify-content: space-between; gap: 1em; margin: .7em 0; }
        .en-estimate .estimate-row span { flex: 1; }
        .en-estimate input, .en-estimate select { font: inherit; color: inherit; border: 1px solid #94a3b8; border-radius: 6px; padding: .4em; }
        .en-estimate input { width: 5em; }
        .en-estimate .estimate-total { font-size: 1.2em; font-weight: 700; }
        .en-estimate .estimate-note { font-size: .9em; line-height: 1.5; }
      </style>
      <div class="en-estimate">
        <h2>Rental &amp; lift ticket estimate</h2>
        <label>Price period
          <select data-estimate-period>
            <option value="weekday">Weekday</option>
            <option value="weekend">Weekend</option>
          </select>
        </label>
        <fieldset><legend>Lift tickets</legend>
          ${['3h', '4h', '6h'].map(duration => ['Adult', 'Child'].map((age, index) => `
            <label class="estimate-row"><span>${duration.slice(0, -1)} hours · ${age} <span data-lift-price="${duration}-${index}"></span></span>
              <input type="number" min="0" max="999" step="1" value="0" inputmode="numeric" data-lift="${duration}" data-age="${index}" aria-label="${duration.slice(0, -1)} hour ${age.toLowerCase()} lift tickets quantity">
            </label>`).join('')).join('')}
        </fieldset>
        <fieldset><legend>Rental items</legend>
          ${rentalItems.map(([key, label, price]) => `
            <label class="estimate-row"><span>${label.replace('&', '&amp;')} · ${money(price)} each</span>
              <input type="number" min="0" max="999" step="1" value="0" inputmode="numeric" data-rental="${key}" aria-label="${label.replace('&', '&amp;')} quantity">
            </label>`).join('')}
        </fieldset>
        <p class="estimate-total" aria-live="polite" aria-atomic="true">Estimated total: <span data-estimate-total>₩0</span></p>
        <p class="estimate-note">Estimate only; package promotions are not included. Please contact the shop to confirm prices, availability and conditions. This calculator does not make a reservation.</p>
      </div>`;

    const period = root.querySelector('[data-estimate-period]');
    const inputs = root.querySelectorAll('input[type="number"]');
    const total = root.querySelector('[data-estimate-total]');
    const rentalPrices = Object.fromEntries(rentalItems.map(([key, , price]) => [key, price]));

    function update() {
      const prices = liftPrices[period.value];
      let sum = 0;
      root.querySelectorAll('[data-lift-price]').forEach(label => {
        const [duration, age] = label.dataset.liftPrice.split('-');
        label.textContent = '· ' + money(prices[duration][Number(age)]) + ' each';
      });
      inputs.forEach(input => {
        const value = Number(input.value);
        const quantity = Number.isInteger(value) && value >= 0 && value <= 999 ? value : 0;
        const price = input.dataset.lift
          ? prices[input.dataset.lift][Number(input.dataset.age)]
          : rentalPrices[input.dataset.rental];
        sum += quantity * price;
      });
      total.textContent = money(sum);
    }

    period.addEventListener('change', update);
    inputs.forEach(input => {
      input.addEventListener('input', update);
      input.addEventListener('change', () => {
        const value = Number(input.value);
        if (!Number.isInteger(value) || value < 0 || value > 999) input.value = '0';
        update();
      });
    });
    update();
  };
}());
