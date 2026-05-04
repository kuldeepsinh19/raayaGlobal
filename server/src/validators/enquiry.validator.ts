import { body } from 'express-validator';

const PRODUCT_INTERESTS = ['fruits', 'vegetables', 'grains', 'spices', 'general'];

export const enquiryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be 100 characters or fewer'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Enter a valid phone number'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('productInterest')
    .trim()
    .notEmpty()
    .withMessage('Product interest is required')
    .isIn(PRODUCT_INTERESTS)
    .withMessage('Select a valid product category'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be 1000 characters or fewer'),
];
