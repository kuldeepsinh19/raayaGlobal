import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { EnquiryPayload, StoredEnquiry } from '../types/enquiry';
import { env } from '../config/env';

const enquiries: StoredEnquiry[] = [];

async function sendEnquiryEmail(enquiry: StoredEnquiry): Promise<void> {
  if (!env.gmail.user || !env.gmail.pass) {
    console.warn('[Email] Skipping — GMAIL_USER or GMAIL_PASS not set in .env');
    return;
  }

  console.log(`[Email] Sending enquiry from ${enquiry.email} to ${env.recipientEmail} ...`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.gmail.user,
      pass: env.gmail.pass,
    },
  });

  const subject = `New Enquiry from ${enquiry.name} - ${enquiry.productInterest}`;

  const text = `
New enquiry received on Raaya Global Solutions website.

Name:             ${enquiry.name}
Phone:            ${enquiry.phone}
Email:            ${enquiry.email}
Product Interest: ${enquiry.productInterest}
Received At:      ${enquiry.receivedAt}

Message:
${enquiry.message}
  `.trim();

  await transporter.sendMail({
    from: `"Raaya Global Website" <${env.gmail.user}>`,
    to: env.recipientEmail,
    subject,
    text,
  });

  console.log(`[Email] Sent successfully to ${env.recipientEmail}`);
}

export async function postEnquiry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = req.body as EnquiryPayload;

    const stored: StoredEnquiry = {
      ...payload,
      id: uuidv4(),
      receivedAt: new Date().toISOString(),
    };

    enquiries.push(stored);

    sendEnquiryEmail(stored).catch((err) =>
      console.error('Email delivery failed:', err)
    );

    res.status(201).json({ success: true, id: stored.id });
  } catch (err) {
    next(err);
  }
}
