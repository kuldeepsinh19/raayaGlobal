import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';
import { CONTACT_INFO, NAV_LINKS } from '../../constants/contact';

const PRODUCT_CATEGORIES = [
  { label: 'Fruits', path: '/products?category=fruits' },
  { label: 'Vegetables', path: '/products?category=vegetables' },
  { label: 'Grains', path: '/products?category=grains' },
  { label: 'Spices', path: '/products?category=spices' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 pb-8 sm:pb-10 md:pb-12 border-b border-[#1f2937]">
          <div>
            <p className="text-base font-semibold mb-1">Raaya Global Solutions</p>
            <p className="text-gray-400 text-sm leading-relaxed mt-3 max-w-xs">
              Connecting India's finest agricultural produce to global markets
              with quality, integrity, and care.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Products</p>
            <ul className="space-y-2.5 mb-8">
              {PRODUCT_CATEGORIES.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Contact</p>
            <ul className="space-y-2.5">
              {CONTACT_INFO.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Phone size={13} strokeWidth={1.5} />
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail size={13} strokeWidth={1.5} />
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram size={13} strokeWidth={1.5} />
                  @{CONTACT_INFO.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-gray-600 text-xs pt-8">
          &copy; {new Date().getFullYear()} Raaya Global Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
