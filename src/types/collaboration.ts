
import { User } from './auth'; // Assuming your User type is defined in auth.ts or index.ts
import { ChatMessage } from './index'; // Assuming ChatMessage is in index.ts or its own file

/**
 * Represents a real-time collaborative coding session.
 */
export interface CollaborationSession {
  id: string;
  title: string;
  description?: string | null;
  code: string; // The current state of the code in the session
  language: string; // e.g., 'javascript', 'python'
  isActive: boolean; // True if the session is active, false if closed/archived
  createdBy: string; // User ID of the session creator
  createdAt: string; // ISO 8601 string date
  updatedAt: string; // ISO 8601 string date

  // Relationships (these might be included when fetching, depending on Prisma includes)
  creator?: User; // The user who created the session
  participants?: User[]; // List of users currently active in the session (dynamic, from socket server)
  messages?: ChatMessage[]; // Chat messages associated with this session
}

/**
 * Represents a real-time code update event.
 */
export interface CodeUpdatePayload {
  collaborationId: string;
  code: string;
  // You might add cursor position, selection, etc., for more advanced real-time editing
  // cursorPosition?: { lineNumber: number; column: number; };
  // selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; };
}

/**
 * Represents a message within a collaborative session's chat.
 */
export interface ChatMessage {
  id: string;
  collaborationId: string;
  userId: string;
  message: string;
  type: 'text' | 'code' | 'system'; // text message, code snippet, or system notification
  createdAt: string; // ISO 8601 string date

  // Relationships (included when fetched with the message)
  user?: User; // The user who sent the message
}

/**
 * Represents a participant in a live collaboration session.
 * This is typically managed by the Socket.io server.
 */
export interface CollaborationParticipant {
  id: string; // User ID
  username: string;
  avatar?: string | null;
  // Add more info like cursor position if implementing shared cursors
  // cursor?: { lineNumber: number; column: number; };
}

/**
 * Data structure for creating a new collaboration session.
 */
export interface CreateCollaborationPayload {
  title: string;
  description?: string;
  code: string;
  language: string;
}