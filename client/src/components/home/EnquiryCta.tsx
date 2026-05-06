import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function EnquiryCta() {
  return (
    <section className="bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-headline font-semibold text-white tracking-tight">
            Ready to source from India?
          </h2>
          <p className="mt-3 text-gray-400 text-lg max-w-lg">
            Tell us what you need and we'll respond within 24 hours.
          </p>
        </div>
        <Link
          to="/enquiry"
          className="flex-shrink-0 inline-flex items-center gap-2 border border-white text-white px-7 py-3.5 text-sm font-medium rounded-md hover:bg-white hover:text-[#0a0a0a] hover:scale-105 hover:shadow-lg transition-all duration-200"
        >
          Send an Enquiry
          <ArrowRight size={16} strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
