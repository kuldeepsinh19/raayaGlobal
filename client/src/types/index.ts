export type ProductCategory = 'fruits' | 'vegetables' | 'grains' | 'spices';

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: ProductCategory;
  tagline: string;
  imageUrl: string;
}

export interface EnquiryFormData {
  name: string;
  phone: string;
  email: string;
  productInterest: ProductCategory | 'general' | '';
  message: string;
  /**
   * Honeypot — rendered off-screen and hidden from assistive tech. A human
   * never fills this in; a bot fills every field it finds. The server discards
   * any submission where it is non-empty. See api/_lib/http.ts.
   */
  company_website?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  errors: ApiFieldError[];
}
