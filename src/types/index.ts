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

export interface AlertTypeCount {
  alertType: string
  count: number
}

export interface AlertSeverityCount {
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  count: number
}

export interface AnalyticsQueryParams {
  fleetId?: string
  timeWindow?: number
  startTime?: Date
  endTime?: Date
}

export interface ActivityQueryParams extends AnalyticsQueryParams {
  inactiveThreshold?: number
}

export interface AlertSummaryQueryParams extends AnalyticsQueryParams {
  resolved?: boolean
  alertTypes?: string[]
  severities?: ('Low' | 'Medium' | 'High' | 'Critical')[]
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

export interface AlertRule {
  type: 'SPEED_VIOLATION' | 'LOW_FUEL_BATTERY' | 'ENGINE_FAULT' | 'MAINTENANCE_DUE'
  condition: (telemetry: TelemetryData) => boolean
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  cooldownPeriod: number
  enabled: boolean
}

export interface SpeedViolationRule extends AlertRule {
  type: 'SPEED_VIOLATION'
  speedLimit: number
  tolerancePercentage?: number
}

export interface LowFuelRule extends AlertRule {
  type: 'LOW_FUEL_BATTERY'
  lowThreshold: number
  criticalThreshold: number
}

export interface AlertDeduplication {
  vehicleVin: string
  alertType: string
  lastTriggered: Date
  cooldownPeriod: number
  isActive: boolean
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ValidationError {
  field: string
  message: string
  value?: any
}

export interface AnalyticsValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
