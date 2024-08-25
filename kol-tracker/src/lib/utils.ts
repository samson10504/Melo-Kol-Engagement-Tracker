// File: src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTokens = (likes: number, comments: number, likesToToken: number, commentsToToken: number) => {
  return Math.floor(likes / likesToToken) + Math.floor(comments / commentsToToken);
};

export const formatDate = (dateString: string, useHKTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return the original string if it's an invalid date
  if (useHKTime) {
    return date.toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' });
  }
  return dateString; // Return the original date string for creation_date
};

export const getKolName = (kolId: number, kols: any[]): string => {
  const kol = kols.find(k => k.id === kolId);
  return kol ? kol.name : 'Unknown KOL';
};

export const getKolAvatar = (kolId: string, kols: Array<{ id: string; avatar: string; }>) => {
  const kol = kols.find(k => k.id === kolId);
  return kol ? kol.avatar : '';
};