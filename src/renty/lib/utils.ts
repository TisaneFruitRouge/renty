import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  const words = name.split(" ");
  let initials = "";

  words.forEach((word) => {
    initials += word.charAt(0).toUpperCase();
  });

  return initials;
}