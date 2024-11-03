import { useEffect, useState } from 'react';
import { useUnderstanding } from '../hooks/useUnderstanding';
import { Understanding } from '../lib/types';

interface Props {
  userId: string;
}

export function UserInsights({ userId }: Props) {
  const [understanding, setUnderstanding] = useState<Understanding | null>(null);
  const { generateUnderstanding, loading, error } = useUnderstanding();

  useEffect(() => {
    loadUnderstanding();
  }, [userId]);

  const loadUnderstanding = async () => {
    const result = await generateUnderstanding({
      userId,
      domain: 'general',
      query: 'What are this user\'s key characteristics and interests?'
    });

    if (result) {
      setUnderstanding(result);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Analyzing profiles...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error generating insights: {error.message}
      </div>
    );
  }

  if (!understanding) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">User Insights</h3>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Key Labels</h4>
          <div className="flex flex-wrap gap-2">
            {understanding.labels.map(label => (
              <span
                key={label.id}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {label.label} ({(label.confidence * 100).toFixed(0)}%)
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="font-medium mb-2">Understanding Confidence</h4>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${understanding.confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}