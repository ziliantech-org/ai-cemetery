import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const _isConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

export function isSmtpConfigured(): boolean {
  return _isConfigured;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!_isConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<boolean> {
  const t = getTransporter();

  if (!t) {
    // Dev mode: log to console
    console.log(`\n========================================`);
    console.log(`  VERIFICATION CODE for ${email}`);
    console.log(`  Code: ${code}`);
    console.log(`========================================\n`);
    return true;
  }

  await t.sendMail({
    from: `"AI Cemetery" <${SMTP_FROM}>`,
    to: email,
    subject: 'AI Cemetery - Verification Code',
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 400px; margin: 0 auto; padding: 32px; background: #0d0d15; color: #e5e5e5; border-radius: 12px;">
        <h2 style="color: #c9a96e; text-align: center;">🪦 AI Cemetery</h2>
        <p style="text-align: center; color: #999;">Your verification code:</p>
        <div style="text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #c9a96e; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px; margin: 16px 0;">
          ${code}
        </div>
        <p style="text-align: center; color: #666; font-size: 12px;">Expires in 10 minutes</p>
      </div>
    `,
  });
  return true;
}
