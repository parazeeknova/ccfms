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
