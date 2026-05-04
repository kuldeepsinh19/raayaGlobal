import axios from 'axios';
import { EnquiryFormData } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function submitEnquiry(data: EnquiryFormData): Promise<{ success: boolean; id: string }> {
  const response = await api.post<{ success: boolean; id: string }>('/enquiry', data);
  return response.data;
}
