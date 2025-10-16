'use client';

import { BookOpen, Award, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function LessonsPanel() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/lessons`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-96" />;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500';
      case 'intermediate': return 'text-yellow-500';
      case 'advanced': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-500" />
        DeFi Lessons
      </h2>

      {!selectedLesson ? (
        <div className="space-y-3">
          {lessons.map((lesson: any) => (
            <div
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className="bg-gray-900 rounded-lg p-4 cursor-pointer hover:bg-gray-850 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{lesson.title}</h3>
                {lesson.badge && (
                  <span className="text-xl">{lesson.badge}</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3">{lesson.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {lesson.estimatedTime} min
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedLesson(null)}
            className="text-blue-400 hover:text-blue-300 mb-4 text-sm"
          >
            ← Back to lessons
          </button>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedLesson.title}</h3>
              {selectedLesson.badge && (
                <span className="text-2xl">{selectedLesson.badge}</span>
              )}
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm text-gray-300">
                {selectedLesson.content}
              </div>
            </div>
            <button
              onClick={() => {
                // Mark as complete
                setSelectedLesson(null);
              }}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              Complete Lesson
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
