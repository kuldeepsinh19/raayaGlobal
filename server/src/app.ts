import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import enquiryRouter from './routes/enquiry.route';
import { errorHandler } from './middleware/error';

const app = express();

const allowedOrigins = [
  env.clientOrigin,
  'http://localhost:5173',
  'https://raayaimportexport.vercel.app',
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/enquiry', enquiryRouter);

app.use(errorHandler);

export default app;
