import { Mail, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../../constants/contact';

export default function TopBar() {
  return (
    <div className="bg-green-600 text-white text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail size={13} strokeWidth={1.5} className="flex-shrink-0" />
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="hover:underline transition-all truncate"
          >
            {CONTACT_INFO.email}
          </a>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
          {CONTACT_INFO.phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 hover:underline transition-all"
            >
              <Phone size={13} strokeWidth={1.5} />
              {phone}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
