'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { resend } from '../resend';


export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 mins

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpiry: expiry,
    },
  });

  // const resetLink = `http://localhost:3000/resetpassword?token=${token}`; Debugging 

  const resetLink = `https://clancyhouseholdsystem.vercel.app/resetpassword?token=${token}`;

  await resend.emails.send({
    from: 'Support <support@hopeharborcommunitytransformers.org>',
    to: email,
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            .content {
              padding: 40px 30px;
            }
            .content h2 {
              font-size: 24px;
              margin: 0 0 16px 0;
              color: #1f2937;
            }
            .content p {
              font-size: 16px;
              margin: 0 0 16px 0;
              color: #4b5563;
              line-height: 1.7;
            }
            .cta-button {
              display: inline-block;
              margin: 32px 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 14px 32px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .button-link {
              display: inline-block;
              margin-top: 8px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
            }
            .copy-link {
              background-color: #f3f4f6;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 12px;
              margin: 16px 0;
              word-break: break-all;
              font-family: 'Courier New', monospace;
              font-size: 13px;
              color: #374151;
            }
            .info-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              margin: 24px 0;
              border-radius: 4px;
            }
            .info-box p {
              margin: 0;
              font-size: 14px;
              color: #92400e;
            }
            .footer {
              background-color: #f9fafb;
              padding: 24px 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
            .footer p {
              margin: 4px 0;
            }
            .signature {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
            }
            .signature p {
              margin: 4px 0;
              font-size: 14px;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            
            <div class="content">
              <h2>Hello,</h2>
              <p>We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p style="margin-top: 24px;">Click the button below to reset your password:</p>
              
              <a href="${resetLink}" style="
                                        display: inline-block;
                                        margin-top: 8px;
                                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                        color: #ffffff !important;
                                        padding: 12px 24px;
                                        text-decoration: none;
                                        border-radius: 6px;
                                        font-weight: 600;
                                        font-size: 14px;
                                  ">Reset Your Password</a>          
              <div class="copy-link">
                ${resetLink}
              </div>
              
              <p>Or copy and paste the link above into your browser.</p>
              
              <div class="info-box">
                <p>⏱️ <strong>This link expires in 30 minutes</strong> for security reasons. If it expires, you can request a new reset link.</p>
              </div>
              
              <div class="signature">
                <p>Questions? Contact our support team at support@hopeharborcommunitytransformers.org</p>
                <p style="margin-top: 16px; color: #6b7280;">Best regards,<br>Hope Harbor Community Transformers Support Team</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Hope Harbor Community Transformers</p>
              <p>If you did not request a password reset, please ignore this email or contact support immediately if you believe your account may be compromised.</p>
              <p style="margin-top: 12px; color: #9ca3af;">© 2024 Hope Harbor Community Transformers. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
