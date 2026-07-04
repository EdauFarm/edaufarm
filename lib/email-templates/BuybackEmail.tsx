import React from 'react';
import { 
  FiCheckCircle, 
  FiBox, 
  FiDollarSign, 
  FiClock, 
  FiAlertCircle 
} from 'react-icons/fi';

interface BuybackEmailProps {
  userName: string;
  productName: string;
  requestedAmount: number;
  status: 'submitted' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  approvedAmount?: number;
}

const BuybackEmail: React.FC<BuybackEmailProps> = ({
  userName,
  productName,
  requestedAmount,
  status,
  reason,
  approvedAmount,
}) => {
  const getStatusContent = () => {
    switch (status) {
      case 'submitted':
        return {
          title: 'Buyback Request Received',
          message: `We've received your buyback request for ${productName}. Our admin team will review it within 24-48 hours.`,
          color: '#3B82F6',
          icon: '⏳',
        };
      case 'approved':
        return {
          title: 'Buyback Approved - Payment Processing',
          message: `Your buyback for ${productName} has been approved. The amount of KSh ${approvedAmount?.toLocaleString()} will be credited to your wallet shortly.`,
          color: '#1f2937',
          icon: '💰',
        };
      case 'rejected':
        return {
          title: 'Buyback Request Not Approved',
          message: `After review, we couldn't approve your buyback request for ${productName}. ${reason || 'Please contact support for more details.'}`,
          color: '#EF4444',
          icon: '❌',
        };
      case 'completed':
        return {
          title: 'Buyback Completed - Wallet Credited',
          message: `Success! KSh ${approvedAmount?.toLocaleString()} has been credited to your Edau Farm wallet for ${productName}. You can withdraw to M-Pesa anytime.`,
          color: '#1f2937',
          icon: '🎉',
        };
      default:
        return {
          title: 'Buyback Status Update',
          message: `There's an update on your buyback request for ${productName}.`,
          color: '#3B82F6',
          icon: 'ℹ️',
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <html>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f3f4f6' }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f3f4f6', padding: '20px 0' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: statusContent.color, padding: '30px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>{statusContent.icon}</div>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                      {statusContent.title}
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
                      {statusContent.message}
                    </p>

                    {/* Details Box */}
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
                      <tr>
                        <td>
                          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>
                            <strong style={{ color: '#111827' }}>Product:</strong> {productName}
                          </p>
                          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>
                            <strong style={{ color: '#111827' }}>Requested Amount:</strong> KSh {requestedAmount.toLocaleString()}
                          </p>
                          {approvedAmount && (
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280' }}>
                              <strong style={{ color: '#111827' }}>Approved Amount:</strong> KSh {approvedAmount.toLocaleString()}
                            </p>
                          )}
                          <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                            <strong style={{ color: '#111827' }}>Status:</strong> {status.replace(/_/g, ' ').toUpperCase()}
                          </p>
                        </td>
                      </tr>
                    </table>

                    {/* CTA Button */}
                    {(status === 'completed' || status === 'approved') && (
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
                    )}

                    {status === 'submitted' && (
                      <table width="100%" cellPadding="0" cellSpacing="0">
                        <tr>
                          <td align="center" style={{ paddingTop: '10px' }}>
                            <a href="https://jumia.loopnet.tech/account?tab=buybacks" style={{
                              display: 'inline-block',
                              backgroundColor: '#FF6600',
                              color: '#ffffff',
                              padding: '14px 32px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}>
                              Track Request
                            </a>
                          </td>
                        </tr>
                      </table>
                    )}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f9fafb', padding: '20px 30px', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                      Need help? Contact us at <a href="mailto:support@updates.loopnet.tech" style={{ color: '#FF6600' }}>support@updates.loopnet.tech</a> or call +254 700 000 000
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

export default BuybackEmail;
