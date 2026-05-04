import dotenv from 'dotenv';

dotenv.config();

const required = ['RECIPIENT_EMAIL'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  gmail: {
    user: process.env.GMAIL_USER ?? '',
    pass: process.env.GMAIL_PASS ?? '',
  },
  recipientEmail: process.env.RECIPIENT_EMAIL as string,
};
