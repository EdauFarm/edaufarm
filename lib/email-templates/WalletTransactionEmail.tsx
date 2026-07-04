import React from 'react';

interface WalletTransactionEmailProps {
  userName: string;
  type: 'deposit' | 'withdrawal' | 'credit';
  amount: number;
  newBalance: number;
  mpesaReference?: string;
  status: 'completed' | 'failed' | 'pending';
  reason?: string;
}

const WalletTransactionEmail: React.FC<WalletTransactionEmailProps> = ({
  userName,
  type,
  amount,
  newBalance,
  mpesaReference,
  status,
  reason,
}) => {
  const getTypeContent = () => {
    switch (type) {
      case 'deposit':
        return {
          title: 'Wallet Deposit Successful',
          message: 'Your M-Pesa deposit has been processed successfully.',
          color: '#1f2937',
          icon: '💳',
        };
      case 'withdrawal':
        return {
          title: 'Withdrawal Processed',
          message: 'Your withdrawal to M-Pesa has been initiated.',
          color: '#3B82F6',
          icon: '💸',
        };
      case 'credit':
        return {
          title: 'Wallet Credited',
          message: 'Your wallet has been credited successfully.',
          color: '#1f2937',
          icon: '💰',
        };
      default:
        return {
          title: 'Wallet Transaction',
          message: 'A transaction has been processed on your wallet.',
          color: '#6B7280',
          icon: '💵',
        };
    }
  };

  const typeContent = getTypeContent();

  return (
    <html>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f3f4f6', padding: '20px 0' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: typeContent.color, padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{typeContent.icon}</div>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                      {typeContent.title}
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '40px 30px' }}>
                    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
                      Hi {userName},
                    </p>
                    
                    <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.6', marginBottom: '30px' }}>
                      {typeContent.message}
                    </p>

                    {/* Transaction Details */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
                      <tr>
                        <td>
                          <table width="100%" cellPadding="0" cellSpacing="0">
                            <tr>
                              <td style={{ paddingBottom: '15px' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Transaction Type</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' }}>
                                  {type}
                                </p>
                              </td>
                              <td align="right" style={{ paddingBottom: '15px' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Amount</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: type === 'withdrawal' ? '#EF4444' : '#10B981' }}>
                                  {type === 'withdrawal' ? '-' : '+'} KSh {amount.toLocaleString()}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={2} style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>New Balance</p>
                                <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                                  KSh {newBalance.toLocaleString()}
                                </p>
                              </td>
                            </tr>
                            {mpesaReference && (
                              <tr>
                                <td colSpan={2} style={{ paddingTop: '15px' }}>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                                    M-Pesa Reference: <strong style={{ color: '#111827' }}>{mpesaReference}</strong>
                                  </p>
                                </td>
                              </tr>
                            )}
                          </table>
                        </td>
                      </tr>
                    </table>

                    {/* Status Message */}
                    {status === 'pending' && type === 'withdrawal' && (
                      <div style={{ backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#92400E' }}>
                          ⏳ Your withdrawal is being processed. You'll receive the funds in your M-Pesa within 5-10 minutes.
                        </p>
                      </div>
                    )}

                    {status === 'failed' && (
                      <div style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#991B1B' }}>
                          ❌ Transaction failed. Please contact support if the amount was debited.
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td align="center" style={{ paddingTop: '10px' }}>
                          <a href="https://jumia.loopnet.tech/account?tab=wallet" style={{
                            display: 'inline-block',
                            backgroundColor: '#FF6600',
                            color: '#ffffff',
                            padding: '14px 32px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            View Wallet
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f9fafb', padding: '20px 30px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                      For security reasons, never share your wallet PIN or M-Pesa details with anyone.
                    </p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                      © 2026 Edau Farm. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
};

export default WalletTransactionEmail;
