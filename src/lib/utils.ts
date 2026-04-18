import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidId(id: string) {
  return id && id.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(id);
}
