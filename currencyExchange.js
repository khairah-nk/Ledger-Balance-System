// Symbol shown in front of each currency
const SYMBOLS = {
  MYR: 'RM ',
  USD: '$',
  SGD: 'S$',
  AUD: 'A$'
};

// Asks the API how much 1 fromCurrency is worth in toCurrency
async function exchangeCurrency(fromCurrency, toCurrency) {
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

    return conversionRate;

  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null; // no rate: script.js keeps the current currency
  }
}


// Turns an amount in MYR into display text, e.g. 100 MYR -> "$23.60"
function formatFromBase(amountInMyr, currency, rate, showPlus) {
  const convertedAmount = amountInMyr * rate;

  // Always 2 decimals with commas, e.g. 2420 -> "2,420.00"
  const formattedNumber = Math.abs(convertedAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  let sign = '';
  if (convertedAmount < 0) {
    sign = '-';
  } else if (showPlus && convertedAmount > 0) {
    sign = '+';
  }

  return `${sign}${SYMBOLS[currency]}${formattedNumber}`;
}


// Turns an amount typed in the display currency back into MYR for saving
function toBaseMyr(displayAmount, rate) {
  return displayAmount / rate;
}

// Shared with other files (e.g. script.js imports these)
export {
  SYMBOLS,
  exchangeCurrency,
  formatFromBase,
  toBaseMyr
};
