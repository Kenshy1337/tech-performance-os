import { format } from "date-fns"

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

export function clampDateRange(startKey: string, endKey: string): [string, string] {
  return startKey <= endKey ? [startKey, endKey] : [endKey, startKey]
}

export function buildDateKeyRange(startKey: string, endKey: string): string[] {
  const [start, end] = clampDateRange(startKey, endKey)
  const dates: string[] = []
  let current = fromDateKey(start)
  const endDate = fromDateKey(end)
  while (current <= endDate) {
    dates.push(toDateKey(current))
    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1)
  }
  return dates
}
