// File: src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTokens = (likes: number, comments: number, likesToToken: number, commentsToToken: number) => {
  return Math.floor(likes / likesToToken) + Math.floor(comments / commentsToToken);
};

export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const getKolName = (kolId: number, kols: any[]): string => {
  const kol = kols.find(k => k.id === kolId);
  return kol ? kol.name : 'Unknown KOL';
};

export const getKolAvatar = (kolId: string, kols: Array<{ id: string; avatar: string; }>) => {
  const kol = kols.find(k => k.id === kolId);
  return kol ? kol.avatar : '';
};