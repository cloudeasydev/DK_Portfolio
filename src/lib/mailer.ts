import nodemailer from 'nodemailer'

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export function getMailTransport() {
  if (!smtpConfigured()) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env',
    )
  }

  const port = Number(process.env.SMTP_PORT || 587)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendOtpEmail(to: string, otp: string) {
  const transport = getMailTransport()
  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@localhost'
  const appName = process.env.APP_NAME || 'DevOps CV Admin'

  await transport.sendMail({
    from,
    to,
    subject: `${otp} is your ${appName} login code`,
    text: `Your one-time login code is ${otp}.\n\nThis code expires in 10 minutes.\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 12px">${appName}</h2>
        <p style="margin:0 0 16px;line-height:1.5">Use this 6-digit code to sign in. It expires in <strong>10 minutes</strong>.</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:700;margin:24px 0;padding:16px 20px;background:#f4f4f5;border-radius:12px;text-align:center">${otp}</p>
        <p style="margin:0;color:#666;font-size:13px">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `,
  })
}
