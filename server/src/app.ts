import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import enquiryRouter from './routes/enquiry.route';
import { errorHandler } from './middleware/error';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());

app.use('/api/enquiry', enquiryRouter);

app.use(errorHandler);

export default app;
