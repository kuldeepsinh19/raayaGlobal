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
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  errors: ApiFieldError[];
}
