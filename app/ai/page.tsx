// app/ai/page.tsx

import Link from 'next/link';

export default function AIRootPage() {
  const features = [
    {
      title: 'Conversation Analysis',
      description: 'Upload your sales conversations and get detailed feedback and insights.',
      path: '/ai/analysis',
      icon: '📊',
      status: 'Available',
    },
    {
      title: 'Practice with AI',
      description: 'Practice your persuasion skills in a simulated conversation with AI feedback.',
      path: '#',
      icon: '🔄',
      status: 'Coming Soon',
    },
    {
      title: 'Real-time Monitoring',
      description: 'Get real-time feedback and suggestions during live conversations.',
      path: '#',
      icon: '📡',
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">PersuadeAI Features</h1>
        <p className="text-gray-600 mb-12 text-center">
          Boost your persuasion skills with our AI-powered tools
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                
                {feature.status === 'Available' ? (
                  <Link 
                    href={feature.path}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Now
                  </Link>
                ) : (
                  <span className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-md">
                    {feature.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}