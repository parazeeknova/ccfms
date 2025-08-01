export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`
}

export function formatAbsoluteTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function getTimeRangeDates(range: '1h' | '6h' | '24h' | '7d'): { startTime: Date, endTime: Date } {
  const endTime = new Date()
  const startTime = new Date()

  switch (range) {
    case '1h':
      startTime.setHours(startTime.getHours() - 1)
      break
    case '6h':
      startTime.setHours(startTime.getHours() - 6)
      break
    case '24h':
      startTime.setDate(startTime.getDate() - 1)
      break
    case '7d':
      startTime.setDate(startTime.getDate() - 7)
      break
  }

  return { startTime, endTime }
}
