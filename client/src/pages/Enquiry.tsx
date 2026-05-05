import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Phone, Mail, Instagram } from 'lucide-react';
import { useEnquiryForm } from '../hooks/useEnquiryForm';
import { CONTACT_INFO } from '../constants/contact';
import { ENQUIRY_PRODUCT_OPTIONS } from '../constants/productOptions';

const inputBase =
  'w-full rounded-none border border-gray-300 bg-white px-4 py-3 text-sm text-[#0a0a0a] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition';

export default function Enquiry() {
  const [searchParams] = useSearchParams();
  const productFromUrl = searchParams.get('product');
  const initialMessage = productFromUrl ? `I am interested in: ${productFromUrl}` : undefined;

  const { formData, fieldErrors, submitStatus, serverError, handleChange, handleSubmit } =
    useEnquiryForm(initialMessage);

  const [submittedEmail, setSubmittedEmail] = useState('');

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmittedEmail(formData.email);
    handleSubmit(e);
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <p className="text-xs uppercase tracking-widest text-green-600 mb-3">Get in touch</p>
          <h1 className="text-headline font-semibold text-[#0a0a0a] tracking-tight max-w-lg">
            Tell us what you need.
          </h1>
          <p className="mt-3 sm:mt-4 text-gray-500 text-base sm:text-lg max-w-xl">
            Share your requirements and our team will respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          <div className="lg:col-span-2">
            {submitStatus === 'success' ? (
              <div className="flex flex-col items-start gap-4 py-12 border-t border-gray-200">
                <CheckCircle size={36} strokeWidth={1.5} className="text-green-600" />
                <h2 className="text-2xl font-semibold text-[#0a0a0a]">Enquiry received</h2>
                <p className="text-gray-500 max-w-md">
                  We've received your message and will get back to you within 24 hours at{' '}
                  <span className="text-[#0a0a0a] font-medium">{submittedEmail || 'your email'}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`${inputBase} ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1.5 text-xs text-red-500">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className={`${inputBase} ${fieldErrors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1.5 text-xs text-red-500">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className={`${inputBase} ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="productInterest" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Product Interest
                  </label>
                  <select
                    id="productInterest"
                    name="productInterest"
                    value={formData.productInterest}
                    onChange={handleChange}
                    className={`${inputBase} ${fieldErrors.productInterest ? 'border-red-400 focus:ring-red-400' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {ENQUIRY_PRODUCT_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {fieldErrors.productInterest && (
                    <p className="mt-1.5 text-xs text-red-500">{fieldErrors.productInterest}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your requirements: product, quantity, destination country, and more."
                    className={`${inputBase} resize-none ${fieldErrors.message ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  {fieldErrors.message && (
                    <p className="mt-1.5 text-xs text-red-500">{fieldErrors.message}</p>
                  )}
                </div>

                {serverError && (
                  <p className="text-sm text-red-500">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === 'submitting'}
                  className="w-full bg-green-600 text-white py-3.5 text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitStatus === 'submitting' ? 'Sending…' : 'Send Enquiry'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-8 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-12">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Contact us directly</p>
              <ul className="space-y-5">
                {CONTACT_INFO.phones.map((phone) => (
                  <li key={phone} className="flex items-start gap-3">
                    <Phone size={16} strokeWidth={1.5} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <a
                      href={`tel:${phone.replace(/\s/g, '')}`}
                      className="text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors"
                    >
                      {phone}
                    </a>
                  </li>
                ))}
                <li className="flex items-start gap-3">
                  <Mail size={16} strokeWidth={1.5} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors break-all"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Instagram size={16} strokeWidth={1.5} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <a
                    href={CONTACT_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors"
                  >
                    @{CONTACT_INFO.instagram}
                  </a>
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm text-gray-500 leading-relaxed">
                We typically respond within <span className="text-[#0a0a0a] font-medium">24 hours</span>{' '}
                on business days. For urgent requirements, please call directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
