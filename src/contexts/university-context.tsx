'use client'

import { createContext, useContext, ReactNode } from 'react'

type UniversityContextType = {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string | null
}

const UniversityContext = createContext<UniversityContextType | null>(null)

export function useUniversity() {
  const context = useContext(UniversityContext)
  if (!context) {
    throw new Error('useUniversity must be used within UniversityProvider')
  }
  return context
}

export function UniversityProvider({
  university,
  children,
}: {
  university: UniversityContextType
  children: ReactNode
}) {
  return (
    <UniversityContext.Provider value={university}>
      {children}
    </UniversityContext.Provider>
  )
}
