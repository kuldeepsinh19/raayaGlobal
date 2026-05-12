import { Mail, Phone } from 'lucide-react';
import { CONTACT_INFO } from '../../constants/contact';

export default function TopBar() {
  return (
    <div className="bg-green-600 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail size={13} strokeWidth={1.5} className="shrink-0" />
          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="hover:underline transition-all text-xs sm:text-sm truncate"
          >
            {CONTACT_INFO.email}
          </a>
        </div>
        <div className="flex items-center gap-1.5 sm:hidden shrink-0">
          <Phone size={13} strokeWidth={1.5} />
          <a
            href={`tel:${CONTACT_INFO.phones[0].replace(/\s/g, '')}`}
            className="hover:underline transition-all text-xs whitespace-nowrap"
          >
            {CONTACT_INFO.phones[0]}
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {CONTACT_INFO.phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 hover:underline transition-all text-sm"
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
