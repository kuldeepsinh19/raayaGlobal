import { useState, ChangeEvent, FormEvent } from 'react';
import { EnquiryFormData, ApiFieldError } from '../types';
import { submitEnquiry } from '../services/enquiryApi';
import axios from 'axios';

function buildInitialFormData(prefilledMessage?: string): EnquiryFormData {
  return {
    name: '',
    phone: '',
    email: '',
    productInterest: '',
    message: prefilledMessage ?? '',
  };
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function useEnquiryForm(initialMessage?: string) {
  const [formData, setFormData] = useState<EnquiryFormData>(() =>
    buildInitialFormData(initialMessage)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [serverError, setServerError] = useState('');

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validateLocally(): boolean {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.productInterest) errors.productInterest = 'Select a product category';
    if (!formData.message.trim()) errors.message = 'Message is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    if (!validateLocally()) return;

    setSubmitStatus('submitting');

    try {
      await submitEnquiry(formData);
      setSubmitStatus('success');
      setFormData(buildInitialFormData());
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        const apiErrors: ApiFieldError[] = err.response.data.errors ?? [];
        const mapped: Record<string, string> = {};
        apiErrors.forEach(({ field, message }) => {
          mapped[field] = message;
        });
        setFieldErrors(mapped);
        setSubmitStatus('idle');
      } else {
        setServerError('Something went wrong. Please try again shortly.');
        setSubmitStatus('error');
      }
    }
  }

  return {
    formData,
    fieldErrors,
    submitStatus,
    serverError,
    handleChange,
    handleSubmit,
  };
}
