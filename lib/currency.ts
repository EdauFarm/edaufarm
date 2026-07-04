import axios from 'axios';

// Static fallback rates (KES as base)
const STATIC_RATES: Record<string, number> = {
  KES: 1,                // base
  USD: 1 / 126.9,        // ~0.00788 (1 KES ≈ 0.00788 USD)
  RWF: 11.3,             // 1 KES ≈ 11.3 RWF
  UGX: 27.9,             // 1 KES ≈ 27.9 UGX
  ZIG: 1 / 25.58,        // ~0.0391 ZIG per USD → 1 KES ≈ 0.000308 ZIG (because 1 USD ≈ 126.9 KES)
  ZMW: 0.1424,           // 1 KES ≈ 0.1424 ZMW
};

export async function fetchRates(): Promise<Record<string, number>> {
  try {
    // Example: Use exchangerate.host (free, no API key required)
    const res = await axios.get('https://api.exchangerate.host/latest?base=KES&symbols=USD,RWF,UGX,ZIG,ZMW,KES');
    return { ...STATIC_RATES, ...res.data.rates };
  } catch {
    return STATIC_RATES;
  }
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  if (from === to) return amount;
  const rates = await fetchRates();
  if (!rates[from] || !rates[to]) return amount;
  // Convert from -> KES -> to
  const amountInKES = from === 'KES' ? amount : amount / rates[from];
  return amountInKES * rates[to];
}

// Synchronous fallback for UI (uses static rates)
export function convertCurrencySync(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  if (!STATIC_RATES[from] || !STATIC_RATES[to]) return amount;
  const amountInKES = from === 'KES' ? amount : amount / STATIC_RATES[from];
  return amountInKES * STATIC_RATES[to];
}
