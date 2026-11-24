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
  filterType: 'all',
  entryDirection: 'debit',
  displayCurrency: 'MYR',
  exchangeRate: 1,
  // Closed months only keep how much was saved (salary minus expenses).
  // November is still open, so its savings come from the ledger below.
  months: [
    { id: '2026-07', label: 'Jul 2026', savings: 2430.00 },
    { id: '2026-08', label: 'Aug 2026', savings: 2350.00 },
    { id: '2026-09', label: 'Sep 2026', savings: 2520.00 },
    { id: '2026-10', label: 'Oct 2026', savings: 2610.00 },
    { id: '2026-11', label: 'Nov 2026' }
  ],
  // Ledger entries for November (the open month).
  // Every entry here is in November, so they don't need a month field.
  transactions: [
    { id: 'TX-401', date: '2026-11-01', desc: 'Monthly Salary Credit', category: '#Income', amount: 6500.00 },
    { id: 'TX-402', date: '2026-11-04', desc: 'Maya Bay Maintenance & Wi-Fi', category: '#Bills', amount: -1480.00 },
    { id: 'TX-403', date: '2026-11-09', desc: 'Jaya Grocer Weekly Restock', category: '#Food', amount: -620.00 },
    { id: 'TX-404', date: '2026-11-12', desc: 'ZUS Coffee & Nando\'s', category: '#Food', amount: -145.00 },
    { id: 'TX-405', date: '2026-11-16', desc: 'Running Gear & Heya Fitness', category: '#Health', amount: -985.00 },
    { id: 'TX-406', date: '2026-11-19', desc: 'Petrol, Toll & Grab', category: '#Transport', amount: -850.00 }
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
  // Monthly commitments (budget). paidTxId = the ledger entry that paid it this month (null = not paid)
  commitments: [
    { id: 'CM-1', name: 'TNB Electricity', category: '#Bills', amount: 180.00, paidTxId: null },
    { id: 'CM-2', name: 'TIME Fibre Wi-Fi', category: '#Bills', amount: 139.00, paidTxId: null },
    { id: 'CM-3', name: 'Car Loan', category: '#Transport', amount: 850.00, paidTxId: null }
  ],
  // Counters for new ids (they only go up, so an id is never reused)
  nextTxNumber: 500, // new transactions: TX-500, TX-501, ...
  nextCmNumber: 4    // new commitments: CM-4, CM-5, ...
};

// November's totals, worked out from its ledger entries
function getNovemberMetrics() {
  let income = 0;
  let operatingExpenses = 0;

  state.transactions.forEach(t => {
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

// Accumulated Vault = savings from the closed months + November's surplus so far
function getVaultSummary() {
  let pastSurplus = 0;

  state.months.forEach(month => {
    if (isMonthClosed(month.id)) {
      pastSurplus += month.savings;
    }
  });

  const novSurplus = getNovemberMetrics().netOperatingSurplus;

  return {
    pastSurplus,
    novSurplus,
    totalVaultMyr: pastSurplus + novSurplus
  };
}

function addTransaction({ date, desc, category, signedAmountMyr }) {
  // New entries always go into November
  const newTx = {
    id: 'TX-' + state.nextTxNumber,
    date,
    desc,
    category,
    amount: signedAmountMyr
  };
  state.nextTxNumber = state.nextTxNumber + 1;

  state.transactions.push(newTx);
  return newTx;
}

// Every month except November (the active month) is closed
function isMonthClosed(monthId) {
  return monthId !== ACTIVE_MONTH;
}

// Removes a ledger entry for good
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
    paidTxId: null
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

// Paid = its ledger entry is still in the ledger
// (deleting that entry in Ledger Management makes it unpaid again)
function isCommitmentPaid(c) {
  return state.transactions.some(t => t.id === c.paidTxId);
}

// Amount actually logged in the ledger for this commitment (MYR), or null if unpaid
function getCommitmentPaidAmount(c) {
  const tx = state.transactions.find(t => t.id === c.paidTxId);
  return tx ? Math.abs(tx.amount) : null;
}

// Logs the commitment as an expense in November's ledger
function payCommitment(id) {
  const c = state.commitments.find(x => x.id === id);

  // Reuse addTransaction so the entry gets a normal TX- id
  const tx = addTransaction({
    date: TODAY,
    desc: c.name,
    category: c.category,
    signedAmountMyr: -c.amount
  });
  c.paidTxId = tx.id;
}

// Links a ledger entry (logged from the Log Entry form) as this month's payment
function linkCommitmentPayment(id, txId) {
  const c = state.commitments.find(x => x.id === id);
  const tx = state.transactions.find(t => t.id === txId);
  // Only an expense can pay a commitment (not if Income was picked)
  if (tx.amount >= 0) return false;
  c.paidTxId = tx.id;
  return true;
}

// Reverses the payment by deleting its ledger entry
function unpayCommitment(id) {
  const c = state.commitments.find(x => x.id === id);
  deleteTransaction(c.paidTxId);
  c.paidTxId = null;
}

function getBudgetSummary() {
  const income = getNovemberMetrics().income;
  const total = state.commitments.reduce((sum, c) => sum + c.amount, 0);
  const paid = state.commitments.filter(c => isCommitmentPaid(c));
  const paidTotal = paid.reduce((sum, c) => sum + c.amount, 0);
  return {
    total,
    count: state.commitments.length,
    paidCount: paid.length,
    unpaidTotal: total - paidTotal,
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
  getNovemberMetrics,
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
