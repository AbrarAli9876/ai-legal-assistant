import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { postQuery } from '../services/chatbotService.js';

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am KanoonAI. How can I assist you with your legal questions today?",
      law: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // This ref is for automatically scrolling down to the latest message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Scroll every time messages update

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Call the API service
    const response = await postQuery(userMessage.text);

    // Create the AI's response message object
    const aiMessage = {
      sender: 'ai',
      text: response.ai_response,
      law: response.relevant_law, // Store the relevant law
      error: response.error || false // Mark if it's an error message
    };

    setIsLoading(false);
    setMessages(prev => [...prev, aiMessage]);
  };

  // Allow sending with "Enter" key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevents new line
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto">
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white rounded-t-lg shadow-md">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-lg ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${msg.sender === 'user' ? 'bg-legal-blue-primary ml-3' : 'bg-legal-gold-primary mr-3'}`}>
                {msg.sender === 'user' ? <User size={20} /> : <Sparkles size={20} />}
              </div>
              
              {/* Message Bubble */}
              <div className={`px-5 py-4 rounded-2xl ${msg.sender === 'user' ? 'bg-legal-blue-primary text-white' : 'bg-legal-gray-bg text-legal-text-primary'}`}>
                <p>{msg.text}</p>
                
                {/* Show relevant law if AI sent it and it's not an error */}
                {msg.sender === 'ai' && msg.law && !msg.error && (
                  <div className="mt-3 pt-2 border-t border-legal-gold-primary/50">
                    <p className="text-xs font-semibold text-legal-gold-primary">
                      Relevant Law: <span className="font-normal text-legal-text-primary/80">{msg.law}</span>
                    </p>
                  </div>
                )}
                
                {/* Show error icon if it's an error message */}
                {msg.sender === 'ai' && msg.error && (
                   <div className="mt-3 pt-2 border-t border-red-500/50 flex items-center">
                    <AlertCircle size={16} className="text-red-500 mr-2" />
                    <p className="text-xs font-semibold text-red-500">
                      {msg.law}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-legal-gold-primary text-white mr-3">
                <Loader2 size={20} className="animate-spin" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-legal-gray-bg text-legal-text-primary">
                <p className="italic">KanoonAI is thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        {/* This is an invisible element to help scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white rounded-b-lg shadow-md border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your legal question here... (e.g., 'What is RERA?')"
            className="flex-1 rounded-lg border border-gray-300 p-3.5 focus:outline-none focus:ring-2 focus:ring-legal-blue-primary"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`p-3.5 rounded-lg text-white transition-colors
              ${isLoading 
                ? 'bg-gray-400' 
                : 'bg-legal-blue-primary hover:bg-legal-blue-highlight'
              }`}
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPage;