import { Link } from 'react-router-dom';
import { Phone, Mail, Instagram, ArrowRight } from 'lucide-react';
import { CONTACT_INFO } from '../constants/contact';

const CONTACT_ROWS = [
  {
    Icon: Phone,
    label: 'Phone',
    values: CONTACT_INFO.phones.map((p) => ({ text: p, href: `tel:${p.replace(/\s/g, '')}` })),
  },
  {
    Icon: Mail,
    label: 'Email',
    values: [{ text: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` }],
  },
  {
    Icon: Instagram,
    label: 'Instagram',
    values: [{ text: `@${CONTACT_INFO.instagram}`, href: CONTACT_INFO.instagramUrl }],
  },
];

export default function Contact() {
  return (
    <>
      <section className="bg-[#0a0a0a] py-28">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs uppercase tracking-widest text-green-500 mb-5">Contact</p>
          <h1 className="text-hero font-semibold text-white tracking-tight leading-[1.08] max-w-2xl">
            We'd love to hear from you.
          </h1>
          <p className="mt-6 text-gray-400 text-xl max-w-xl leading-relaxed">
            Reach out with your sourcing requirements, partnership enquiries, or
            anything else. Our team responds promptly.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl">
            <div className="space-y-0 divide-y divide-gray-100">
              {CONTACT_ROWS.map(({ Icon, label, values }) => (
                <div key={label} className="flex items-start gap-5 py-7">
                  <Icon
                    size={18}
                    strokeWidth={1.5}
                    className="text-green-600 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1.5">
                      {label}
                    </p>
                    {values.map(({ text, href }) => (
                      <a
                        key={text}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block text-base text-[#0a0a0a] hover:text-green-600 transition-colors font-medium"
                      >
                        {text}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-gray-500 mb-6">
                Prefer to fill out a form? Use our enquiry form for specific
                product and sourcing requests.
              </p>
              <Link
                to="/enquiry"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Send an Enquiry
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
