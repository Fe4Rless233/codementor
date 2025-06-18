import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initializes and returns the Socket.io client instance.
 * It ensures only one socket connection is established.
 * @param queryParams Query parameters to send with the connection (e.g., collaborationId, userId, username).
 * @returns The Socket.io client instance.
 */
export const getSocket = (queryParams?: { [key: string]: string | string[] | undefined }): Socket => {
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!SOCKET_URL) {
    console.error("NEXT_PUBLIC_SOCKET_URL is not defined. Please set it in your .env file.");
    throw new Error("Socket server URL is not configured.");
  }

  // If a socket instance already exists and is connected/connecting with the same query, return it.
  // This is a simplification; in a real app, you might want to disconnect/reconnect if query changes significantly.
  if (socket && socket.connected) {
    // If query parameters are provided, but the existing socket doesn't match,
    // you might consider disconnecting and reconnecting here.
    // For simplicity, we'll just return the existing one for now.
    return socket;
  }

  // If no socket or not connected, create a new one
  socket = io(SOCKET_URL, {
    query: queryParams,
    transports: ['websocket'],
    autoConnect: false, // We'll manage connection manually in the hook
  });

  // Basic error logging for the socket itself
  socket.on('connect_error', (err) => {
    console.error(`Socket connection error: ${err.message}`);
  });

  socket.on('error', (err) => {
    console.error(`Socket generic error: ${err.message}`);
  });

  return socket;
};

// Also good to have a way to close the socket if needed globally
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket instance disconnected and cleared.');
  }
};