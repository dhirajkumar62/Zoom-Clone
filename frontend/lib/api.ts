import {
  Meeting,
  MeetingCreatePayload,
  MeetingSchedulePayload,
  ParticipantJoinPayload,
  JoinMeetingResponse,
  Participant
} from './types';
import { getStoredToken } from './auth';

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const cleanUrl = envUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // Use fallback error message
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
  return handleResponse<{ status: string }>(res);
}

export async function createInstantMeeting(payload: MeetingCreatePayload = {}): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/meetings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title: 'Instant Meeting', ...payload }),
  });
  return handleResponse<Meeting>(res);
}

export async function scheduleMeeting(payload: MeetingSchedulePayload): Promise<Meeting> {
  const res = await fetch(`${API_BASE_URL}/meetings/schedule`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<Meeting>(res);
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE_URL}/meetings/upcoming`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<Meeting[]>(res);
}

export async function getRecentMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${API_BASE_URL}/meetings/recent`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<Meeting[]>(res);
}

export async function getMeetingDetails(meetingId: string): Promise<Meeting> {
  const cleanId = meetingId.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<Meeting>(res);
}

export async function joinMeeting(meetingId: string, displayName?: string): Promise<JoinMeetingResponse> {
  const cleanId = meetingId.replace(/\D/g, '');
  const payload: ParticipantJoinPayload = { display_name: displayName };
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}/join`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<JoinMeetingResponse>(res);
}

export async function getMeetingParticipants(meetingId: string): Promise<Participant[]> {
  const cleanId = meetingId.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}/participants`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<Participant[]>(res);
}

export async function updateParticipantRole(
  meetingId: string,
  participantId: number,
  role: string
): Promise<Participant> {
  const cleanId = meetingId.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}/participants/${participantId}/role`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse<Participant>(res);
}

export async function removeParticipant(meetingId: string, participantId: number): Promise<Participant> {
  const cleanId = meetingId.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}/participants/${participantId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse<Participant>(res);
}

export async function muteAllParticipants(meetingId: string): Promise<{ message: string; muted_count: number }> {
  const cleanId = meetingId.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}/mute-all`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse<{ message: string; muted_count: number }>(res);
}

export async function leaveMeeting(meetingId: string, participantId?: number): Promise<Participant> {
  const cleanId = meetingId.replace(/\D/g, '');
  const url = participantId
    ? `${API_BASE_URL}/meetings/${cleanId}/leave?participant_id=${participantId}`
    : `${API_BASE_URL}/meetings/${cleanId}/leave`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse<Participant>(res);
}

export async function endMeeting(meetingId: string): Promise<Meeting> {
  const cleanId = meetingId.replace(/\D/g, '');
  const res = await fetch(`${API_BASE_URL}/meetings/${cleanId}/end`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse<Meeting>(res);
}

/* ============================================================================
 * ADMIN API CALLS
 * ============================================================================ */

export async function fetchAdminDashboardStats(): Promise<import('./types').AdminDashboardStats> {
  const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<import('./types').AdminDashboardStats>(res);
}

export async function fetchAdminUsers(
  query?: string,
  role?: string,
  isActive?: boolean
): Promise<import('./types').User[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (role) params.append('role', role);
  if (isActive !== undefined && isActive !== null) params.append('is_active', String(isActive));

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/admin/users${queryString}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<import('./types').User[]>(res);
}

export async function updateUserRole(userId: number, role: string): Promise<import('./types').User> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse<import('./types').User>(res);
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<import('./types').User> {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ is_active: isActive }),
  });
  return handleResponse<import('./types').User>(res);
}

export async function fetchAdminMeetings(
  query?: string,
  status?: string
): Promise<import('./types').AdminMeeting[]> {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (status) params.append('status', status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/admin/meetings${queryString}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<import('./types').AdminMeeting[]>(res);
}

export async function fetchAdminParticipants(meetingId?: string): Promise<Participant[]> {
  const params = new URLSearchParams();
  if (meetingId) params.append('meeting_id', meetingId);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE_URL}/admin/participants${queryString}`, {
    headers: getHeaders(),
    cache: 'no-store',
  });
  return handleResponse<Participant[]>(res);
}

