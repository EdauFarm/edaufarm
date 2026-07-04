import * as React from 'react';

interface OTPEmailProps {
  name: string;
  otp: string;
  purpose: 'verification' | 'password-reset';
}

export const OTPEmail: React.FC<OTPEmailProps> = ({ name, otp, purpose }) => {
  const title = purpose === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
  const message = purpose === 'verification' 
    ? 'Thank you for signing up! Please use the OTP below to verify your email address.'
    : 'We received a request to reset your password. Use the OTP below to proceed.';

  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
          }
          .otp-box {
            background: #f9fafb;
            border: 2px dashed #1f2937;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #1f2937;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: #1f2937;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🌾 Edau Farm</h1>
          </div>
          <div className="content">
            <h2>Hello {name},</h2>
            <p>{message}</p>
            
            <div className="otp-box">
              <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#6b7280' }}>Your OTP Code</p>
              <div className="otp-code">{otp}</div>
              <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#9ca3af' }}>Valid for 10 minutes</p>
            </div>

            <div className="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style={{ margin: '10px 0 0', paddingLeft: '20px' }}>
                <li>Never share this OTP with anyone</li>
                <li>Edau Farm staff will never ask for your OTP</li>
                <li>This code expires in 10 minutes</li>
              </ul>
            </div>

            <p>If you didn't request this, please ignore this email or contact our support team if you have concerns.</p>
            
            <p style={{ marginTop: '30px' }}>
              Best regards,<br/>
              <strong>The Edau Farm Team</strong>
            </p>
          </div>
          <div className="footer">
            <p>© 2026 Edau Farm. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  );
};
