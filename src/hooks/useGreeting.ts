import { formatGreeting } from "@/lib/format";

export function useGreeting(name: string): string {
  return formatGreeting(name);
}
