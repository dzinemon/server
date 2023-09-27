import React, { useContext, createContext, useState } from 'react'

export const ResourcesContext = createContext(null)

export default function ResourcesContextProvider({ children }) {
  const [resources, setResources] = useState([])

  return (
    <ResourcesContext.Provider value={{ resources, setResources }}>
      {children}
    </ResourcesContext.Provider>
  )
}

export function useResourcesContext() {
  const context = useContext(ResourcesContext)
  if (context === undefined) {
    throw new Error(
      'useResourcesContext must be used within a ResourcesContextProvider'
    )
  }
  return context
}
