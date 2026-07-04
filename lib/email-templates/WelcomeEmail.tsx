import React from 'react';

interface WelcomeEmailProps {
  name: string;
  otp: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name, otp }) => (
  <html>
    <head>
      <style>{`
        body {
          font-family: Arial, sans-serif;
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
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
          padding: 30px;
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
          background: #f8f9fa;
          border: 2px dashed #FF6B35;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #FF6B35;
          letter-spacing: 8px;
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #FF6B35;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      `}</style>
    </head>
    <body>
      <div className="container">
        <div className="header">
          <h1>🌾 Welcome to Edau Farm!</h1>
        </div>
        <div className="content">
          <h2>Hello {name}!</h2>
          <p>Thank you for joining Edau Farm, West Pokot's premier sustainable farm for honey, fruits, and livestock!</p>
          <p>To complete your registration, please verify your email address using the OTP below:</p>
          
          <div className="otp-box">
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Your verification code</p>
            <div className="otp-code">{otp}</div>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Valid for 10 minutes</p>
          </div>

          <p>If you didn't create an account, please ignore this email.</p>
          
          <p>Happy shopping!</p>
          <p>The Edau Farm Team</p>
        </div>
        <div className="footer">
          <p>© 2026 Edau Farm. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
  </html>
);

export const WelcomeEmailHTML = (name: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Edau Farm</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🌾 Welcome to Edau Farm!</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2>Hello ${name}!</h2>
          <p>Thank you for joining Edau Farm, West Pokot's premier sustainable farm!</p>
      <p>To complete your registration, please verify your email address using the OTP below:</p>
      
      <div style="background: #f8f9fa; border: 2px dashed #FF6B35; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Your verification code</p>
        <div style="font-size: 36px; font-weight: bold; color: #FF6B35; letter-spacing: 8px; margin: 10px 0;">${otp}</div>
        <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
      </div>

      <p>If you didn't create an account, please ignore this email.</p>
      
      <p>Happy shopping!</p>
      <p>The Jumia Team</p>
    </div>
    <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
      <p>© 2026 Edau Farm. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;
