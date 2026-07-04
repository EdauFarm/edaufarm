"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate: number;
};


export const currencies: Currency[] = [
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", rate: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", rate: 160 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 175 },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 205 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 182 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 118 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 105 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", rate: 98 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 1.1 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", rate: 22 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", rate: 1.9 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", rate: 43.5 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", rate: 42.5 },
  { code: "ZAR", name: "South African Rand", symbol: "R", rate: 8.5 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 0.11 },
  { code: "EGP", name: "Egyptian Pound", symbol: "£", rate: 3.2 },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", rate: 0.042 },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", rate: 0.062 },
  { code: "RWF", name: "Rwandan Franc", symbol: "RF", rate: 0.12 },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK", rate: 6.2 },
  { code: "BWP", name: "Botswana Pula", symbol: "P", rate: 11.8 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", rate: 13.5 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", rate: 5.0 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", rate: 0.57 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", rate: 1.45 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", rate: 118 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", rate: 20.5 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", rate: 15.5 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", rate: 14.8 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", rate: 23.5 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", rate: 32 },
  { code: "MXN", name: "Mexican Peso", symbol: "$", rate: 9.2 },
  { code: "ARS", name: "Argentine Peso", symbol: "$", rate: 0.18 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", rate: 0.12 },
  { code: "THB", name: "Thai Baht", symbol: "฿", rate: 4.4 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", rate: 34 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", rate: 0.010 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", rate: 2.9 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", rate: 0.0065 },
];

const defaultCurrency: Currency = currencies[0]; // Ksh as main/default

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
