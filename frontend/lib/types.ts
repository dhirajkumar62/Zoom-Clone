export type AccountRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type MeetingRole = 'HOST' | 'CO_HOST' | 'PARTICIPANT';

export interface User {
  id: number;
  name: string;
  email: string;
  account_role: AccountRole;
  role: string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id: number;
  display_name: string;
  meeting_role: MeetingRole;
  joined_at: string;
  left_at: string | null;
  email?: string;
  is_muted?: boolean;
  is_removed?: boolean;
}

export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  host_user_id: number;
  host_name?: string;
  scheduled_at: string | null;
  duration_minutes: number | null;
  invite_link: string;
  status: 'scheduled' | 'active' | 'ended';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  participants: Participant[];
}

export interface MeetingCreatePayload {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  host_user_id?: number;
}

export interface MeetingSchedulePayload {
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  host_user_id?: number;
}

export interface ParticipantJoinPayload {
  display_name?: string;
}

export interface JoinMeetingResponse {
  meeting_id: string;
  participant_id: number;
  user_id: number;
  display_name: string;
  meeting_role: MeetingRole;
  joined_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  active_users: number;
  total_meetings: number;
  active_meetings: number;
  scheduled_meetings: number;
  total_participants: number;
}

export interface AdminMeeting extends Meeting {
  participants_count?: number;
}

