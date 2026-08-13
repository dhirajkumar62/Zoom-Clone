import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format raw 9-digit meeting ID (e.g. 482719365) into human readable "482 719 365"
 */
export function formatMeetingId(rawId: string): string {
  const clean = rawId.replace(/\D/g, '');
  if (clean.length === 9) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
  }
  return rawId;
}

/**
 * Normalizes input (e.g. "482 719 365" or "http://localhost:3000/meeting/482719365") into clean ID
 */
export function extractMeetingId(input: string): string {
  const trimmed = input.trim();
  // Check if input is full URL or path
  const match = trimmed.match(/\/meeting\/([a-zA-Z0-9\s-]+)/);
  if (match && match[1]) {
    return match[1].replace(/\D/g, '');
  }
  return trimmed.replace(/\D/g, '');
}
