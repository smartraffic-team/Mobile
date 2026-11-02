export type TicketStatus = 'open' | 'inProgress' | 'done' | 'cancelled';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCameraStatus = 'online' | 'offline' | 'maintenance';

export type TicketHistoryEntry = {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  actor?: string;
  status: 'complete' | 'current' | 'pending' | 'skipped';
};

export type TicketComment = {
  id: string;
  author: string;
  message: string;
  time: string;
};

export type TicketAttachment = {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
};

export type Ticket = {
  id: string;
  cameraId: string;
  cameraAddress: string;
  neighborhood: string;
  cameraStatus: TicketCameraStatus;
  cameraModel?: string;
  issueType: string;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  openedAt: string;
  openedBy: string;
  assignee: string | null;
  history: TicketHistoryEntry[];
  comments: TicketComment[];
  attachment?: TicketAttachment;
};

export type TicketSummary = {
  open: number;
  inProgress: number;
  done: number;
};

export type TicketFilters = {
  status?: Exclude<TicketStatus, 'cancelled'>;
  priority?: TicketPriority;
};

export type CreateTicketPayload = {
  cameraId: string;
  cameraAddress: string;
  neighborhood: string;
  cameraStatus: TicketCameraStatus;
  issueType: string;
  priority: TicketPriority;
  description: string;
  attachment?: TicketAttachment;
};
