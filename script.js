import {
  state,
  CATEGORIES,
  EXPENSE_CATEGORIES,
  getGreeting,
  getMonthMetrics,
  getVaultSummary,
  addTransaction,
  deleteTransaction,
  isMonthClosed,
  toggleNoSpendDay,
  getNoSpendStats,
  addCommitment,
  removeCommitment,
  isCommitmentPaid,
  getCommitmentPaidAmount,
  payCommitment,
  linkCommitmentPayment,
  unpayCommitment,
  getBudgetSummary
} from './userModule.js';

import {
  SYMBOLS,
  exchangeCurrency,
  formatFromBase,
  toBaseMyr
} from './currencyExchange.js';


function fmt(amountMyr, showPlus = false) {
  return formatFromBase(amountMyr, state.displayCurrency, state.exchangeRate, showPlus);
}

// Shows a small message in the bottom-right corner for 2.8 seconds
function showToast(msg) {
  document.getElementById('toast-message').textContent = msg;
  const toast = document.getElementById('app-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function renderKPIs() {
  const vault = getVaultSummary();
  const nov = getMonthMetrics('2026-11');
  const noSpend = getNoSpendStats();

  // 1. Accumulated Vault
  document.getElementById('kpi-vault-total').textContent = fmt(vault.totalVaultMyr);
  document.getElementById('kpi-vault-sub').textContent = `Feb–Oct ${fmt(vault.pastSurplus)} + Nov ${fmt(vault.novSurplus)} so far`;

  // 2. Salary Left to Spend
  document.getElementById('kpi-salary-pct-badge').textContent = `${nov.salaryRemainingPct.toFixed(1)}% left`;
  document.getElementById('kpi-salary-remaining').textContent = fmt(nov.unspentRemaining);
  document.getElementById('kpi-salary-bar').style.width = `${nov.salaryRemainingPct.toFixed(1)}%`;
  document.getElementById('kpi-salary-sub').textContent = `of ${fmt(nov.income)} monthly salary`;

  // 3. Zero-Spend Days
  document.getElementById('kpi-nospend-count').textContent = `${noSpend.count} / ${noSpend.totalDays} days`;
  document.getElementById('kpi-nospend-bar').style.width = `${noSpend.pct}%`;
  document.getElementById('kpi-nospend-sub').textContent = `${noSpend.pct}% of ${noSpend.target}-day monthly restraint goal`;
}

function renderMonthPills() {
  const container = document.getElementById('month-pills-container');
  container.innerHTML = '';

  state.months.forEach(m => {
    const metrics = getMonthMetrics(m.id);
    const isSelected = state.selectedMonth === m.id;
    const netVal = metrics.netOperatingSurplus;
    const closed = isMonthClosed(m.id);

    const col = document.createElement('div');
    col.className = 'col-2';
    col.innerHTML = `
      <button type="button" class="hr-month-tile ${isSelected ? 'active' : ''}" data-month="${m.id}">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="fw-bold small">${m.label}</span>
          <span class="badge rounded-pill ${closed ? 'bg-light text-secondary border' : 'hr-pill-emerald'}" style="font-size:0.65rem;">
            ${closed ? 'Closed' : 'Open'}
          </span>
        </div>
        <div class="fw-bold tabular-nums ${netVal >= 0 ? 'text-success' : 'text-danger'}" style="font-size:0.95rem;">
          ${fmt(netVal, true)}
        </div>
        <div class="text-muted" style="font-size:0.7rem;">
          ${closed ? 'Saved to Vault' : 'Surplus so far'}
        </div>
      </button>
    `;

    col.querySelector('button').addEventListener('click', () => {
      state.selectedMonth = m.id;
      renderAll();
    });

    container.appendChild(col);
  });

  const activeMonthObj = state.months.find(m => m.id === state.selectedMonth);
  if (activeMonthObj) {
    document.getElementById('selected-month-label').textContent = `${activeMonthObj.label} (${isMonthClosed(activeMonthObj.id) ? 'Closed' : 'Open'})`;
  }
}

function renderLedgerTable() {
  const tbody = document.getElementById('ledger-tbody');
  tbody.innerHTML = '';

  const activeMonthObj = state.months.find(m => m.id === state.selectedMonth);
  document.getElementById('ledger-subtitle').textContent = `Showing recorded entries for ${activeMonthObj ? activeMonthObj.label : state.selectedMonth}`
    + (isMonthClosed(state.selectedMonth) ? ' · closed, entries are locked' : '');

  const filtered = state.transactions.filter(tx => {
    if (tx.month !== state.selectedMonth) return false;
    if (state.filterType === 'credit') return tx.amount > 0;
    if (state.filterType === 'debit') return tx.amount < 0;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No entries match this filter.</td></tr>`;
  } else {
    // Past months are closed, so their entries can't be deleted
    const monthLocked = isMonthClosed(state.selectedMonth);

    filtered.forEach(tx => {
      const tr = document.createElement('tr');
      const isPositive = tx.amount > 0;
      tr.innerHTML = `
        <td class="text-muted tabular-nums text-nowrap">${tx.date}</td>
        <td class="fw-medium">${tx.desc}</td>
        <td><span class="badge rounded-pill bg-light text-dark border fw-normal">${tx.category}</span></td>
        <td class="text-end fw-bold tabular-nums text-nowrap ${isPositive ? 'text-success' : 'text-dark'}">
          ${fmt(tx.amount, true)}
        </td>
        <td class="text-end">
          ${monthLocked
            ? '<span class="badge bg-light text-muted border fw-normal">Locked</span>'
            : `<button type="button" class="btn btn-sm btn-link text-danger text-decoration-none p-0 small" data-delete="${tx.id}">Delete</button>`
          }
        </td>
      `;

      const deleteBtn = tr.querySelector('[data-delete]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (!confirm(`Delete "${tx.desc}"? This can't be undone.`)) return;
          deleteTransaction(tx.id);
          renderAll();
          showToast(`Deleted "${tx.desc}"`);
        });
      }

      tbody.appendChild(tr);
    });
  }
}

function renderNoSpendGrid() {
  const grid = document.getElementById('nospend-grid');
  const stats = getNoSpendStats();
  document.getElementById('restraint-header-count').textContent = `${stats.count} / ${stats.totalDays} Zero-Spend Days`;

  grid.innerHTML = '';
  state.noSpendDays.forEach(d => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'hr-day-tile';
    if (d.zeroSpend) tile.classList.add('is-green');

    tile.innerHTML = `
      ${d.zeroSpend ? '<span class="hr-day-flame">🔥</span>' : ''}
      <span>${d.day}</span>
    `;

    tile.addEventListener('click', () => {
      toggleNoSpendDay(d.day);
      renderAll();
    });

    grid.appendChild(tile);
  });
}

// Shows the current currency symbol (e.g. RM, $) in front of the Amount box
function updateEntryCurrencyPrefix() {
  document.getElementById('entry-currency-prefix').textContent =
    (SYMBOLS[state.displayCurrency] || state.displayCurrency).trim();
}

function renderBudget() {
  const summary = getBudgetSummary();
  const pctShare = Math.min(100, summary.sharePct);

  document.getElementById('budget-total').textContent = fmt(summary.total);
  document.getElementById('budget-count').textContent =
    `${summary.count} commitment${summary.count === 1 ? '' : 's'} per month`;
  document.getElementById('budget-share').textContent = `${summary.sharePct.toFixed(1)}%`;
  document.getElementById('budget-share-bar').style.width = `${pctShare}%`;
  document.getElementById('budget-share-sub').textContent = `of ${fmt(summary.income)} monthly salary`;
  const freeEl = document.getElementById('budget-free');
  freeEl.textContent = fmt(summary.leftAfter);
  freeEl.classList.toggle('text-danger', summary.leftAfter < 0);
  document.getElementById('budget-paid').textContent = `${summary.paidCount} / ${summary.count}`;
  document.getElementById('budget-unpaid').textContent = `${fmt(summary.unpaidTotal)} still to pay`;
  document.getElementById('budget-currency-prefix').textContent =
    (SYMBOLS[state.displayCurrency] || state.displayCurrency).trim();

  const tbody = document.getElementById('budget-tbody');
  tbody.innerHTML = '';

  if (state.commitments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No commitments yet. Add your first one above.</td></tr>';
    return;
  }

  state.commitments.forEach(c => {
    const paid = isCommitmentPaid(c);
    const paidAmount = getCommitmentPaidAmount(c);
    // If the ledger entry's amount differs from the plan, strike the planned amount
    const amountChanged = paidAmount !== null && Math.abs(paidAmount - c.amount) >= 0.005;
    const amountCell = amountChanged
      ? `<s class="text-muted fw-normal me-1" title="Planned amount">${fmt(c.amount)}</s>
         <span class="${paidAmount > c.amount ? 'text-danger' : 'text-success'}" title="Amount logged in ledger">${fmt(paidAmount)}</span>`
      : fmt(c.amount);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-medium" data-cell="name"></td>
      <td><span class="badge rounded-pill hr-pill-violet fw-semibold" data-cell="category"></span></td>
      <td class="text-end fw-bold tabular-nums text-nowrap">${amountCell}</td>
      <td class="text-end">
        ${paid
          ? '<span class="badge rounded-pill hr-pill-emerald">Paid</span>'
          : '<span class="badge rounded-pill hr-pill-amber">Due</span>'}
      </td>
      <td class="text-end text-nowrap">
        <button type="button" class="btn btn-sm btn-link text-decoration-none p-0 small me-3 ${paid ? 'text-secondary' : 'hr-link-violet'}" data-action="toggle-paid">${paid ? 'Undo paid' : 'Mark paid'}</button>
        <button type="button" class="btn btn-sm btn-link text-danger text-decoration-none p-0 small" data-action="remove">Remove</button>
      </td>
    `;
    // User-entered text goes in via textContent
    tr.querySelector('[data-cell="name"]').textContent = c.name;
    tr.querySelector('[data-cell="category"]').textContent = c.category;

    tr.querySelector('[data-action="toggle-paid"]').addEventListener('click', () => {
      if (paid) {
        unpayCommitment(c.id);
        renderAll();
        showToast(`Undid payment for "${c.name}"`);
      } else {
        const result = payCommitment(c.id);
        renderAll();
        showToast(result.ok
          ? `Logged ${fmt(-c.amount, true)} for "${c.name}" in the ledger`
          : result.reason);
      }
    });

    tr.querySelector('[data-action="remove"]').addEventListener('click', () => {
      removeCommitment(c.id);
      renderAll();
      showToast(`Removed "${c.name}"`);
    });

    tbody.appendChild(tr);
  });
}

// Keeps the Log Entry "From commitment" dropdown in sync with saved commitments
function renderCommitmentPicker() {
  const select = document.getElementById('entry-commitment');
  const current = select.value;
  select.innerHTML = '<option value="">— None, enter manually —</option>';

  // Only unpaid commitments are offered; paid ones drop out until undone
  state.commitments
    .filter(c => !isCommitmentPaid(c))
    .forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} · ${fmt(c.amount)}`;
      select.appendChild(opt);
    });

  const stillValid = state.commitments.some(c => c.id === current && !isCommitmentPaid(c));
  select.value = stillValid ? current : '';

  // If the chosen commitment was just paid elsewhere, clear the details it filled in
  if (current && !stillValid) {
    document.getElementById('entry-amount').value = '';
    document.getElementById('entry-desc').value = '';
  }
}

// "Hi Khairah Karim 👋" header greeting, from the User profile
function renderGreeting() {
  const greeting = document.getElementById('hello-user');
  if (greeting) {
    greeting.textContent = `${getGreeting()} `;
    const wave = document.createElement('span');
    wave.className = 'hr-wave';
    wave.setAttribute('aria-hidden', 'true');
    wave.textContent = '👋';
    greeting.appendChild(wave);
  }
}

function renderAll() {
  renderKPIs();
  renderMonthPills();
  renderLedgerTable();
  renderNoSpendGrid();
  renderBudget();
  renderCommitmentPicker();
  updateEntryCurrencyPrefix();
}

function bindEvents() {
  // Direction switchers
  const debitBtn = document.getElementById('dir-debit');
  const creditBtn = document.getElementById('dir-credit');

  debitBtn.addEventListener('click', () => {
    state.entryDirection = 'debit';
    debitBtn.classList.add('active');
    creditBtn.classList.remove('active');
  });

  creditBtn.addEventListener('click', () => {
    state.entryDirection = 'credit';
    creditBtn.classList.add('active');
    debitBtn.classList.remove('active');
  });

  // Choosing a commitment fills in the Log Entry form
  document.getElementById('entry-commitment').addEventListener('change', e => {
    const c = state.commitments.find(x => x.id === e.target.value);
    if (!c) return;
    debitBtn.click(); // commitments are always expenses
    const display = c.amount * state.exchangeRate;
    document.getElementById('entry-amount').value = display.toFixed(2);
    document.getElementById('entry-desc').value = c.name;
    document.getElementById('entry-category').value = c.category;
  });

  // Inline Entry Submit
  document.getElementById('inline-entry-form').addEventListener('submit', e => {
    e.preventDefault();
    const rawAmt = parseFloat(document.getElementById('entry-amount').value);
    const desc = document.getElementById('entry-desc').value.trim();
    const category = document.getElementById('entry-category').value;
    const date = document.getElementById('entry-date').value;

    if (!Number.isFinite(rawAmt) || rawAmt <= 0 || !desc) return;

    const baseMyr = toBaseMyr(rawAmt, state.exchangeRate);
    const signedAmountMyr = state.entryDirection === 'credit' ? Math.abs(baseMyr) : -Math.abs(baseMyr);

    const tx = addTransaction({ date, desc, category, signedAmountMyr });
    const commitmentSelect = document.getElementById('entry-commitment');
    const linked = commitmentSelect.value
      ? linkCommitmentPayment(commitmentSelect.value, tx.id)
      : false;

    document.getElementById('entry-amount').value = '';
    document.getElementById('entry-desc').value = '';
    commitmentSelect.value = '';
    renderAll();
    showToast(`Recorded ${fmt(signedAmountMyr, true)} (${desc})${linked ? ' and marked commitment paid' : ''}`);
  });

  // Ledger Filter Buttons
  document.querySelectorAll('#ledger-filter-group button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#ledger-filter-group button').forEach(b => {
        b.className = 'btn btn-outline-secondary';
      });
      btn.className = 'btn btn-dark active';
      state.filterType = btn.dataset.filter;
      renderLedgerTable();
    });
  });

  // Budget: Add Commitment
  document.getElementById('budget-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('budget-name').value.trim();
    const rawAmt = parseFloat(document.getElementById('budget-amount').value);
    const category = document.getElementById('budget-category').value;

    if (!name || !Number.isFinite(rawAmt) || rawAmt <= 0) return;

    const amountMyr = toBaseMyr(rawAmt, state.exchangeRate);
    addCommitment({ name, category, amountMyr });
    e.target.reset();
    renderAll();
    showToast(`Saved "${name}" as a monthly commitment`);
  });

  // Currency Switcher
  document.getElementById('currency-select').addEventListener('change', async e => {
    const target = e.target.value;
    const badge = document.getElementById('fx-rate-badge');
    badge.textContent = 'Updating...';

    const rate = await exchangeCurrency('MYR', target);

    // Couldn't get a rate: stay on the current currency and let the user know
    if (rate === null) {
      e.target.value = state.displayCurrency;
      const decimalsNow = state.displayCurrency === 'JPY' ? 2 : 4;
      badge.textContent = `1 MYR = ${state.exchangeRate.toFixed(decimalsNow)} ${state.displayCurrency}`;
      showToast(`Couldn't get the ${target} rate. Check your connection and try again.`);
      return;
    }

    state.displayCurrency = target;
    state.exchangeRate = rate;

    const decimals = target === 'JPY' ? 2 : 4;
    badge.textContent = `1 MYR = ${rate.toFixed(decimals)} ${target}`;
    renderAll();
  });

  // Sidebar Tabs: Overview / Ledger
  // Sidebar Tabs: one button and one page for each tab
  const tabOverview = document.getElementById('tab-overview');
  const tabLedger = document.getElementById('tab-ledger');
  const tabBudget = document.getElementById('tab-budget');

  const viewOverview = document.getElementById('view-overview');
  const viewLedger = document.getElementById('view-ledger');
  const viewBudget = document.getElementById('view-budget');

  function switchTab(name) {
    // 1. Hide every page and un-highlight every button
    viewOverview.classList.add('d-none');
    viewLedger.classList.add('d-none');
    viewBudget.classList.add('d-none');

    tabOverview.classList.remove('active');
    tabLedger.classList.remove('active');
    tabBudget.classList.remove('active');

    // 2. Show the chosen page and highlight its button
    if (name === 'overview') {
      viewOverview.classList.remove('d-none');
      tabOverview.classList.add('active');
    } else if (name === 'ledger') {
      viewLedger.classList.remove('d-none');
      tabLedger.classList.add('active');
    } else if (name === 'budget') {
      viewBudget.classList.remove('d-none');
      tabBudget.classList.add('active');
    }

    // 3. Go back to the top of the page
    window.scrollTo(0, 0);
  }

  tabOverview.addEventListener('click', () => {
    switchTab('overview');
  });

  tabLedger.addEventListener('click', () => {
    switchTab('ledger');
  });

  tabBudget.addEventListener('click', () => {
    switchTab('budget');
  });
}

// Fills a <select> from the shared category list
function fillCategorySelect(selectId, categories, defaultCategory) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === defaultCategory) opt.defaultSelected = opt.selected = true; // survives form.reset()
    select.appendChild(opt);
  });
}

fillCategorySelect('entry-category', CATEGORIES);
fillCategorySelect('budget-category', EXPENSE_CATEGORIES, '#Bills');
bindEvents();
renderGreeting();
renderAll();
