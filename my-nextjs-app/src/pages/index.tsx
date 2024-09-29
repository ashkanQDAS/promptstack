import { useState, useEffect } from 'react'
import { SendIcon, Loader2Icon, PlusIcon, HistoryIcon, DatabaseIcon, CodeIcon, FileTextIcon } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';

interface Message {
  text: string
  sender: 'user' | 'ai' | 'system'
}

const generateCodebaseDetails = (dbConfig: string, projectDesc: string): string => {
  const frameworks = ['React', 'Next.js', 'Vue.js', 'Angular']
  const backends = ['Node.js', 'Python', 'Ruby on Rails', 'Java Spring']
  const orms = ['Sequelize', 'Prisma', 'TypeORM', 'Mongoose']

  const selectedFramework = frameworks[Math.floor(Math.random() * frameworks.length)]
  const selectedBackend = backends[Math.floor(Math.random() * backends.length)]
  const selectedOrm = orms[Math.floor(Math.random() * orms.length)]

  return `Frontend: ${selectedFramework}
Backend: ${selectedBackend}
Database: ${dbConfig.includes('SQL') ? 'PostgreSQL' : 'MongoDB'}
ORM: ${selectedOrm}
API: RESTful
Version Control: Git
Deployment: Docker containers on Kubernetes cluster`
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dbConfig, setDbConfig] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [codebase, setCodebase] = useState('')
  const [showContext, setShowContext] = useState(true)

  useEffect(() => {
    setCodebase(generateCodebaseDetails(dbConfig, projectDescription))
  }, [dbConfig, projectDescription])

  const handleSend = async () => {
    if (input.trim() === '') return

    const newMessage: Message = { text: input, sender: 'user' }
    setMessages([...messages, newMessage])
    setInput('')
    setIsProcessing(true)

    // Simulate AI response
    const response = await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/deft-parser-397804/locations/us-central1/publishers/google/models/chat-bison-001:predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        "instances": [
          {
            "context": messages.map(m => `${m.sender}: ${m.text}`).join('\n'),
            "messages": [{
              "id": uuidv4(),
              "author": "user",
              "content": input
            }]
          }
        ],
        "parameters": {
          "temperature": 0.7,
          "maxOutputTokens": 256,
          "topP": 0.95,
          "topK": 40
        }
      }),
    });

    const data = await response.json();
    const aiResponse: Message = { text: data.predictions[0].candidates[0].content, sender: 'ai' };
    setMessages(prevMessages => [...prevMessages, aiResponse]);
    setIsProcessing(false);
  }

  const handleNewProject = () => {
    setDbConfig('')
    setProjectDescription('')
    setMessages([])
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 text-gray-100 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">AI Programming Assistant</h2>
        <button className="mb-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center" onClick={handleNewProject}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Project
        </button>
        <h3 className="text-sm font-semibold mb-2">Previous Projects</h3>
        <div className="space-y-2 mb-4">
          <button className="w-full text-left py-2 px-4 hover:bg-gray-800 rounded flex items-center">
            <HistoryIcon className="mr-2 h-4 w-4" />
            Project 1
          </button>
          <button className="w-full text-left py-2 px-4 hover:bg-gray-800 rounded flex items-center">
            <HistoryIcon className="mr-2 h-4 w-4" />
            Project 2
          </button>
        </div>
        <div className="flex items-center space-x-2 mt-auto">
          <input
            type="checkbox"
            id="show-context"
            checked={showContext}
            onChange={(e) => setShowContext(e.target.checked)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
          <label htmlFor="show-context">Show Context</label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Context Boxes */}
        {showContext && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <DatabaseIcon className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="font-bold">Backend/Database Configuration</h3>
              </div>
              <textarea 
                value={dbConfig} 
                onChange={(e) => setDbConfig(e.target.value)}
                placeholder="Enter database configuration"
                className="w-full h-24 p-2 border rounded resize-none"
              />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <CodeIcon className="h-5 w-5 mr-2 text-green-500" />
                <h3 className="font-bold">Generated Codebase</h3>
              </div>
              <textarea 
                value={codebase}
                readOnly
                className="w-full h-24 p-2 border rounded resize-none bg-gray-50"
              />
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <FileTextIcon className="h-5 w-5 mr-2 text-purple-500" />
                <h3 className="font-bold">Project Description</h3>
              </div>
              <textarea 
                value={projectDescription} 
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project"
                className="w-full h-24 p-2 border rounded resize-none"
              />
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-grow overflow-auto mb-4 bg-white rounded-lg shadow p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <span className={`inline-block p-3 rounded-lg ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 
                msg.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
              }`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input 
            type="text"
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your prompt here"
            onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSend()}
            disabled={isProcessing}
            className="flex-grow p-2 border rounded"
          />
          <button 
            onClick={handleSend} 
            disabled={isProcessing} 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            {isProcessing ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
