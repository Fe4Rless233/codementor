// src/components/editor/CollaborationPanel.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { User, ChatMessage, CollaborationParticipant } from '@/types'; // Import your types
import { MessageSquare, Users, Send } from 'lucide-react'; // Icons
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image'; // For user avatars

interface CollaborationPanelProps {
  collaborationId: string;
  initialCode?: string; // If this panel needs to reflect the code from the session
  language?: string;
}

export default function CollaborationPanel({ collaborationId, initialCode, language }: CollaborationPanelProps) {
  const { user } = useAuth(); // Get current authenticated user
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');

  // Use the useSocket hook with the required parameters
  const { socket, isConnected, messages, participants, sendChatMessage } = useSocket({
    autoConnect: true,
    collaborationId: collaborationId,
    userId: user?.id,
    username: user?.user_metadata?.username || user?.email, // Fallback to email if username not set
  });

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && isConnected) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
          Collaboration Chat
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Participants Section */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-md font-medium text-gray-800 flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-gray-600" /> Participants ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500">No other participants yet.</p>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                  {p.avatar ? (
                    <Image
                      src={p.avatar}
                      alt={p.username || 'User'}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-xs text-primary-800 font-bold">
                      {p.username ? p.username[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{p.username}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 pt-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.userId === user?.id ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={
                    `max-w-[70%] p-3 rounded-lg shadow-sm ` +
                    (msg.userId === user?.id
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none')
                  }
                >
                  <div className="flex items-center text-xs mb-1">
                    {msg.user?.avatar ? (
                      <Image
                        src={msg.user.avatar}
                        alt={msg.user.username || 'User'}
                        width={20}
                        height={20}
                        className="rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-700 font-bold mr-2">
                        {msg.user?.username ? msg.user.username[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="font-semibold">{msg.user?.username || 'Unknown'}</span>
                    <span className="text-gray-400 ml-2">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.type === 'code' ? (
                    <pre className={`text-xs p-2 rounded-md overflow-x-auto ${msg.userId === user?.id ? 'bg-primary-700' : 'bg-gray-200'}`}>
                      <code>{msg.message}</code>
                    </pre>
                  ) : (
                    <p className="text-sm break-words">{msg.message}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50 flex items-center space-x-2">
        <Input
          type="text"
          placeholder={isConnected ? "Type your message..." : "Connecting to chat..."}
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          className="flex-1"
          disabled={!isConnected}
        />
        <Button type="submit" size="icon" disabled={!isConnected || chatInput.trim() === ''}>
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}