class User {
  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  get fullname() {
    // Issue #3 The object’s fields are only reachable through this
    return `${this.firstName} ${this.lastName}`;
  }
}

const ACTIVE_MONTH = '2026-11';
const TODAY = '2026-11-21';

// Single category list shared by ledger entries and budget commitments
const CATEGORIES = ['#Food', '#Transport', '#Bills', '#Shopping', '#Health', '#Income'];
const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c !== '#Income');

const state = {
  user: {
    profile: new User('Khairah', 'Karim')
  },
  selectedMonth: '2026-11',
  filterType: 'all',
  entryDirection: 'debit',
  displayCurrency: 'MYR',
  exchangeRate: 1,
  months: [
    { id: '2026-02', label: 'Feb 2026' },
    { id: '2026-03', label: 'Mar 2026' },
    { id: '2026-04', label: 'Apr 2026' },
    { id: '2026-05', label: 'May 2026' },
    { id: '2026-06', label: 'Jun 2026' },
    { id: '2026-07', label: 'Jul 2026' },
    { id: '2026-08', label: 'Aug 2026' },
    { id: '2026-09', label: 'Sep 2026' },
    { id: '2026-10', label: 'Oct 2026' },
    { id: '2026-11', label: 'Nov 2026' }
  ],
  transactions: [
    // Past months (closed): just salary in and expenses out
    // Feb 2026
    { id: 'TX-011', month: '2026-02', date: '2026-02-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-012', month: '2026-02', date: '2026-02-28', desc: 'Monthly Expenses', category: '#Bills', amount: -4100.00 },

    // Mar 2026
    { id: 'TX-021', month: '2026-03', date: '2026-03-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-022', month: '2026-03', date: '2026-03-28', desc: 'Monthly Expenses', category: '#Bills', amount: -4020.00 },

    // Apr 2026
    { id: 'TX-031', month: '2026-04', date: '2026-04-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-032', month: '2026-04', date: '2026-04-28', desc: 'Monthly Expenses', category: '#Bills', amount: -4200.00 },

    // May 2026
    { id: 'TX-041', month: '2026-05', date: '2026-05-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-042', month: '2026-05', date: '2026-05-28', desc: 'Monthly Expenses', category: '#Bills', amount: -3940.00 },

    // Jun 2026
    { id: 'TX-051', month: '2026-06', date: '2026-06-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-052', month: '2026-06', date: '2026-06-28', desc: 'Monthly Expenses', category: '#Bills', amount: -4050.00 },

    // Jul 2026
    { id: 'TX-061', month: '2026-07', date: '2026-07-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-062', month: '2026-07', date: '2026-07-28', desc: 'Monthly Expenses', category: '#Bills', amount: -4070.00 },

    // August 2026
    { id: 'TX-101', month: '2026-08', date: '2026-08-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-102', month: '2026-08', date: '2026-08-14', desc: 'Living, Utilities & Dining', category: '#Bills', amount: -4150.00 },

    // September 2026
    { id: 'TX-201', month: '2026-09', date: '2026-09-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-202', month: '2026-09', date: '2026-09-18', desc: 'Property & Travel Expenses', category: '#Transport', amount: -3980.00 },

    // October 2026
    { id: 'TX-301', month: '2026-10', date: '2026-10-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-302', month: '2026-10', date: '2026-10-20', desc: 'Groceries, Fitness & Bills', category: '#Food', amount: -3890.00 },

    // November 2026 (Active Open Cycle)
    { id: 'TX-401', month: '2026-11', date: '2026-11-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-402', month: '2026-11', date: '2026-11-04', desc: 'Maya Bay Maintenance & Wi-Fi', category: '#Bills', amount: -1480.00 },
    { id: 'TX-403', month: '2026-11', date: '2026-11-09', desc: 'Jaya Grocer Weekly Restock', category: '#Food', amount: -620.00 },
    { id: 'TX-404', month: '2026-11', date: '2026-11-12', desc: 'ZUS Coffee & Nando\'s', category: '#Food', amount: -145.00 },
    { id: 'TX-405', month: '2026-11', date: '2026-11-16', desc: 'Running Gear & Heya Fitness', category: '#Health', amount: -985.00 },
    { id: 'TX-406', month: '2026-11', date: '2026-11-19', desc: 'Petrol, Toll & Grab', category: '#Transport', amount: -850.00 }
  ],
  // 30-day November Zero-Spend tracker
  noSpendDays: [
    { day: 1, zeroSpend: false },
    { day: 2, zeroSpend: false },
    { day: 3, zeroSpend: true },
    { day: 4, zeroSpend: true },
    { day: 5, zeroSpend: false },
    { day: 6, zeroSpend: false },
    { day: 7, zeroSpend: true },
    { day: 8, zeroSpend: true },
    { day: 9, zeroSpend: true },
    { day: 10, zeroSpend: false },
    { day: 11, zeroSpend: true },
    { day: 12, zeroSpend: false },
    { day: 13, zeroSpend: true },
    { day: 14, zeroSpend: true },
    { day: 15, zeroSpend: false },
    { day: 16, zeroSpend: false },
    { day: 17, zeroSpend: true },
    { day: 18, zeroSpend: true },
    { day: 19, zeroSpend: false },
    { day: 20, zeroSpend: true },
    { day: 21, zeroSpend: false },
    { day: 22, zeroSpend: false },
    { day: 23, zeroSpend: false },
    { day: 24, zeroSpend: false },
    { day: 25, zeroSpend: false },
    { day: 26, zeroSpend: false },
    { day: 27, zeroSpend: false },
    { day: 28, zeroSpend: false },
    { day: 29, zeroSpend: false },
    { day: 30, zeroSpend: false }
  ],
  // Monthly commitments (budget). payments maps monthId -> ledger txId
  commitments: [
    { id: 'CM-1', name: 'TNB Electricity', category: '#Bills', amount: 180.00, payments: {} },
    { id: 'CM-2', name: 'TIME Fibre Wi-Fi', category: '#Bills', amount: 139.00, payments: {} },
    { id: 'CM-3', name: 'Car Loan', category: '#Transport', amount: 850.00, payments: {} }
  ],
  // Counters for new ids (they only go up, so an id is never reused)
  nextTxNumber: 500, // new transactions: TX-500, TX-501, ...
  nextCmNumber: 4    // new commitments: CM-4, CM-5, ...
};

function getMonthMetrics(monthId) {
  const activeTxs = state.transactions.filter(t => t.month === monthId);
  let income = 0;
  let operatingExpenses = 0;

  activeTxs.forEach(t => {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      operatingExpenses += Math.abs(t.amount);
    }
  });

  const netOperatingSurplus = income - operatingExpenses;
  const unspentRemaining = Math.max(0, netOperatingSurplus);
  const salaryRemainingPct = income > 0 ? Math.max(0, Math.min(100, (unspentRemaining / income) * 100)) : 0;

  return {
    income,
    operatingExpenses,
    netOperatingSurplus,
    unspentRemaining,
    salaryRemainingPct
  };
}

// Accumulated Vault = every month's surplus (income - expenses) added together
function getVaultSummary() {
  let pastSurplus = 0;
  let novSurplus = 0;

  state.months.forEach(month => {
    const surplus = getMonthMetrics(month.id).netOperatingSurplus;
    if (month.id === ACTIVE_MONTH) {
      novSurplus = surplus;
    } else {
      pastSurplus += surplus;
    }
  });

  return {
    pastSurplus,
    novSurplus,
    totalVaultMyr: pastSurplus + novSurplus
  };
}

function addTransaction({ date, desc, category, signedAmountMyr }) {
  // New entries always go into the active month (November)
  const newTx = {
    id: 'TX-' + state.nextTxNumber,
    month: ACTIVE_MONTH,
    date,
    desc,
    category,
    amount: signedAmountMyr
  };
  state.nextTxNumber = state.nextTxNumber + 1;

  state.transactions.push(newTx);
  state.selectedMonth = ACTIVE_MONTH;
  return newTx;
}

// Every month except November (the active month) is closed
function isMonthClosed(monthId) {
  return monthId !== ACTIVE_MONTH;
}

// Removes a ledger entry for good
// (closed months show "Locked" instead of a Delete button)
function deleteTransaction(txId) {
  const index = state.transactions.findIndex(t => t.id === txId);
  if (index === -1) return false;
  state.transactions.splice(index, 1);
  return true;
}

function toggleNoSpendDay(dayNum) {
  const item = state.noSpendDays.find(d => d.day === dayNum);
  if (!item) return;
  item.zeroSpend = !item.zeroSpend;
}

function getNoSpendStats() {
  const count = state.noSpendDays.filter(d => d.zeroSpend).length;
  const target = 15;
  const pct = Math.min(100, Math.round((count / target) * 100));
  return { count, target, totalDays: state.noSpendDays.length, pct };
}

// ---- Budget: Monthly Commitments ----
function addCommitment({ name, category, amountMyr }) {
  const item = {
    id: 'CM-' + state.nextCmNumber,
    name,
    category,
    amount: Math.round(amountMyr * 100) / 100,
    payments: {}
  };
  state.nextCmNumber = state.nextCmNumber + 1;
  state.commitments.push(item);
  return item;
}

function removeCommitment(id) {
  const idx = state.commitments.findIndex(c => c.id === id);
  if (idx === -1) return false;
  state.commitments.splice(idx, 1);
  return true;
}

function isCommitmentPaid(c, monthId = ACTIVE_MONTH) {
  const txId = c.payments[monthId];
  if (!txId) return false;
  const tx = state.transactions.find(t => t.id === txId);
  return !!tx;
}

// Amount actually logged in the ledger for this commitment (MYR), or null if unpaid
function getCommitmentPaidAmount(c, monthId = ACTIVE_MONTH) {
  if (!isCommitmentPaid(c, monthId)) return null;
  const tx = state.transactions.find(t => t.id === c.payments[monthId]);
  return Math.abs(tx.amount);
}

// Logs the commitment as an expense in the active month's ledger
function payCommitment(id) {
  const c = state.commitments.find(x => x.id === id);
  if (!c) return { ok: false, reason: 'Not found' };
  if (isCommitmentPaid(c)) return { ok: false, reason: 'Already paid' };

  // Reuse addTransaction so the entry gets a normal TX- id
  const tx = addTransaction({
    date: TODAY,
    desc: c.name,
    category: c.category,
    signedAmountMyr: -c.amount
  });
  c.payments[ACTIVE_MONTH] = tx.id;
  return { ok: true, tx };
}

// Links a ledger entry (logged from the Log Entry form) as this month's payment
function linkCommitmentPayment(id, txId) {
  const c = state.commitments.find(x => x.id === id);
  const tx = state.transactions.find(t => t.id === txId);
  if (!c || !tx || tx.month !== ACTIVE_MONTH || tx.amount >= 0) return false;
  if (isCommitmentPaid(c)) return false;
  c.payments[ACTIVE_MONTH] = tx.id;
  return true;
}

// Reverses the payment by deleting its ledger entry
function unpayCommitment(id) {
  const c = state.commitments.find(x => x.id === id);
  if (!c || !isCommitmentPaid(c)) return false;
  const txId = c.payments[ACTIVE_MONTH];
  delete c.payments[ACTIVE_MONTH];
  return deleteTransaction(txId);
}

function getBudgetSummary() {
  const income = getMonthMetrics(ACTIVE_MONTH).income;
  const total = state.commitments.reduce((sum, c) => sum + c.amount, 0);
  const paid = state.commitments.filter(c => isCommitmentPaid(c));
  const paidTotal = paid.reduce((sum, c) => sum + c.amount, 0);
  return {
    total,
    count: state.commitments.length,
    paidCount: paid.length,
    unpaidTotal: total - paidTotal,
    income,
    sharePct: income > 0 ? (total / income) * 100 : 0,
    leftAfter: income - total
  };
}

function getGreeting() {
  return `Hi ${state.user.profile.fullname}`;
}

// Shared with other files (e.g. script.js imports these)
export {
  User,
  CATEGORIES,
  EXPENSE_CATEGORIES,
  state,
  getMonthMetrics,
  getVaultSummary,
  addTransaction,
  isMonthClosed,
  deleteTransaction,
  toggleNoSpendDay,
  getNoSpendStats,
  addCommitment,
  removeCommitment,
  isCommitmentPaid,
  getCommitmentPaidAmount,
  payCommitment,
  linkCommitmentPayment,
  unpayCommitment,
  getBudgetSummary,
  getGreeting
};
