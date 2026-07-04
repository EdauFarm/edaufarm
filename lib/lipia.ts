// Lipia Online Payment API Integration

const LIPIA_API_BASE_URL = 'https://lipia-api.kreativelabske.com/api/v2';

interface STKPushRequest {
  phone_number: string;
  amount: number;
  external_reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

interface STKPushResponse {
  success: boolean;
  status: string;
  message: string;
  customerMessage: string;
  data: {
    TransactionReference: string;
    ResponseCode: number;
    ResponseDescription: string;
  };
  timestamp: string;
}

interface PaymentStatusResponse {
  success: boolean;
  status: string;
  message: string;
  customerMessage: string;
  data: {
    response: {
      Amount: number;
      ExternalReference: string;
      MerchantRequestID: string;
      MpesaReceiptNumber: string;
      Phone: string;
      ResultCode: number;
      ResultDesc: string;
      Metadata?: Record<string, any>;
      Status: 'PENDING' | 'SUCCESS' | 'FAILED';
      TransactionDate: string;
    };
    status: boolean;
  };
  timestamp: string;
}

export class LipiaPaymentService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LIPIA_API_KEY || '';
    
    if (!this.apiKey) {
      throw new Error('Lipia API key is not configured');
    }
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(data: STKPushRequest): Promise<STKPushResponse> {
    try {

      const response = await fetch(`${LIPIA_API_BASE_URL}/payments/stk-push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });


      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.customerMessage || result.message || 'Payment initiation failed';
        throw new Error(errorMessage);
      }

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to initiate payment');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionReference: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(
        `${LIPIA_API_BASE_URL}/payments/status?reference=${transactionReference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.customerMessage || result.message || 'Status check failed');
      }

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check payment status');
    }
  }

  /**
   * Format phone number to Lipia format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-+]/g, '');

    // Convert to 0X format (M-Pesa expects 07XX or 01XX format)
    if (cleaned.startsWith('254')) {
      return '0' + cleaned.substring(3); // Convert 254XXXXXXXXX to 0XXXXXXXXX
    } else if (cleaned.startsWith('0')) {
      return cleaned; // Already in correct format 0XXXXXXXXX
    } else if (cleaned.length === 9) {
      return '0' + cleaned; // Add 0 prefix
    }

    return cleaned;
  }

  /**
   * Validate Kenyan Safaricom phone number
   */
  static isValidKenyanPhone(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Safaricom numbers: 07XX XXX XXX or 01XX XXX XXX (10 digits starting with 0)
    return /^0[71]\d{8}$/.test(formatted);
  }
}

export default LipiaPaymentService;
