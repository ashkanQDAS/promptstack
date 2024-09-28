import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Send, Plus, Menu } from 'lucide-react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch response');
      }

      const assistantMessage = { role: 'assistant' as const, content: data.message };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}. Please check the console for more details.` 
      }]);
    }
  };

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-api-key');
        const data = await response.json();
        console.log('API Key status:', data.status);
      } catch (error) {
        console.error('Error checking API key:', error);
      }
    };

    checkApiKey();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Head>
        <title>ChatGPT Clone</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <div className={`bg-gray-900 text-white w-64 flex-shrink-0 ${isSidebarOpen ? '' : 'hidden'} md:block`}>
        <div className="p-4">
          <button className="flex items-center space-x-2 hover:bg-gray-700 w-full p-2 rounded">
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">ChatGPT Clone</h1>
        </header>

        {/* Chat area */}
        <main className="flex-1 overflow-auto p-4 bg-white">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-3/4 p-3 rounded-lg ${
                message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </main>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
