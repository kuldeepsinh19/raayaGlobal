export type ProductInterest =
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'spices'
  | 'general';

export interface EnquiryPayload {
  name: string;
  phone: string;
  email: string;
  productInterest: ProductInterest;
  message: string;
}

export interface StoredEnquiry extends EnquiryPayload {
  id: string;
  receivedAt: string;
}
