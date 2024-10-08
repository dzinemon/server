// create user context to store user information, such as name, email, and role, image etc

import { createContext, useContext, useState } from 'react'
import { useSession } from 'next-auth/react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const { data: session } = useSession()

  const [currentUser, setCurrentUser] = useState(session?.user)

  return <UserContext.Provider value={{ currentUser, setCurrentUser }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)

  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
