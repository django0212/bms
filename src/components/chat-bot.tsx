'use client';

import { useChat, type UIMessage } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const renderContent = (m: UIMessage) => {
    let content = '';
    if (Array.isArray(m.parts)) {
      content = m.parts.map((part: any) => (part.type === 'text' ? part.text : '')).join('');
    }
    
    return (
      <ReactMarkdown
        components={{
          ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal ml-4 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[100] transition-transform duration-300",
          isOpen ? "scale-0" : "scale-100"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[350px] h-[500px] bg-white border border-zinc-200 rounded-xl shadow-xl flex flex-col z-[100] transition-all duration-300 origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-primary/5 rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-zinc-800">Support Chat</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 text-sm mt-4">
              Hi! How can I help you with BookMyCampus today?
            </div>
          )}
          {messages.map((m: UIMessage) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-lg p-3 text-sm",
                m.role === 'user'
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-zinc-100 text-zinc-800 mr-auto"
              )}
            >
              {renderContent(m)}
            </div>
          ))}
          {isLoading && (
            <div className="bg-zinc-100 text-zinc-800 mr-auto max-w-[80%] rounded-lg p-3 text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-100 bg-white rounded-b-xl">
          <div className="relative w-full flex">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about facilities or bookings... (Shift+Enter for new line)"
              className="flex-1 min-h-[60px] max-h-[120px] resize-none py-2.5 pr-16"
              rows={2}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              size="sm"
              className="absolute top-2 bottom-2 right-2 h-auto"
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
