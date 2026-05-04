import Button from '../components/atoms/Button';

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <p className="text-[120px] font-semibold text-gray-100 leading-none select-none">
          404
        </p>
        <h1 className="text-2xl font-semibold text-[#0a0a0a] -mt-4 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button to="/" variant="outline-dark">
          Go home
        </Button>
      </div>
    </section>
  );
}
