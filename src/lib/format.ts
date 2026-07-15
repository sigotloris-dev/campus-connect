// Computes age from a birth date
export function calcAge(birthDate: Date | string): number {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

// Days left until departure (>= 0)
export function daysUntil(departureDate: Date | string): number {
  const dep = new Date(departureDate);
  const now = new Date();
  const ms = dep.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// Human-readable label for the time left on campus
export function timeRemainingLabel(departureDate: Date | string): string {
  const days = daysUntil(departureDate);
  if (days <= 0) return "Leaving soon";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} left`;
  if (days < 30) {
    const w = Math.round(days / 7);
    return `~${w} week${w === 1 ? "" : "s"} left`;
  }
  const months = Math.round(days / 30);
  return `~${months} month${months === 1 ? "" : "s"} left`;
}

// Formats date + time for a meetup proposal
export function formatDateTime(value: Date | string): string {
  return new Date(value).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// HH:mm time for chat
export function formatTime(value: Date | string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
