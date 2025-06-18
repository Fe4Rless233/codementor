'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client' // Import Socket type
import { getSocket } from '@/lib/socket' // <--- IMPORT FROM LIB
import toast from 'react-hot-toast'
import { ChatMessage, CollaborationParticipant } from '@/types' // Assuming these are in types/index.ts or collaboration.ts

interface UseSocketOptions {
  autoConnect?: boolean
  collaborationId?: string
  userId?: string
  username?: string
}

interface UseSocketResult {
  socket: Socket | null
  isConnected: boolean
  sendCodeUpdate: (code: string) => void
  sendChatMessage: (message: string, type?: 'text' | 'code' | 'system') => void
  messages: ChatMessage[]
  participants: CollaborationParticipant[]
}

export function useSocket({ autoConnect = true, collaborationId, userId, username }: UseSocketOptions): UseSocketResult {
  const [socket, setSocket] = useState<Socket | null>(null) // State to hold the socket instance
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<CollaborationParticipant[]>([])

  // Use a ref to ensure event handlers always use the latest state
  const messagesRef = useRef(messages);
  const participantsRef = useRef(participants);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);


  useEffect(() => {
    if (!autoConnect || !collaborationId || !userId || !username) {
      // If autoConnect is false or essential params are missing, ensure socket is closed
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const currentSocket = getSocket({ collaborationId, userId, username }); // Get socket from lib
    setSocket(currentSocket);

    // If not already connected, attempt to connect
    if (!currentSocket.connected) {
      currentSocket.connect();
    }

    const onConnect = () => {
      console.log(`Socket connected: ${currentSocket.id}`);
      setIsConnected(true);
      // Request initial state or participants when connecting
      currentSocket.emit('request-initial-state', { collaborationId });
    };

    const onDisconnect = () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setParticipants([]); // Clear participants on disconnect
      // Do NOT clear messages here unless desired, as they might be history
    };

    const onCodeUpdate = (updatedCode: string) => {
      console.log('Received code update');
      // In a real editor, you'd apply this to Monaco directly
      // For now, it's a console log as direct editor manipulation isn't abstracted here.
      // You might pass this `updatedCode` back via a prop callback in a more integrated setup.
    };

    const onChatMessage = (message: ChatMessage) => {
      console.log('Received chat message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    const onParticipantsUpdate = (updatedParticipants: CollaborationParticipant[]) => {
      console.log('Received participants update:', updatedParticipants);
      setParticipants(updatedParticipants);
    };

    const onError = (err: any) => {
      console.error('Socket error:', err);
      toast.error(`Collaboration error: ${err.message || 'Unknown error'}`);
    };

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);
    currentSocket.on('code-update', onCodeUpdate);
    currentSocket.on('chat-message', onChatMessage);
    currentSocket.on('participants-update', onParticipantsUpdate);
    currentSocket.on('error', onError);

    return () => {
      currentSocket.off('connect', onConnect);
      currentSocket.off('disconnect', onDisconnect);
      currentSocket.off('code-update', onCodeUpdate);
      currentSocket.off('chat-message', onChatMessage);
      currentSocket.off('participants-update', onParticipantsUpdate);
      currentSocket.off('error', onError);

      // Clean up the socket connection when the component unmounts
      // or if conditions for autoConnect change (e.g., collaborationId disappears)
      if (currentSocket.connected) {
        currentSocket.disconnect();
      }
      setSocket(null); // Clear the socket state
    };
  }, [autoConnect, collaborationId, userId, username]); // Re-run effect if these change

  const sendCodeUpdate = useCallback((code: string) => {
    if (socket && isConnected && collaborationId) {
      socket.emit('code-change', { collaborationId, code });
    } else {
      console.warn('Socket not connected or collaboration ID missing, cannot send code update.');
    }
  }, [socket, isConnected, collaborationId]);

  const sendChatMessage = useCallback((message: string, type: 'text' | 'code' | 'system' = 'text') => {
    if (socket && isConnected && collaborationId && userId && username) {
      const chatMessageToSend: Omit<ChatMessage, 'id' | 'createdAt'> = {
        collaborationId,
        userId,
        // The server will usually populate the `user` object from the userId
        message,
        type,
      };
      socket.emit('chat-message', chatMessageToSend);
    } else {
      console.warn('Socket not connected or missing user/collaboration info, cannot send chat message.');
    }
  }, [socket, isConnected, collaborationId, userId, username]);

  return { socket, isConnected, sendCodeUpdate, sendChatMessage, messages, participants };
}