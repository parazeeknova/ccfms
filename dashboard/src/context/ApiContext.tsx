import type { ReactNode } from 'react'
import type { DashboardConfig } from '../types'
import React, { createContext, useContext } from 'react'
import { ApiClient } from '../services'
import { DEFAULT_CONFIG } from '../types'

interface ApiContextType {
  apiClient: ApiClient
  config: DashboardConfig
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

interface ApiProviderProps {
  children: ReactNode
  config?: Partial<DashboardConfig>
}

export function ApiProvider({ children, config = {} }: ApiProviderProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }
  const apiClient = new ApiClient(mergedConfig)

  return (
    <ApiContext.Provider value={{ apiClient, config: mergedConfig }}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi(): ApiContextType {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}
