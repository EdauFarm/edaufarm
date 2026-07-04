import React, { useState } from 'react';

interface PaymentTabsProps {
  selected: string;
  onSelect: (method: string) => void;
  country: string;
  session: any;
  walletBalance: number;
}

const allMethods = [
  { key: 'stk-push', label: 'M-Pesa STK Push' },
  { key: 'paybill', label: 'Paybill/Bank' },
  { key: 'wallet', label: 'Wallet' },
];

export default function PaymentTabs({ selected, onSelect, country, session, walletBalance }: PaymentTabsProps) {
  let methods = allMethods;

  // Exclude STK Push if not Kenya
  if (country !== 'Kenya') {
    methods = methods.filter(m => m.key !== 'stk-push');
  }

  // Exclude STK and Wallet if not authenticated
  if (!session?.user) {
    methods = methods.filter(m => m.key !== 'stk-push' && m.key !== 'wallet');
  }

  // Exclude Wallet if walletBalance is 0
  if (session?.user && walletBalance === 0) {
    methods = methods.filter(m => m.key !== 'wallet');
  }

  return (
    <div className="mb-6">
      <div className="flex border-b border-gray-200">
        {methods.map((method) => (
          <button
            key={method.key}
            className={`px-4 py-2 font-semibold focus:outline-none transition-colors border-b-2 ${selected === method.key ? 'border-primary-600 text-primary-600 bg-white' : 'border-transparent text-gray-600 bg-gray-50 hover:bg-white'}`}
            onClick={() => onSelect(method.key)}
            type="button"
          >
            {method.label}
          </button>
        ))}
      </div>
    </div>
  );
}
