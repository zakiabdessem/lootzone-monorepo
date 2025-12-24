import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f7ff] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-[#4618AC] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-[#4618AC] hover:bg-[#381488] text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

