import { ArrowRight } from 'lucide-react';
import Button from '../atoms/Button';

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
        <Button
          to="/enquiry"
          variant="outline-light"
          icon={<ArrowRight size={16} strokeWidth={1.75} />}
        >
          Send an Enquiry
        </Button>
      </div>
    </section>
  );
}
