import app from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
  console.log(`[Email] Sender : ${env.gmail.user || 'NOT SET'}`);
  console.log(`[Email] Recipient: ${env.recipientEmail || 'NOT SET'}`);
});
