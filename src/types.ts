export interface Ticket {
  id: string;
  number: string; // e.g., "C-03", "P-01"
  identifier: string; // RUT or Passport
  type: 'general' | 'preferencial';
  status: 'waiting' | 'called' | 'completed' | 'no-show';
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
  counterId?: number; // Ventanilla ID
  estimatedWaitMinutes: number;
}

export interface Counter {
  id: number;
  name: string; // e.g., "Ventanilla 1"
  agentName: string;
  status: 'idle' | 'serving' | 'offline';
  currentTicketId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}
