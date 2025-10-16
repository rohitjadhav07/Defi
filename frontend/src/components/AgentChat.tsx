'use client';

import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function AgentChat({ address }: { address?: string }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'agent'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, address }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'agent', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col h-96">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-pink-500" />
        Agent Chat
      </h2>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Ask me anything about your portfolio</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-600 ml-8' : 'bg-gray-900 mr-8'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="bg-gray-900 p-3 rounded-lg mr-8">
            <p className="text-sm text-gray-400">Thinking...</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about your portfolio..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 p-2 rounded-lg transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
