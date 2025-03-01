// app/ai/layout.tsx

import Link from 'next/link';

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/ai" className="text-gray-700 hover:text-gray-900">
                AI Features
              </Link>
              <Link href="/ai/analysis" className="text-gray-700 hover:text-gray-900">
                Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  );
}