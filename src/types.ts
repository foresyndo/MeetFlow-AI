export type TaskStatus = 'Open' | 'Progress' | 'Done' | 'Cancel';
export type MinutesStatus = 'Draft' | 'Review' | 'Approved';

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: 'Contractor' | 'Manager' | 'Director' | 'Employee';
  avatarUrl?: string;
}

export interface Meeting {
  id: string;
  title: string;
  company: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  category: string; // e.g. 'Meeting Kontraktor', 'Meeting Direksi', 'Meeting Marketing', 'Meeting Finance', 'Weekly Project', 'Monthly Review'
  participants: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  minutesStatus: MinutesStatus;
  transcription?: string;
  isRecording?: boolean;
  recordingDuration?: number; // seconds
}

export interface ActionItem {
  id: string;
  meetingId: string;
  agendaItemId: string;
  title: string;
  pic: string;
  deadline: string; // YYYY-MM-DD
  status: TaskStatus;
}

export interface AgendaItem {
  id: string;
  meetingId: string;
  title: string;
  order: number;
  completed: boolean;
  notes: string; // Rich Text / HTML
  decisions: string; // Rich Text / HTML
  pic: string;
  deadline: string;
  status: TaskStatus;
  actionItems: ActionItem[];
}

export interface Attachment {
  id: string;
  meetingId: string;
  name: string;
  size: string;
  type: string; // 'pdf' | 'doc' | 'xls' | 'image' | 'video' | 'dwg' | 'other'
  url: string;
  uploadedAt: string;
}

export interface ApprovalLog {
  id: string;
  meetingId: string;
  from: string;
  to: string;
  roleFrom: string;
  roleTo: string;
  status: MinutesStatus;
  notes: string;
  timestamp: string;
}

export interface Company {
  id: string;
  name: string;
}
