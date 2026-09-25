import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">404 - Thread Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The requested conversation or route does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}
