'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { PromptSuggestions } from './PromptSuggestions';
import { useChat } from '@/context/ChatContext';
import { useChatStream } from '@/hooks/useChatStream';
import { Message, FileAttachment, PromptTemplate } from '@/types';
import { Bot } from 'lucide-react';

export const ChatAgent: React.FC = () => {
  const { state, dispatch } = useChat();
  const { streamMessage, isStreaming, error } = useChatStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  const currentConversation = state.currentConversation;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSendMessage = async (content: string, files: FileAttachment[] = []) => {
    if (!content.trim()) return;

    setHasUserSentMessage(true);

    let conversationId = currentConversation?.id;
    
    // Create new conversation if none exists
    if (!currentConversation) {
      conversationId = Date.now().toString();
      const newConversation = {
        id: conversationId,
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        createdAt: new Date(),
        messages: [],
      };
      dispatch({ type: 'ADD_CONVERSATION', payload: newConversation });
      // Note: Your ChatContext already sets currentConversation when adding
    } else {
      conversationId = currentConversation.id;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files,
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: conversationId!, message: userMessage },
    });

    // Create initial assistant message with empty content
    const assistantMessageId = Date.now().toString() + '-assistant';
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      content: '', // Start with empty content
      role: 'assistant',
      timestamp: new Date(),
      files: [],
    };

    // Add the initial assistant message immediately
    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: conversationId!, message: initialAssistantMessage },
    });

    // Stream assistant response
    try {
      await streamMessage(
        content, 
        files, 
        (assistantMessage: Message) => {
          console.log('Stream update received:', {
            messageId: assistantMessageId,
            content: assistantMessage.content,
            length: assistantMessage.content.length
          });
          
          // Update the assistant message content as it streams
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              conversationId: conversationId!,
              messageId: assistantMessageId,
              content: assistantMessage.content,
            },
          });
        }
      );
    } catch (err) {
      console.error('Error streaming message:', err);
      // Update with error message
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          conversationId: conversationId!,
          messageId: assistantMessageId,
          content: 'Sorry, I encountered an error. Please try again.',
        },
      });
    }
  };

  const handlePromptSelect = (prompt: PromptTemplate) => {
    console.log('Prompt selected:', prompt);
  };

  // Safe check for messages
  const hasMessages = currentConversation?.messages && currentConversation.messages.length > 0;
  
  // Show messages if user has sent a message OR if we have existing messages
  const shouldShowMessages = hasUserSentMessage || hasMessages;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!shouldShowMessages ? (
          <PromptSuggestions onPromptSelect={handlePromptSelect} />
        ) : (
          <div className="max-w-4xl mx-auto py-6 px-4">
            {/* Debug info - uncomment to see what's happening */}
            <div className="text-xs text-gray-500 mb-2 p-2 bg-yellow-50 rounded">
              Debug Info:<br />
              - Current Conversation: {currentConversation?.id}<br />
              - Message Count: {currentConversation?.messages?.length || 0}<br />
              - Is Streaming: {isStreaming.toString()}<br />
              - Has User Sent Message: {hasUserSentMessage.toString()}
            </div>
            
            {/* Render all messages */}
            {currentConversation?.messages?.map((message, index) => (
              <div key={message.id || index} className="mb-4">
                <div className="text-xs text-gray-400 mb-1">
                  Message {index}: {message.role} - {message.id} - Length: {message.content.length}
                </div>
                <MessageBubble 
                  message={message}
                  isStreaming={isStreaming && message.role === 'assistant' && index === currentConversation.messages.length - 1}
                />
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isStreaming}
      />

      {/* Footer */}
      <footer className="border-t bg-gray-50 border-gray-200 py-2">
        <div className="text-center">
          <p className="text-xs text-gray-500 italic">
            Powered by Basha@AIProxy
          </p>
        </div>
      </footer>
    </div>
  );
};