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
