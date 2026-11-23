// The app stores every amount in Malaysian Ringgit
const BASE_CURRENCY = 'MYR';

// Symbol shown in front of each currency
const SYMBOLS = {
  MYR: 'RM ',
  USD: '$',
  SGD: 'S$',
  AUD: 'A$',
  JPY: '¥',
  EUR: '€'
};

// Asks the API how much 1 fromCurrency is worth in toCurrency
const exchangeCurrency = async (fromCurrency = BASE_CURRENCY, toCurrency = BASE_CURRENCY) => {
  // The API wants lowercase codes, e.g. "myr", "usd"
  const from = fromCurrency.toLowerCase();
  const to = toCurrency.toLowerCase();

  // Same currency? The rate is always 1
  if (from === to) {
    return 1;
  }

  try {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.json`);
    const data = await response.json();
    console.log(data);

    const conversionRate = data[from][to];
    console.log(conversionRate);

    // Make sure the API gave us a real, positive number
    if (!Number.isFinite(conversionRate) || conversionRate <= 0) {
      throw new Error(`No rate found for ${from} -> ${to}`);
    }

    return conversionRate;

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null; // no rate: script.js keeps the current currency
  }
};


// Turns an amount in MYR into display text, e.g. 100 MYR -> "$23.60"
const formatFromBase = (amountInMyr, targetCurrency = BASE_CURRENCY, rate = 1, showPlus = false) => {
  const currency = targetCurrency.toUpperCase();
  const symbol = SYMBOLS[currency] || `${currency} `;

  const convertedAmount = (Number(amountInMyr) || 0) * (Number(rate) || 1);

  // Yen has no cents
  const decimals = currency === 'JPY' ? 0 : 2;
  const formattedNumber = Math.abs(convertedAmount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  // Add "-" for spending, and "+" for income when asked
  let sign = '';
  if (convertedAmount < 0) {
    sign = '-';
  } else if (showPlus && convertedAmount > 0) {
    sign = '+';
  }

  return `${sign}${symbol}${formattedNumber}`;
};


// Turns an amount typed in the display currency back into MYR for saving
const toBaseMyr = (displayAmount, rate = 1) => {
  const safeRate = Number(rate) || 1;
  return (Number(displayAmount) || 0) / safeRate;
};

// Shared with other files (e.g. script.js imports these)
export {
  BASE_CURRENCY,
  SYMBOLS,
  exchangeCurrency,
  formatFromBase,
  toBaseMyr
};
