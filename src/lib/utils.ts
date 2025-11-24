import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: number | string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = now.getTime() - past.getTime();

  if (elapsed < msPerMinute) {
    return `${Math.round(elapsed / 1000)}s ago`;
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)}m ago`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)}h ago`;
  } else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)}d ago`;
  } else if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)}mo ago`;
  } else {
    return `${Math.round(elapsed / msPerYear)}y ago`;
  }
}

export function humanizeStatus(status: string): string {
  // Handle special statuses
  if (status === "success") return "Success";
  if (status === "failure") return "Failure";
  if (status === "queued") return "Queued";
  if (status === "in_progress") return "In Progress";

  // Convert snake_case/underscore_separated to Title Case
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
