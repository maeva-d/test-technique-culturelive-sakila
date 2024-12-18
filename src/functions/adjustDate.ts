export function adjustDate(
  date: Date,
  daysToAdd: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number,
): Date {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() + daysToAdd);
  adjustedDate.setHours(hours, minutes, seconds, milliseconds);
  return adjustedDate;
}
