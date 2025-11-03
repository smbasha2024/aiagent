'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot } from 'lucide-react';
import { Message } from '@/types';
import { FileText } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[95%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-gray-500'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-lg p-4 max-w-full ${
          isUser 
            ? 'bg-blue-100 border border-blue-200' 
            : 'bg-gray-100 border border-gray-300'
        } ${isStreaming ? 'opacity-80' : ''}`}>
          {/* Add streaming indicator */}
          {isStreaming && !isUser && (
            <div className="flex items-center mb-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
            </div>
          )}
          
          {message.files && message.files.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.files.map(file => (
                <div
                  key={file.id}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
          
          <div className="prose prose-sm max-w-none break-words">
            {isUser ? (
              <div className="text-gray-800 whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    const codeContent = String(children).replace(/\n$/, '');
                    
                    if (!inline && language) {
                      return (
                        <div className="my-2 rounded-md overflow-hidden">
                          <div className="bg-gray-800 text-gray-200 px-3 py-1 text-xs font-mono">
                            {language}
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={language}
                            PreTag="div"
                            className="text-sm m-0"
                            showLineNumbers={false}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0 0 0.375rem 0.375rem'
                            }}
                            {...props}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    
                    return (
                      <code className="bg-gray-200 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  // Add other markdown components for better formatting
                  pre: ({ children }: any) => <div className="my-2">{children}</div>,
                  blockquote: ({ children }: any) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }: any) => (
                    <div className="overflow-x-auto my-2">
                      <table className="min-w-full border-collapse border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }: any) => (
                    <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold">
                      {children}
                    </th>
                  ),
                  td: ({ children }: any) => (
                    <td className="border border-gray-300 px-3 py-2">
                      {children}
                    </td>
                  ),
                  ul: ({ children }: any) => (
                    <ul className="list-disc list-inside my-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }: any) => (
                    <ol className="list-decimal list-inside my-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  h1: ({ children }: any) => (
                    <h1 className="text-xl font-bold my-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }: any) => (
                    <h2 className="text-lg font-bold my-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }: any) => (
                    <h3 className="text-md font-bold my-1">
                      {children}
                    </h3>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
          
          <div className={`text-xs mt-2 ${
            isUser ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};