import { Router } from 'express';
import { enquiryValidator } from '../validators/enquiry.validator';
import { validate } from '../middleware/validate';
import { postEnquiry } from '../controllers/enquiry.controller';

const router = Router();

router.post('/', enquiryValidator, validate, postEnquiry);

export default router;
