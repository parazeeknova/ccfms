export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance.toFixed(1)} m`
  }
  return `${(distance / 1000).toFixed(1)} km`
}

export function formatLargeNumber(num: number): string {
  if (num < 1000) {
    return num.toString()
  }

  if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`
  }

  if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }

  return `${(num / 1000000000).toFixed(1)}B`
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'critical':
      return 'text-red-600 bg-red-100'
    case 'high':
      return 'text-red-500 bg-red-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'low':
      return 'text-green-600 bg-green-100'
    case 'active':
      return 'text-green-600 bg-green-100'
    case 'inactive':
      return 'text-gray-600 bg-gray-100'
    case 'warning':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getIndicatorColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'critical':
      return 'bg-red-500'
    case 'high':
      return 'bg-red-400'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-green-500'
    case 'active':
      return 'bg-green-500'
    case 'inactive':
      return 'bg-gray-400'
    case 'warning':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}
