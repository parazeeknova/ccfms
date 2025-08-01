export interface Vehicle {
  id: number
  vin: string
  manufacturer: string
  model: string
  fleetId: string
  ownerOperator: {
    name: string
    contact: string
    department?: string
  }
  registrationStatus: 'Active' | 'Maintenance' | 'Decommissioned'
  createdAt: Date
  updatedAt: Date
}

export interface TelemetryData {
  id: number
  vehicleVin: string
  latitude: number
  longitude: number
  speed: number
  engineStatus: 'On' | 'Off' | 'Idle'
  fuelBatteryLevel: number
  odometerReading: number
  diagnosticCodes?: string[]
  timestamp: Date
  createdAt: Date
}

export interface Alert {
  id: number
  vehicleVin: string
  telemetryId?: number
  alertType: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  message: string
  resolved: boolean
  createdAt: Date
  resolvedAt?: Date
}

export interface FleetAnalytics {
  activeVehicles: number
  inactiveVehicles: number
  totalVehicles: number
  averageFuelLevel: number
  totalDistanceLast24h: number
  alertSummary: AlertSummary
  lastUpdated: Date
}

export interface ActivityStatus {
  active: number
  inactive: number
  inactiveThreshold: number
}

export interface FuelAnalytics {
  averageFuelLevel: number
  lowFuelVehicles: number
  criticalFuelVehicles: number
  fleetId?: string
  lastUpdated: Date
}

export interface DistanceAnalytics {
  totalDistance: number
  averageDistancePerVehicle: number
  timeWindow: number // hours
  vehicleCount: number
  fleetId?: string
  lastUpdated: Date
}

export interface AlertSummary {
  byType: Record<string, number>
  bySeverity: Record<string, number>
  total: number
  timeWindow: number // hours
  lastUpdated: Date
}

export interface VehicleActivity {
  vehicleVin: string
  isActive: boolean
  lastTelemetryTime: Date | null
  hoursInactive: number
}

export interface VehicleDistance {
  vehicleVin: string
  startOdometer: number
  endOdometer: number
  distanceTraveled: number
  timeWindow: number
}

export interface VehicleFuelStatus {
  vehicleVin: string
  currentFuelLevel: number
  lastUpdated: Date
  isLowFuel: boolean
  isCriticalFuel: boolean
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: Date
  metadata?: {
    responseTime: number
    cached?: boolean
    count?: number
  }
}

// Dashboard-Specific Types
export interface DashboardConfig {
  refreshIntervals: {
    fleet: number
    alerts: number
    activity: number
    fuel: number
    distance: number
    telemetry: number
  }
  apiBaseUrl: string
  autoRefreshEnabled: boolean
}

export interface ComponentState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface FilterState {
  activeOnly: boolean
  inactiveOnly: boolean
  sortBy: 'vin' | 'lastActivity' | 'inactiveHours'
  sortOrder: 'asc' | 'desc'
}

export interface TelemetryTrendData {
  speedTrends: Array<{ timestamp: Date, averageSpeed: number, maxSpeed: number }>
  fuelTrends: Array<{ timestamp: Date, averageFuelLevel: number }>
  engineStatusDistribution: Array<{ status: string, count: number, percentage: number }>
  activityHeatmap: Array<{ hour: number, day: string, activeVehicles: number }>
  timeRange: '1h' | '6h' | '24h' | '7d'
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export const DEFAULT_CONFIG: DashboardConfig = {
  refreshIntervals: {
    fleet: 30000, // 30 seconds
    alerts: 15000, // 15 seconds
    activity: 30000, // 30 seconds
    fuel: 45000, // 45 seconds
    distance: 60000, // 60 seconds
    telemetry: 60000, // 60 seconds
  },
  apiBaseUrl: 'http://localhost:3000',
  autoRefreshEnabled: true,
}
