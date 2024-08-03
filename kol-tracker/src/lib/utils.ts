// File: src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateTokens = (likes: number, views: number, likesToToken: number, viewsToToken: number) => {
  return Math.floor(likes / likesToToken) + Math.floor(views / viewsToToken);
};

export const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getKolName = (kolId: string, kols: Array<{ id: string; name: string; }>) => {
  const kol = kols.find(k => k.id === kolId);
  return kol ? kol.name : 'Unknown KOL';
};

export const getKolAvatar = (kolId: string, kols: Array<{ id: string; avatar: string; }>) => {
  const kol = kols.find(k => k.id === kolId);
  return kol ? kol.avatar : '';
};