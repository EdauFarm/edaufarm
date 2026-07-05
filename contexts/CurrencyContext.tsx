"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  rate: number;
};

// KES is the default and only currency
export const currencies: Currency[] = [
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", rate: 1 },
];

const defaultCurrency: Currency = currencies[0];

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
