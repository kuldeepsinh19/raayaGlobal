import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

interface EnquiryPayload {
  name: string;
  phone: string;
  email: string;
  productInterest: string;
  message: string;
}

function validate(body: Partial<EnquiryPayload>): string | null {
  if (!body.name?.trim()) return 'Name is required';
  if (!body.phone?.trim()) return 'Phone number is required';
  if (!body.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    return 'Enter a valid email address';
  if (!body.productInterest?.trim()) return 'Product interest is required';
  if (!body.message?.trim()) return 'Message is required';
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const body = req.body as Partial<EnquiryPayload>;
  const error = validate(body);
  if (error) {
    return res.status(422).json({ success: false, errors: [{ field: 'general', message: error }] });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  const recipient = process.env.RECIPIENT_EMAIL;

  if (!gmailUser || !gmailPass || !recipient) {
    console.error('[Email] Missing env vars');
    return res.status(500).json({ success: false, message: 'Server misconfiguration' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  const subject = `New Enquiry from ${body.name} - ${body.productInterest}`;
  const text = `
New enquiry received on Raaya Global Solutions website.

Name:             ${body.name}
Phone:            ${body.phone}
Email:            ${body.email}
Product Interest: ${body.productInterest}
Received At:      ${new Date().toISOString()}

Message:
${body.message}
  `.trim();

  try {
    await transporter.sendMail({
      from: `"Raaya Global Website" <${gmailUser}>`,
      to: recipient,
      subject,
      text,
    });
    console.log(`[Email] Sent to ${recipient}`);
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('[Email] Failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  }
}
